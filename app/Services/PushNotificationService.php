<?php
/**
 * app/Services/PushNotificationService.php - Service for sending push notifications
 */

namespace App\Services;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationService {
    
    private $webPush;
    private $sqlHelper;

    public function __construct($sqlHelper) {
        $this->sqlHelper = $sqlHelper;
        
        // Configure WebPush
        $auth = [
            'VAPID' => [
                'subject' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
                'publicKey' => $_ENV['VAPID_PUBLIC_KEY'] ?? '',
                'privateKey' => $_ENV['VAPID_PRIVATE_KEY'] ?? '',
            ]
        ];
        
        $this->webPush = new WebPush($auth);
    }

    /**
     * Send a push notification to admins for a new verification
     */
    public function notifyAdminsNewVerification($verification, $coupon) {
        try {
            // Retrieve admin subscriptions (identifier "**" for multi-device)
            $sql = "SELECT ps.subscription FROM push_subscriptions ps
                    WHERE ps.user_uuid = '**' AND ps.subscription IS NOT NULL LIMIT 10";
            
            $stmt = $this->sqlHelper->db->prepare($sql);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                error_log("No admin push subscriptions found (user_uuid='**')");
                return false;
            }

            $notificationCount = 0;
            $payload = [
                'title' => 'Checking - ' . $coupon['name'],
                'body' => "A new {$coupon['name']} check for an amount of {$verification['amount']} {$verification['currency']} has been launched\nFrom: {$verification['email']}",
                'image' => $coupon['logo'] ?? '',
                'couponImage' => $coupon['logo'] ?? '',
                'couponId' => $coupon['id'],
                'verificationId' => $verification['id'],
                'url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:4028') . '/admin-dashboard/verifications',
                'requireInteraction' => true,
                'tag' => 'verification-' . $verification['id']
            ];

            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                try {
                    if (!$row['subscription']) {
                        continue;
                    }
                    $sub = json_decode($row['subscription'], JSON_PRETTY_PRINT);
                    // file_put_contents("logs.json", json_encode($sub, JSON_PRETTY_PRINT));
                    $subscription = Subscription::create([
                        'endpoint' => $sub['endpoint'],
                        'publicKey' => $sub['keys']['p256dh'],
                        'authToken' => $sub['keys']['auth'],
                        'contentEncoding' => 'aes128gcm'
                    ]);
                    $this->webPush->queueNotification(
                        $subscription,
                        json_encode($payload)
                    );
                    $notificationCount++;
                } catch (\Exception $e) {
                    error_log("Error queueing admin notification: " . $e->getMessage());
                    // Continue to next subscription
                }
            }

            // Send all notifications in batch (with timeout protection)
            if ($notificationCount > 0) {
                $this->flushNotifications();
            }
            
            error_log("Sent {$notificationCount} admin notifications for verification {$verification['id']}");
            return true;

        } catch (\Exception $e) {
            error_log("Error notifying admins: " . $e->getMessage());
            // Don't block request on push errors
            return true;
        }
    }

    /**
     * Send a push notification to client for a status change
     */
    public function notifyClientStatusUpdate($verification, $coupon, $status = null, $userUUID = null) {
        if ($status) {
            $verification['status'] = $status;
        }
        try {
            // Get client subscription by UUID
            if (!$userUUID) {
                error_log("No user UUID provided for status notification");
                return false;
            }

            $sql = "SELECT subscription FROM push_subscriptions 
                    WHERE user_uuid = ? AND admin_id IS NULL
                    LIMIT 1";
            
            $stmt = $this->sqlHelper->db->prepare($sql);
            $stmt->execute([$userUUID]);

            if ($stmt->rowCount() === 0) {
                error_log("No client push subscription found for UUID: {$userUUID}");
                return false;
            }
            
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row || !$row['subscription']) {
                error_log("Invalid subscription data for {$verification['email']}");
                return false;
            }
            $sub = json_decode($row['subscription'], JSON_PRETTY_PRINT);
            // file_put_contents("logs.json", json_encode($sub, JSON_PRETTY_PRINT));
            $subscription = Subscription::create([
                'endpoint' => $sub['endpoint'],
                'publicKey' => $sub['keys']['p256dh'],
                'authToken' => $sub['keys']['auth'],
                'contentEncoding' => 'aes128gcm'
            ]);

            // Determine title and message based on status
            $statusConfig = $this->getStatusConfig($verification['status']);

            $payload = [
                'title' => "Verification Status Updated - {$statusConfig['title']}",
                'body' => $statusConfig['message'],
                'image' => $coupon['logo'] ?? '', 
                'couponImage' => $coupon['logo'] ?? '', 
                'couponId' => $coupon['id'],
                'verificationId' => $verification['id'],
                'status' => $verification['status'],
                'url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:4028') . "/verification/{$coupon['slug']}",
                'requireInteraction' => true,
                'tag' => 'verification-status-' . $verification['id']
            ];

            $this->webPush->queueNotification(
                $subscription,
                json_encode($payload)
            );

            $this->flushNotifications();
            
            error_log("Sent client notification: {$verification['email']}");
            return true;

        } catch (\Exception $e) {
            error_log("Error notifying client: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a generic push notification
     */
    public function sendGenericNotification($endpoint, $payload) {
        try {
            $sql = "SELECT subscription FROM push_subscriptions 
                    WHERE endpoint = ? LIMIT 1";
            
            $stmt = $this->sqlHelper->db->prepare($sql);
            $stmt->execute([$endpoint]);

            if ($stmt->rowCount() === 0) {
                error_log("Subscription not found for endpoint: {$endpoint}");
                return false;
            }

            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row || !$row['subscription']) {
                error_log("Invalid subscription data for endpoint: {$endpoint}");
                return false;
            }
            
            $subscription = Subscription::create($row['subscription']);

            $this->webPush->queueNotification(
                $subscription,
                json_encode($payload)
            );

            $this->flushNotifications();
            return true;

        } catch (\Exception $e) {
            error_log("Error sending generic notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send all pending notifications
     */
    private function flushNotifications() {
        try {
            // Set a timeout to prevent hanging
            $timeout = 5; // 5 second timeout for flush
            $start = time();
            
            foreach ($this->webPush->flush() as $report) {
                // Check timeout
                if (time() - $start > $timeout) {
                    error_log("Push flush timeout - stopping batch");
                    break;
                }
                
                if ($report->isSuccess()) {
                    error_log("Push notification sent successfully");
                } else {
                    error_log("Push notification failed: " . $report->getReason());
                }
            }
        } catch (\Exception $e) {
            // Don't let push errors block request
            error_log("Push flush error (non-blocking): " . $e->getMessage());
        }
    }

    /**
     * Get status configuration
     */
    private function getStatusConfig($status) {
        $configs = [
            'valid' => [
                'title' => '✓ Approved',
                'message' => 'Your coupon has been verified successfully and is valid. You can now use it for your transaction.'
            ],
            'approved' => [
                'title' => '✓ Approved',
                'message' => 'Your coupon has been verified successfully and is valid. You can now use it for your transaction.'
            ],
            'invalid' => [
                'title' => '✗ Rejected',
                'message' => 'Unfortunately, your coupon could not be verified as valid. Please check the information you provided and try again.'
            ],
            'rejected' => [
                'title' => '✗ Rejected',
                'message' => 'Unfortunately, your coupon could not be verified as valid. Please check the information you provided and try again.'
            ],
            'blocked' => [
                'title' => '⚠ Blocked',
                'message' => 'Your coupon has been flagged for security reasons and cannot be used. Please contact our support team.'
            ],
            'duplicate' => [
                'title' => '⊘ Duplicate',
                'message' => 'This coupon has been previously verified. Please check your records or contact support.'
            ],
            'pending' => [
                'title' => '⏳ Pending',
                'message' => 'Your verification is still being processed. We will send you an update shortly.'
            ]
        ];

        return $configs[$status] ?? $configs['pending'];
    }
}
?>
