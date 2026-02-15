<?php
/**
 * api/cors.php - CORS Configuration
 * Handles Cross-Origin Resource Sharing headers for session persistence
 */

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $env_file = __DIR__ . '/../.env';
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if (!empty($key) && !isset($_ENV[$key])) {
            $_ENV[$key] = $value;
        }
    }
}

// Get request origin
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Define allowed origins based on environment
$app_env = $_ENV['APP_ENV'] ?? 'development';
$allowed_origins = [];

if ($app_env === 'development') {
    // Development: allow localhost variants
    $allowed_origins = [
        'http://localhost:4028',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:4028',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:5500',  // Live Server
        'http://localhost:5500'
    ];
} else {
    // Production: allow configured domain
    $frontend_url = $_ENV['FRONTEND_URL'] ?? 'https://giftcloud.io';
    $allowed_origins = [
        $frontend_url,
        'https://giftcloud.io',
        'https://www.giftcloud.io'
    ];
}

// Check if origin is allowed
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} elseif ($app_env === 'development') {
    // In development, allow requests even with missing/unknown origin
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // In production, only allow specified origins
    header('Access-Control-Allow-Origin: ' . ($_ENV['FRONTEND_URL'] ?? 'https://giftcloud.io'));
}

// Set other CORS headers - CRITICAL for session persistence
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept');
// CRITICAL: Allow credentials (cookies) to be sent/received
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
// Allow response headers to be accessed by client
header('Access-Control-Expose-Headers: Content-Type, Set-Cookie');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}