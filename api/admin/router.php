<?php
/**
 * api/admin/router.php - Admin Routes Router
 * Routes admin API requests to specific endpoints
 */

use App\Controllers\AuthController;
use App\Utils\HTTPResponse;

try {
    // Initialize auth controller to check session
    $authController = new AuthController($pdo);

    // Public auth endpoints (no authentication needed)
    if ($action === 'auth') {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $param === 'login') {
            $authController->login();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $param === 'logout') {
            $authController->logout();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $param === 'check') {
            $authController->check();
        } else {
            HTTPResponse::error('Invalid auth request', 400);
        }
        exit;
    }
    
    // Public settings endpoints (no authentication needed)
    if ($action === 'settings' && $_GET['action'] === 'get-seo') {
        require_once __DIR__ . '/settings.php';
        exit;
    }

    // All other admin routes require authentication
    AuthController::requireAuth();

    // Route other admin endpoints
    switch ($action) {
        case 'dashboard':
            require_once __DIR__ . '/dashboard.php';
            break;

        case 'coupons':
            require_once __DIR__ . '/coupons-mgmt.php';
            break;

        case 'verifications':
            require_once __DIR__ . '/verifications-mgmt.php';
            break;
        
        case 'users':
            require_once __DIR__ . '/users-mgmt.php';
            break;
        
        case 'admin-users':
            require_once __DIR__ . '/admin_users-mgmt.php';
            break;

        case 'categories':
            require_once __DIR__ . '/categories-mgmt.php';
            break;

        case 'email-config':
            require_once __DIR__ . '/email-config.php';
            break;

        case 'email-templates':
            require_once __DIR__ . '/email-templates.php';
            break;

        case 'settings':
            require_once __DIR__ . '/settings.php';
            break;

        case 'i18n':
            require_once __DIR__ . '/i18n.php';
            break;

        case 'activity-log':
            require_once __DIR__ . '/activity-log.php';
            break;

        case 'notifications':
            require_once __DIR__ . '/notifications.php';
            break;

        default:
            HTTPResponse::error('Admin endpoint not found', 404);
            break;
    }

} catch (\Exception $e) {
    error_log("Admin router error: " . $e->getMessage());
    HTTPResponse::serverError('Admin endpoint error');
}
