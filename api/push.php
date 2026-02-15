<?php
/**
 * api/push.php - Web Push Notification Endpoints
 * Manages subscriptions and sending push notifications
 */

require_once __DIR__ . '/../config/database.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$method = $_SERVER['REQUEST_METHOD'];
$action = $GLOBALS['action'] ?? '';

// Config push
$auth = [
    'VAPID' => [
        'subject' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
        'publicKey' => $_ENV['VAPID_PUBLIC_KEY'] ?? '',
        'privateKey' => $_ENV['VAPID_PRIVATE_KEY'] ?? '',
    ]
];

try {
    switch ($action) {
        case 'public-key':
            handlePublicKey();
            break;

        case 'subscribe':
            handleSubscribe();
            break;

        case 'send':
            handleSendNotification($auth);
            break;

        case 'notify-admin':
            handleNotifyAdmin($auth);
            break;

        case 'notify-client':
            handleNotifyClient($auth);
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Push action not found',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("Push API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Return VAPID public key
 */
function handlePublicKey() {
    $publicKey = $_ENV['VAPID_PUBLIC_KEY'] ?? '';
    
    if (!$publicKey) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'VAPID public key not configured',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        return;
    }

    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'publicKey' => $publicKey,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Register a push subscription
 */
function handleSubscribe() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['subscription']) || !isset($data['subscription']['endpoint'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid subscription data']);
        return;
    }

    try {
        $subscription = json_encode($data['subscription']);
        $userUUID = $data['user_uuid'] ?? null;

        if (!$userUUID) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'user_uuid is required']);
            return;
        }
        
        // Insert or update the subscription using UUID instead of IP
        $query = "INSERT INTO push_subscriptions (endpoint, subscription, user_uuid, created_at, updated_at) 
                  VALUES (?, ?, ?, NOW(), NOW())";
        
        $stmt = $pdo->prepare($query);
        if (!$stmt) {
            throw new Exception("Prepare failed");
        }
        
        $endpoint = $data['subscription']['endpoint'];
        // file_put_contents("loggs.json", json_encode($data['subscription'],JSON_PRETTY_PRINT));
        $success = $stmt->execute([$endpoint, $subscription, $userUUID]);
        if (!$success) {
            throw new Exception("Execute failed");
        }

        error_log("Push subscription registered for UUID: {$userUUID}");

        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Subscription registered with UUID',
            'uuid' => $userUUID,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log("Subscribe error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to register subscription',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Notify admins of a new verification
 */
function handleNotifyAdmin($auth) {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['verification_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'verification_id required']);
        return;
    }

    try {
        // Retrieve verification information
        $query = "SELECT v.*, c.name as coupon_name, c.logo as coupon_logo, c.cover_image as coupon_cover
                  FROM verifications v
                  LEFT JOIN coupons c ON v.coupon_id = c.id
                  WHERE v.id = ?";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data['verification_id']]);
        $verification = $stmt->fetch();

        if (!$verification) {
            throw new Exception("Verification not found");
        }

        // Retrieve all admin subscriptions (user_uuid = '**')
        $query = "SELECT ps.subscription FROM push_subscriptions ps
                  WHERE ps.user_uuid = '**'";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $subscriptions = $stmt->fetchAll();
        
        $webPush = new WebPush($auth);
        $notificationCount = 0;

        foreach ($subscriptions as $row) {
            if (!$row['subscription']) continue;
            
            $subscription = Subscription::create($row['subscription']);
            
            $payload = json_encode([
                'title' => 'Checking - ' . $verification['coupon_name'],
                'body' => "A new {$verification['coupon_name']} check for an amount of {$verification['amount']} {$verification['currency']} has been launched\nFrom: {$verification['email']}",
                'couponImage' => $verification['coupon_cover'],
                'couponId' => $verification['coupon_id'],
                'verificationId' => $verification['id'],
                'url' => $_ENV['FRONTEND_URL'] . '/admin-dashboard/verifications',
                'requireInteraction' => true
            ]);

            $webPush->queueNotification($subscription, $payload);
            $notificationCount++;
        }

        // Envoyer toutes les notifications
        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                error_log("Admin notification sent successfully");
            } else {
                error_log("Admin notification failed: " . $report->getReason());
            }
        }

        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => "Admin notifications sent",
            'count' => $notificationCount,
            'timestamp' => date('Y-m-d H:i:s')
        ]);

    } catch (Exception $e) {
        error_log("Notify admin error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to send notifications',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Notifier un client du changement de statut
 */
function handleNotifyClient($auth) {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['verification_id']) || !isset($data['user_uuid'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'verification_id and user_uuid required']);
        return;
    }

    try {
        // Retrieve verification information
        $query = "SELECT v.*, c.name as coupon_name, c.logo as coupon_logo
                  FROM verifications v
                  LEFT JOIN coupons c ON v.coupon_id = c.id
                  WHERE v.id = ?";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data['verification_id']]);
        $verification = $stmt->fetch();

        if (!$verification) {
            throw new Exception("Verification not found");
        }

        // Retrieve client subscription by UUID
        $query = "SELECT subscription FROM push_subscriptions 
                  WHERE user_uuid = ? AND admin_id IS NULL
                  ORDER BY updated_at DESC LIMIT 1";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data['user_uuid']]);
        $subRow = $stmt->fetch();

        if (!$subRow) {
            // Pas de subscription, envoyer par email seulement
            error_log("No push subscription for UUID: {$data['user_uuid']}");
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'No push subscription available',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            return;
        }

        $subscription = Subscription::create($subRow['subscription']);
        $webPush = new WebPush($auth);

        // Déterminer le message du statut
        $statusMessages = [
            'approved' => 'Your coupon has been verified successfully!',
            'rejected' => 'Your coupon verification has been rejected.',
            'blocked' => 'Your coupon has been blocked for security reasons.',
            'duplicate' => 'Your coupon has been flagged as a duplicate.'
        ];

        $statusTitle = ucfirst($verification['status']);
        $statusMessage = $statusMessages[$verification['status']] ?? 'Your verification status has been updated.';

        $payload = json_encode([
            'title' => "Verification Status Updated - {$statusTitle}",
            'body' => $statusMessage,
            'couponImage' => $verification['coupon_logo'],
            'couponId' => $verification['coupon_id'],
            'verificationId' => $verification['id'],
            'status' => $verification['status'],
            'url' => $_ENV['FRONTEND_URL'] . '/user-dashboard',
            'requireInteraction' => true
        ]);

        $webPush->queueNotification($subscription, $payload);

        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                error_log("Client notification sent successfully");
            } else {
                error_log("Client notification failed: " . $report->getReason());
            }
        }

        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Client notification sent',
            'timestamp' => date('Y-m-d H:i:s')
        ]);

    } catch (Exception $e) {
        error_log("Notify client error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to send notification',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

/**
 * Envoyer une notification générique
 */
function handleSendNotification($auth) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['payload'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'payload required']);
        return;
    }

    try {
        global $pdo;
        
        // Récupérer la subscription
        $query = "SELECT subscription FROM push_subscriptions WHERE endpoint = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$data['endpoint']]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Subscription not found']);
            return;
        }

        $subscription = Subscription::create($row['subscription']);
        $webPush = new WebPush($auth);
        $webPush->queueNotification($subscription, json_encode($data['payload']));

        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                error_log("Generic notification sent successfully");
            } else {
                error_log("Generic notification failed: " . $report->getReason());
            }
        }

        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'Notification sent',
            'timestamp' => date('Y-m-d H:i:s')
        ]);

    } catch (Exception $e) {
        error_log("Send notification error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to send notification',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
?>
