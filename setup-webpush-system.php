<?php
/**
 * setup-webpush-system.php - Setup script for Web Push Notifications
 * 
 * This script initializes the web push notification system:
 * 1. Creates push_subscriptions table
 * 2. Verifies composer dependencies
 * 3. Tests VAPID configuration
 * 4. Tests SMTP configuration
 */

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║   Web Push Notification System Setup                           ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Load configuration
require_once __DIR__ . '/config/database.php';

// Step 1: Create push_subscriptions table
echo "📊 Step 1: Creating push_subscriptions table...\n";

$sql = <<<SQL
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(500) UNIQUE NOT NULL,
    subscription LONGTEXT NOT NULL,
    admin_id INT NULL,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    user_ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL;

try {
    if ($db->query($sql)) {
        echo "   ✅ Table push_subscriptions created/verified\n\n";
    } else {
        echo "   ❌ Error: " . $db->error . "\n\n";
    }
} catch (Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n\n";
}

// Step 2: Check Webpush library
echo "📚 Step 2: Checking Webpush library...\n";

if (file_exists(__DIR__ . '/Webpush/autoload.php')) {
    echo "   ✅ Webpush library found\n\n";
} else {
    echo "   ⚠️  Webpush library not found at expected location\n";
    echo "   Consider running: composer require minishlink/web-push\n\n";
}

// Step 3: Check PHPMailer
echo "📧 Step 3: Checking PHPMailer library...\n";

if (file_exists(__DIR__ . '/PHPMailer/Exception.php')) {
    echo "   ✅ PHPMailer library found\n\n";
} else {
    echo "   ⚠️  PHPMailer library not found at expected location\n";
    echo "   Consider running: composer require phpmailer/phpmailer\n\n";
}

// Step 4: Verify VAPID keys
echo "🔑 Step 4: Verifying VAPID configuration...\n";

$vapid_public = $_ENV['VAPID_PUBLIC_KEY'] ?? '';
$vapid_private = $_ENV['VAPID_PRIVATE_KEY'] ?? '';

if (empty($vapid_public)) {
    echo "   ⚠️  VAPID_PUBLIC_KEY not configured in .env\n";
    echo "   Set VAPID_PUBLIC_KEY in your .env file\n";
} else {
    echo "   ✅ VAPID_PUBLIC_KEY configured\n";
}

if (empty($vapid_private)) {
    echo "   ⚠️  VAPID_PRIVATE_KEY not configured in .env\n";
    echo "   Set VAPID_PRIVATE_KEY in your .env file\n";
} else {
    echo "   ✅ VAPID_PRIVATE_KEY configured\n";
}
echo "\n";

// Step 5: Verify SMTP configuration
echo "📨 Step 5: Verifying SMTP configuration...\n";

$smtp_host = $_ENV['SMTP_HOST'] ?? '';
$smtp_user = $_ENV['SMTP_USER'] ?? '';
$smtp_password = $_ENV['SMTP_PASSWORD'] ?? '';
$smtp_from = $_ENV['SMTP_FROM_EMAIL'] ?? '';

if (empty($smtp_host)) {
    echo "   ⚠️  SMTP_HOST not configured\n";
} else {
    echo "   ✅ SMTP_HOST: $smtp_host\n";
}

if (empty($smtp_user)) {
    echo "   ⚠️  SMTP_USER not configured\n";
} else {
    echo "   ✅ SMTP_USER configured\n";
}

if (empty($smtp_from)) {
    echo "   ⚠️  SMTP_FROM_EMAIL not configured\n";
} else {
    echo "   ✅ SMTP_FROM_EMAIL: $smtp_from\n";
}
echo "\n";

// Step 6: Test database connection
echo "🗄️  Step 6: Testing database connection...\n";

try {
    $result = $db->query("SELECT 1");
    echo "   ✅ Database connection successful\n\n";
} catch (Exception $e) {
    echo "   ❌ Database connection failed: " . $e->getMessage() . "\n\n";
}

// Final message
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║   Setup Complete!                                              ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

echo "Next steps:\n";
echo "1. Review your .env file to ensure all settings are correct\n";
echo "2. Run migrations: php migrate-push-subscriptions.php\n";
echo "3. Test the API: curl http://localhost:8000/api/push/public-key\n";
echo "4. See SETUP-WEBPUSH.md for detailed documentation\n\n";

echo "📖 For more information, see: SETUP-WEBPUSH.md\n";
?>
