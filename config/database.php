<?php
/**
 * config/database.php - PDO Database Connection
 * Loads environment variables and creates PDO connection to MySQL
 */

// Load environment variables from .env file
if (file_exists(__DIR__ . '/../.env')) {
    $env_file = __DIR__ . '/../.env';
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue; // Skip comments
        if (strpos($line, '=') === false) continue;

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if (!empty($key) && !isset($_ENV[$key])) {
            $_ENV[$key] = $value;
        }
    }
}

// Database configuration from environment
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_port = $_ENV['DB_PORT'] ?? 3306;
$db_name = $_ENV['DB_NAME'] ?? 'coupon_verify';
$db_user = $_ENV['DB_USER'] ?? 'root';
$db_password = $_ENV['DB_PASSWORD'] ?? '';

// Create PDO connection
try {
    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";

    $pdo = new PDO(
        $dsn,
        $db_user,
        $db_password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    );

} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    die(json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'timestamp' => date('Y-m-d H:i:s')
    ]));
}

return $pdo;
