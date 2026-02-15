<?php
/**
 * create-users-table.php - Create users table (different from admin_users)
 */

require_once __DIR__ . '/config/database.php';

try {
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT 'User full name',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email address',
  status ENUM('active', 'blocked', 'inactive') DEFAULT 'active' COMMENT 'User status',
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When user joined',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_joined_date (joined_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL;

    $pdo->exec($sql);
    echo "✓ Users table created successfully!\n";
    
    // Insert sample data
    $users = [
        ['name' => 'John Doe', 'email' => 'john@example.com', 'status' => 'active'],
        ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'status' => 'active'],
        ['name' => 'Bob Wilson', 'email' => 'bob@example.com', 'status' => 'blocked'],
        ['name' => 'Alice Johnson', 'email' => 'alice@example.com', 'status' => 'active'],
    ];
    
    $stmt = $pdo->prepare('INSERT INTO users (name, email, status) VALUES (?, ?, ?)');
    
    foreach ($users as $user) {
        try {
            $stmt->execute([$user['name'], $user['email'], $user['status']]);
            echo "  ✓ Inserted: {$user['name']}\n";
        } catch (\PDOException $e) {
            echo "  ✗ Failed to insert {$user['name']}: " . $e->getMessage() . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
