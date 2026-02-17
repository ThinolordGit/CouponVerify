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
     * Send a push notification to admins for a new refund request
     */
    public function notifyAdminsNewRefund($refund, $coupon = null) {
        try {
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
                'title' => 'Refund request',
                'body' => "A new " . ($coupon['name'] ?? ($refund['coupon_type'] ?? 'refund')) . " refund for an amount of {$refund['amount']} {$refund['currency']} has been launched\nFrom: {$refund['email']}",
                'image' => $coupon['logo'] ?? '',
                'couponImage' => $coupon['logo'] ?? '',
                'couponId' => $coupon['id'] ?? ($refund['coupon_id'] ?? null),
                'couponName' => $coupon['name'] ?? ($refund['coupon_type'] ?? ''),
                'url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:4028') . '/admin-dashboard/refunds',
                'requireInteraction' => true,
                'tag' => 'refund-' . ($refund['id'] ?? time())
            ];

            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                try {
                    if (!$row['subscription']) continue;
                    $sub = json_decode($row['subscription'], JSON_PRETTY_PRINT);
                    $subscription = Subscription::create([
                        'endpoint' => $sub['endpoint'],
                        'publicKey' => $sub['keys']['p256dh'],
                        'authToken' => $sub['keys']['auth'],
                        'contentEncoding' => 'aes128gcm'
                    ]);
                    $this->webPush->queueNotification($subscription, json_encode($payload));
                    $notificationCount++;
                } catch (\Exception $e) {
                    error_log("Error queueing admin refund notification: " . $e->getMessage());
                }
            }

            if ($notificationCount > 0) $this->flushNotifications();
            return true;
        } catch (\Exception $e) {
            error_log('Error notifying admins about refund: ' . $e->getMessage());
            return true;
        }
    }

    /**
     * Send a push notification to client for a refund status change
     */
    public function notifyClientRefundStatusUpdate($refund, $status = null, $userUUID = null, $coupon = null) {
        if ($status) $refund['status'] = $status;
        try {
            if (!$userUUID) {
                error_log('No user UUID provided for refund notification');
                return false;
            }

            $sql = "SELECT subscription FROM push_subscriptions WHERE user_uuid = ? AND admin_id IS NULL LIMIT 1";
            $stmt = $this->sqlHelper->db->prepare($sql);
            $stmt->execute([$userUUID]);
            if ($stmt->rowCount() === 0) return false;

            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row || !$row['subscription']) return false;
            $sub = json_decode($row['subscription'], JSON_PRETTY_PRINT);
            $subscription = Subscription::create([
                'endpoint' => $sub['endpoint'],
                'publicKey' => $sub['keys']['p256dh'],
                'authToken' => $sub['keys']['auth'],
                'contentEncoding' => 'aes128gcm'
            ]);
            
            // Use status-configured title/message for refunds so wording matches verification notifications
            // Use refund-specific status config (separated from verification configs)
            $statusConfig = $this->getRefundStatusConfig($refund['status'] ?? 'pending');
            $title = "Refund Status Updated - {$statusConfig['title']}";
            $body = $statusConfig['message'] . ' (Ref: ' . ($refund['reference'] ?? '') . ')';
            
            $payload = [
                'title' => $title,
                'body' => $body,
                'image' => $coupon['logo'] ?? '', 
                'couponImage' => $coupon['logo'] ?? '',
                'couponId' => $coupon['id'] ?? ($refund['coupon_id'] ?? null),
                'couponName' => $coupon['name'] ?? ($refund['coupon_type'] ?? ''),
                'url' => ($_ENV['FRONTEND_URL'] ?? 'http://localhost:4028') . '/refunds',
                'tag' => 'refund-status-' . ($refund['reference'] ?? $refund['id'] ?? time()),
                'status' => $refund['status'],
                'requireInteraction' => true,
            ];

            $this->webPush->queueNotification($subscription, json_encode($payload));
            $this->flushNotifications();
            return true;
        } catch (\Exception $e) {
            error_log('Error sending refund client notification: ' . $e->getMessage());
            return false;
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
     * Get verification status configuration
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

    /**
     * Get refund status configuration (separate from verification)
     */
    private function getRefundStatusConfig($status) {
        $configs = [
            'pending' => [
                'title' => '⏳ Pending',
                'message' => 'Your refund request has been received and is under review. We will update you shortly.'
            ],
            'approved' => [
                'title' => '✓ Approved',
                'message' => 'Good news — your refund has been approved. The amount will be returned to the original payment method within a few business days.'
            ],
            'rejected' => [
                'title' => '✗ Rejected',
                'message' => 'We are sorry — your refund request was rejected. Check the reason in your dashboard or contact support for help.'
            ],
            'blocked' => [
                'title' => '⚠ Under review',
                'message' => 'Your refund has been flagged for manual review. Our team will investigate and get back to you.'
            ]
        ];

        return $configs[$status] ?? $configs['pending'];
    }
}
?>
