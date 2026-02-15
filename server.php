<?php
/**
 * server.php - Development Server Router
 * Usage: php -S localhost:8000 server.php
 */

$requested_file = $_SERVER["SCRIPT_FILENAME"];

// Only intercept API requests
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    // Adjust the request path and route through /api/index.php
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    $_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/api/index.php';
    
    include __DIR__ . '/api/index.php';
    return true;
}

// Serve static files and other requests normally
if (is_file(__DIR__ . $_SERVER["REQUEST_URI"])) {
    return false;  // Let the server serve it
}

// Return 404 for anything else
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
return true;
