<?php
/**
 * autoload.php - Simple PSR-4 Autoloader
 * Automatically loads App\ namespace classes and Composer dependencies
 */

// Load Composer dependencies
if (file_exists(__DIR__ . '/Webpush/vendor/autoload.php')) {
    require_once __DIR__ . '/Webpush/vendor/autoload.php';
}

if (file_exists(__DIR__ . '/PHPMailer/vendor/autoload.php')) {
    require_once __DIR__ . '/PHPMailer/vendor/autoload.php';
}

// Register custom PSR-4 autoloader for App namespace
spl_autoload_register(function ($class) {
    // Define base namespace and directory
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/app/';

    // Check if class uses our namespace
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return; // Not our namespace
    }

    // Get the relative class name
    $relative_class = substr($class, $len);

    // Replace namespace separators with directory separators
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // Check if file exists and require it
    if (file_exists($file)) {
        require $file;
    }
});
