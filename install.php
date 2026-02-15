<?php
/**
 * Install script v2 - Creates database schema (improved)
 */

// Load environment
$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_port = $_ENV['DB_PORT'] ?? 3306;
$db_name = $_ENV['DB_NAME'] ?? 'coupon_verify';
$db_user = $_ENV['DB_USER'] ?? 'root';
$db_password = $_ENV['DB_PASSWORD'] ?? '';

echo "🔧 CouponVerify Installation Script v2\n";
echo "======================================\n\n";

// Connect
try {
    echo "📡 Connecting to MySQL server...\n";
    $dsn = "mysql:host=$db_host;port=$db_port;charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "✅ Connected\n\n";

    echo "📁 Creating database...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Database ready\n\n";

    // Switch to database
    $pdo->exec("USE `$db_name`");

} catch (PDOException $e) {
    die("❌ Connection error: " . $e->getMessage() . "\n");
}

// Define CREATE TABLE statements manually
$create_tables = [
    // 1. Coupons
    "CREATE TABLE IF NOT EXISTS coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      short_description TEXT,
      logo VARCHAR(255),
      logo_alt VARCHAR(255),
      cover_image VARCHAR(255),
      cover_image_alt VARCHAR(255),
      theme_color VARCHAR(7) DEFAULT '#3B82F6',
      category VARCHAR(50),
      supported_currencies JSON,
      is_active BOOLEAN DEFAULT TRUE,
      verification_count INT DEFAULT 0,
      added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_slug (slug),
      KEY idx_active (is_active),
      KEY idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 2. Admin Users (must be before Verifications due to FK)
    "CREATE TABLE IF NOT EXISTS admin_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      role ENUM('admin', 'super_admin') DEFAULT 'admin',
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      last_login DATETIME,
      last_activity DATETIME,
      approvals_count INT DEFAULT 0,
      rejections_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_username (username),
      KEY idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 3. Verifications
    "CREATE TABLE IF NOT EXISTS verifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      transaction_reference VARCHAR(50) NOT NULL UNIQUE,
      coupon_id INT NOT NULL,
      coupon_type VARCHAR(100),
      email VARCHAR(100) NOT NULL,
      user_ip VARCHAR(45),
      code_encrypted VARCHAR(255),
      code_hash VARCHAR(64) UNIQUE,
      amount DECIMAL(10, 2),
      currency VARCHAR(3),
      recharge_date DATE,
      recharge_time TIME,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_at DATETIME,
      status ENUM('valid', 'invalid', 'pending', 'blocked') DEFAULT 'pending',
      reference VARCHAR(50) NOT NULL UNIQUE,
      message VARCHAR(255),
      is_manual_review BOOLEAN DEFAULT FALSE,
      reviewed_by INT,
      review_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
      FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
      KEY idx_email (email),
      KEY idx_status (status),
      KEY idx_coupon_id (coupon_id),
      KEY idx_submitted_at (submitted_at),
      KEY idx_reference (reference),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 4. Activity Log
    "CREATE TABLE IF NOT EXISTS activity_log (
      id INT PRIMARY KEY AUTO_INCREMENT,
      type VARCHAR(50),
      description TEXT NOT NULL,
      verification_id INT,
      admin_id INT,
      coupon_id INT,
      details JSON,
      severity ENUM('info', 'warning', 'error') DEFAULT 'info',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
      FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
      KEY idx_timestamp (timestamp),
      KEY idx_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 5. Email Notifications
    "CREATE TABLE IF NOT EXISTS email_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      verification_id INT,
      recipient_email VARCHAR(100) NOT NULL,
      template_type VARCHAR(50),
      subject VARCHAR(255),
      status ENUM('sent', 'pending', 'failed') DEFAULT 'pending',
      sent_at DATETIME,
      failure_reason VARCHAR(255),
      content_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
      KEY idx_status (status),
      KEY idx_recipient_email (recipient_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // 6. Push Notifications
    "CREATE TABLE IF NOT EXISTS push_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      verification_id INT,
      recipient_email VARCHAR(100) NOT NULL,
      notification_type VARCHAR(50),
      title VARCHAR(255),
      body TEXT,
      image_url VARCHAR(255),
      status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
      sent_at DATETIME,
      failure_reason VARCHAR(255),
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
      KEY idx_status (status),
      KEY idx_recipient_email (recipient_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
];

// Insert default admin
$inserts = [
    "INSERT IGNORE INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES ('admin', 'admin@couponverify.local', '\$2y\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/GOe', 'Administrator', 'super_admin', TRUE)",

    "INSERT IGNORE INTO coupons (name, slug, short_description, theme_color, category, supported_currencies, is_active) VALUES
    ('PCS Mastercard', 'pcs', 'PCS Mastercard prepaid card verification', '#003DA5', 'prepaid', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Transcash', 'transcash', 'Transcash prepaid card verification', '#FF6600', 'prepaid', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Steam Wallet', 'steam', 'Steam gaming gift card verification', '#1B2838', 'gaming', '[\"EUR\", \"USD\", \"GBP\", \"CHF\"]', TRUE),
    ('Paysafecard', 'paysafecard', 'Paysafecard prepaid voucher verification', '#00A86B', 'prepaid', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Google Play', 'google-play', 'Google Play Store gift card verification', '#4285F4', 'mobile', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Apple Card', 'apple', 'Apple iTunes/App Store gift card verification', '#000000', 'mobile', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Neosurf', 'neosurf', 'Neosurf prepaid card verification', '#FF0000', 'prepaid', '[\"EUR\", \"USD\", \"GBP\"]', TRUE),
    ('Amazon Gift Card', 'amazon', 'Amazon gift card verification', '#FF9900', 'retail', '[\"EUR\", \"USD\", \"GBP\"]', TRUE)"
];

echo "📜 Creating tables...\n";
$count = 0;
foreach ($create_tables as $sql) {
    try {
        $pdo->exec($sql);
        $count++;
        echo "✅ Created table $count\n";
    } catch (PDOException $e) {
        echo "⚠️  Table error: " . $e->getMessage() . "\n";
    }
}

echo "\n📝 Inserting initial data...\n";
foreach ($inserts as $sql) {
    try {
        $pdo->exec($sql);
        echo "✅ Inserted data\n";
    } catch (PDOException $e) {
        echo "⚠️  Insert: " . $e->getMessage() . "\n";
    }
}

// Verify
echo "\n🔍 Verifying tables...\n";
$result = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '$db_name' ORDER BY TABLE_NAME");
$tables = $result->fetchAll(PDO::FETCH_ASSOC);

if (count($tables) > 0) {
    echo "✅ Found " . count($tables) . " tables:\n";
    foreach ($tables as $table) {
        echo "   ✓ " . $table['TABLE_NAME'] . "\n";
    }
} else {
    echo "❌ No tables found!\n";
}

echo "\n🎉 Installation successful!\n";
