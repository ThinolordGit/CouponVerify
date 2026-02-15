<?php
/**
 * api/index.php - Main API Router
 * Routes all API requests to appropriate endpoints
 */
require_once __DIR__ . "/cors.php";
// Load autoloader
require_once __DIR__ . '/../autoload.php';

// Load configuration
require_once __DIR__ . '/../config/database.php';

// Initialize AdminConfig (WordPress-style options system)
use App\Utils\AdminConfig;
AdminConfig::init($pdo);

// Get request path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Split path into segments
$segments = explode('/', filter_var($path, FILTER_SANITIZE_URL));
$resource = $segments[0] ?? '';
$action = $segments[1] ?? '';
$param = implode('/', array_slice($segments, 2));

// Route to appropriate endpoint
try {
    switch ($resource) {
        case 'coupons':
            require_once __DIR__ . '/coupons.php';
            break;

        case 'verifications':
            require_once __DIR__ . '/verifications.php';
            break;

        case 'categories':
            require_once __DIR__ . '/categories.php';
            break;

        case 'admin':
            require_once __DIR__ . '/admin/router.php';
            break;

        case 'push':
            require_once __DIR__ . '/push.php';
            break;

        case 'settings':
            require_once __DIR__ . '/settings.php';
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Endpoint not found',
                'path' => $path,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            break;
    }

} catch (\Exception $e) {
    error_log("Router error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
