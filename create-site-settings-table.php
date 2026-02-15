<?php
/**
 * create-site-settings-table.php
 * Create site_settings table for global site configuration
 */

require_once __DIR__ . '/config/database.php';

echo "Creating site_settings table...\n\n";

try {
    $sql = "CREATE TABLE IF NOT EXISTS `site_settings` (
        `id` INT PRIMARY KEY AUTO_INCREMENT,
        `key` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Setting key (e.g., site_name, site_logo)',
        `value` LONGTEXT COMMENT 'Setting value',
        `type` VARCHAR(50) DEFAULT 'string' COMMENT 'Data type: string, number, boolean, json',
        `description` VARCHAR(255) COMMENT 'Human readable description',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY `idx_key` (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
    echo "✅ Table created successfully\n\n";

    // Insert default settings
    $defaultSettings = [
        [
            'key' => 'site_name',
            'value' => 'CouponVerify',
            'type' => 'string',
            'description' => 'Site name displayed in browser and branding'
        ],
        [
            'key' => 'site_description',
            'value' => 'Coupon verification platform',
            'type' => 'string',
            'description' => 'Meta description for SEO'
        ],
        [
            'key' => 'site_keywords',
            'value' => 'coupon,verification,gift card',
            'type' => 'string',
            'description' => 'Meta keywords for SEO'
        ],
        [
            'key' => 'site_logo_url',
            'value' => '/logo.png',
            'type' => 'string',
            'description' => 'URL to site logo'
        ],
        [
            'key' => 'site_favicon_url',
            'value' => '/favicon.ico',
            'type' => 'string',
            'description' => 'URL to site favicon'
        ],
        [
            'key' => 'support_email',
            'value' => 'support@couponverify.local',
            'type' => 'string',
            'description' => 'Support email address'
        ],
        [
            'key' => 'seo_title_prefix',
            'value' => 'CouponVerify',
            'type' => 'string',
            'description' => 'Prefix for all page titles'
        ],
        [
            'key' => 'custom_head_html',
            'value' => '',
            'type' => 'string',
            'description' => 'Custom HTML to inject in <head> (analytics, tracking, etc)'
        ],
        [
            'key' => 'og_image_url',
            'value' => '',
            'type' => 'string',
            'description' => 'Open Graph image URL for social sharing'
        ],
        [
            'key' => 'twitter_handle',
            'value' => '',
            'type' => 'string',
            'description' => 'Twitter handle for social meta tags'
        ],
        [
            'key' => 'timezone',
            'value' => 'Europe/Paris',
            'type' => 'string',
            'description' => 'Default timezone'
        ],
        [
            'key' => 'language',
            'value' => 'en',
            'type' => 'string',
            'description' => 'Default language'
        ],
        [
            'key' => 'auto_approve_enabled',
            'value' => '0',
            'type' => 'boolean',
            'description' => 'Auto-approve verifications'
        ],
        [
            'key' => 'min_verification_amount',
            'value' => '5',
            'type' => 'number',
            'description' => 'Minimum verification amount in EUR'
        ],
        [
            'key' => 'max_verification_amount',
            'value' => '1000',
            'type' => 'number',
            'description' => 'Maximum verification amount in EUR'
        ],
        [
            'key' => 'verification_timeout_hours',
            'value' => '24',
            'type' => 'number',
            'description' => 'Verification timeout in hours'
        ]
    ];

    // Check if settings already exist
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM site_settings");
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result['cnt'] == 0) {
        echo "🔧 Installing default settings...\n\n";

        foreach ($defaultSettings as $setting) {
            $stmt = $pdo->prepare("
                INSERT INTO site_settings (`key`, value, type, description)
                VALUES (?, ?, ?, ?)
            ");

            try {
                $stmt->execute([
                    $setting['key'],
                    $setting['value'],
                    $setting['type'],
                    $setting['description']
                ]);
                echo "✅ Installed: " . $setting['key'] . "\n";
            } catch (Exception $e) {
                echo "⚠️  Error installing " . $setting['key'] . ": " . $e->getMessage() . "\n";
            }
        }

        echo "\n✅ All default settings installed!\n";
    } else {
        echo "ℹ️  Settings already exist (" . $result['cnt'] . ")\n";
    }

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
