<?php
/**
 * EXAMPLE: Using the WordPress-style Admin Configuration System
 * This file demonstrates how to use AdminConfig for global settings
 */

require_once __DIR__ . '/app/Utils/AdminConfig.php';
require_once __DIR__ . '/config/database.php';

// Initialize AdminConfig with PDO connection
AdminConfig::init($pdo);

// ===== EXAMPLES =====

echo "=== Admin Configuration System (WordPress-style) ===\n\n";

// 1. Get a single option with default
echo "1. Get SMTP Host:\n";
$smtpHost = AdminConfig::getOption('SMTP_HOST', 'default.smtp.com');
echo "   Value: " . $smtpHost . "\n\n";

// 2. Update an option
echo "2. Update SMTP Configuration:\n";
AdminConfig::updateOption('SMTP_HOST', 'smtp.gmail.com');
AdminConfig::updateOption('SMTP_PORT', '587');
AdminConfig::updateOption('SMTP_USER', 'admin@example.com');
AdminConfig::updateOption('SMTP_FROM_EMAIL', 'noreply@example.com');
AdminConfig::updateOption('SMTP_SECURE', '1');
echo "   Configuration updated!\n\n";

// 3. Check if option exists
echo "3. Check if option exists:\n";
if (AdminConfig::hasOption('SMTP_HOST')) {
    echo "   SMTP_HOST exists in database\n\n";
}

// 4. Get all options
echo "4. Get all configuration options:\n";
$allConfigs = AdminConfig::getAllOptions();
foreach ($allConfigs as $key => $value) {
    // Mask sensitive data
    if (strpos($key, 'PASSWORD') !== false) {
        $value = '••••••••';
    }
    echo "   $key => $value\n";
}
echo "\n";

// 5. Delete an option
echo "5. Delete an option:\n";
AdminConfig::deleteOption('TEST_OPTION');
echo "   Option deleted!\n\n";

// 6. In your services, use the options
echo "6. Usage in Services:\n";
echo "   In EmailService, EmailService automatically loads:\n";
echo "   - SMTP_HOST from AdminConfig\n";
echo "   - SMTP_PORT from AdminConfig\n";
echo "   - SMTP_USER from AdminConfig\n";
echo "   - SMTP_PASSWORD from AdminConfig\n";
echo "   - SMTP_FROM_EMAIL from AdminConfig\n";
echo "   - SMTP_SECURE from AdminConfig\n\n";

echo "API Endpoints:\n";
echo "  GET  /api/admin/notifications/config       - Get all configurations\n";
echo "  POST /api/admin/notifications/config-smtp  - Save SMTP configuration\n";
echo "\n✅ WordPress-style configuration system is ready!\n";
?>
