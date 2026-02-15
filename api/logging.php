<?php
/**
 * LoggingMiddleware - Log all requests but without consuming php://input
 * We don't actually read the body here, just log headers
 */

// Log the incoming request to PHP error log
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$content_type = $_SERVER['CONTENT_TYPE'] ?? 'none';

error_log("[API REQUEST] $method $uri | Content-Type: $content_type");

// Don't read php://input here - let the controllers read it!
?>
