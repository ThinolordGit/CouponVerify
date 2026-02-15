<?php
/**
 * api/admin/notifications.php - Admin Notification Endpoints
 * Manages admin push subscriptions with "**" identifier for multi-device support
 */

use App\Utils\HTTPResponse;

$method = $_SERVER['REQUEST_METHOD'];
$subAction = $GLOBALS['param'] ?? '';

try {
    switch ($subAction) {
        case 'push-subscribe':
            handleAdminPushSubscribe();
            break;

        case 'config':
            handleAdminConfig();
            break;

        case 'config-smtp':
            handleAdminConfigSmtp();
            break;

        case 'test-email':
            handleEmailTest();
            break;

        default:
            HTTPResponse::error('Admin notification endpoint not found', 404);
            break;
    }
} catch (Exception $e) {
    error_log("Admin notifications API error: " . $e->getMessage());
    HTTPResponse::serverError('Admin notification endpoint error');
    exit;
}

// ===========================
// Push Subscription Handlers
// ===========================

function handleAdminPushSubscribe() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        return;
    }

    // Use "**" as admin identifier instead of user_uuid
    $adminIdentifier = '**';
    $subscription = $data['subscription'] ?? null;

    if (!$subscription) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Subscription is required']);
        return;
    }

    $endpoint = $subscription['endpoint'] ?? null;
    if (!$endpoint) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Endpoint is required']);
        return;
    }

    try {
        // Check if this endpoint already exists
        $stmt = $pdo->prepare("
            SELECT id FROM push_subscriptions 
            WHERE endpoint = ? AND admin_id = ? AND user_uuid = ?
        ");
        $stmt->execute([$endpoint, $_SESSION['admin_id'] ?? null, $adminIdentifier]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update existing subscription
            $stmt = $pdo->prepare("
                UPDATE push_subscriptions 
                SET subscription = ?, updated_at = NOW()
                WHERE endpoint = ? AND admin_id = ? AND user_uuid = ?
            ");
            $stmt->execute([
                json_encode($subscription),
                $endpoint,
                $_SESSION['admin_id'] ?? null,
                $adminIdentifier
            ]);
        } else {
            // Insert new subscription
            $stmt = $pdo->prepare("
                INSERT INTO push_subscriptions 
                (endpoint, subscription, user_uuid, admin_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([
                $endpoint,
                json_encode($subscription),
                $adminIdentifier,
                $_SESSION['admin_id'] ?? null
            ]);
        }

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Push subscription registered',
            'admin_identifier' => $adminIdentifier
        ]);

    } catch (PDOException $e) {
        error_log("DB Error in push subscribe: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}

// ==========================
// Configuration Handlers
// ==========================

function handleAdminConfig() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    try {
        // Load admin configuration (WordPress-style options)
        $stmt = $pdo->prepare("
            SELECT option_key, option_value FROM admin_config
            ORDER BY option_key ASC
        ");
        $stmt->execute();
        $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group by key
        $result = [];
        foreach ($configs as $config) {
            $result[$config['option_key']] = $config['option_value'];
        }

        // Return SMTP config
        $smtp = [
            'SMTP_HOST' => $result['SMTP_HOST'] ?? $_ENV['SMTP_HOST'] ?? '',
            'SMTP_PORT' => $result['SMTP_PORT'] ?? $_ENV['SMTP_PORT'] ?? '2525',
            'SMTP_USER' => $result['SMTP_USER'] ?? $_ENV['SMTP_USER'] ?? '',
            'SMTP_PASSWORD' => $result['SMTP_PASSWORD'] ?? $_ENV['SMTP_PASSWORD'] ?? '',
            'SMTP_FROM_EMAIL' => $result['SMTP_FROM_EMAIL'] ?? $_ENV['SMTP_FROM_EMAIL'] ?? '',
            'SMTP_SECURE' => $result['SMTP_SECURE'] ?? $_ENV['SMTP_SECURE'] ?? '1'
        ];

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'config' => $smtp
        ]);

    } catch (PDOException $e) {
        error_log("DB Error in config fetch: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}

function handleAdminConfigSmtp() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        return;
    }

    try {
        $smtpFields = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL', 'SMTP_SECURE'];

        foreach ($smtpFields as $field) {
            $value = $data[$field] ?? '';
            
            // Don't save if password is masked
            if ($field === 'SMTP_PASSWORD' && (strpos($value, '•') !== false || $value === '')) {
                continue;
            }

            // Check if option exists (WordPress-style)
            $stmt = $pdo->prepare("
                SELECT id FROM admin_config 
                WHERE option_key = ?
            ");
            $stmt->execute([$field]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update
                $stmt = $pdo->prepare("
                    UPDATE admin_config 
                    SET option_value = ?, updated_at = NOW()
                    WHERE option_key = ?
                ");
                $stmt->execute([$value, $field]);
            } else {
                // Insert (WordPress-style insert)
                $stmt = $pdo->prepare("
                    INSERT INTO admin_config 
                    (option_key, option_value, created_at, updated_at)
                    VALUES (?, ?, NOW(), NOW())
                ");
                $stmt->execute([$field, $value]);
            }
        }
        
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'SMTP configuration saved'
        ]);

    } catch (PDOException $e) {
        error_log("DB Error in config save: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
}

// ===========================
// Email Test Handler
// ===========================

function handleEmailTest() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        return;
    }

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $testEmail = $data['email'] ?? '';

        if (!$testEmail || !filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Valid email address required']);
            return;
        }

        // Create and use EmailService
        require_once __DIR__ . '/../../app/Services/EmailService.php';
        require_once __DIR__ . '/../../app/Utils/AdminConfig.php';
        
        \App\Utils\AdminConfig::init($pdo);

        $sqlHelper = new \stdClass();
        $sqlHelper->db = $pdo;

        $emailService = new \App\Services\EmailService($sqlHelper);

        // Create a test verification object
        $verification = [
            'email' => $testEmail,
            'reference' => 'TEST-' . date('YmdHis'),
            'status' => 'test',
            'created_at' => date('Y-m-d H:i:s')
        ];

        $coupon = [
            'title' => 'Test Email Transmission',
            'description' => 'This is a test email to verify SMTP configuration'
        ];

        // Use sendVerificationConfirmation method
        $result = $emailService->sendVerificationConfirmation($verification, $coupon);

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Test email sent successfully to ' . $testEmail,
            'reference' => $verification['reference']
        ]);

    } catch (Exception $e) {
        error_log("Email test error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to send test email: ' . $e->getMessage()
        ]);
    }
}
