<?php
/**
 * migrate-coupons-seo.php
 * Recreate coupons table with SEO fields
 * This script preserves all existing data
 */

require_once __DIR__ . '/config/database.php';

echo "\n===== MIGRATE COUPONS TABLE TO ADD SEO FIELDS =====\n\n";

try {
    // Disable foreign key checks for migration
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Step 1: Create new table with SEO fields
    echo "Step 1: Creating new coupons_new table with SEO fields...\n";
    
    $createNew = <<<SQL
    CREATE TABLE coupons_new (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Coupon type name (PCS, Steam, etc)',
      slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
      short_description TEXT COMMENT 'Short marketing description',
      logo VARCHAR(255) COMMENT 'Path to logo image',
      logo_alt VARCHAR(255) COMMENT 'Alt text for logo',
      cover_image VARCHAR(255) COMMENT 'Path to cover image',
      cover_image_alt VARCHAR(255) COMMENT 'Alt text for cover',
      theme_color VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color code for branding',
      category VARCHAR(50) COMMENT 'Coupon category (prepaid, mobile, gaming, etc)',
      supported_currencies JSON COMMENT 'Supported currencies as JSON array',
      is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether coupon is publicly available',
      verification_count INT DEFAULT 0 COMMENT 'Total verifications performed',
      added_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When coupon was added',
      
      seo_title VARCHAR(255) COMMENT 'Custom SEO page title',
      seo_description TEXT COMMENT 'Custom SEO description',
      seo_keywords VARCHAR(255) COMMENT 'SEO keywords (comma-separated)',
      og_image_url VARCHAR(255) COMMENT 'OpenGraph image URL',
      custom_head_html LONGTEXT COMMENT 'Custom HTML to inject in page head',
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_slug (slug),
      KEY idx_active (is_active),
      KEY idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL;
    
    $pdo->exec($createNew);
    echo "  ✓ coupons_new table created\n\n";
    
    // Step 2: Copy data from old table
    echo "Step 2: Copying existing data...\n";
    $copy = <<<SQL
    INSERT INTO coupons_new (
      id, name, slug, short_description, logo, logo_alt, cover_image, 
      cover_image_alt, theme_color, category, supported_currencies, 
      is_active, verification_count, added_date, created_at, updated_at
    )
    SELECT 
      id, name, slug, short_description, logo, logo_alt, cover_image,
      cover_image_alt, theme_color, category, supported_currencies,
      is_active, verification_count, added_date, created_at, updated_at
    FROM coupons
    SQL;
    
    $pdo->exec($copy);
    echo "  ✓ Data copied\n\n";
    
    // Step 3: Drop old table
    echo "Step 3: Removing old coupons table...\n";
    $pdo->exec("DROP TABLE coupons");
    echo "  ✓ Old table removed\n\n";
    
    // Step 4: Rename new table
    echo "Step 4: Renaming coupons_new to coupons...\n";
    $pdo->exec("ALTER TABLE coupons_new RENAME TO coupons");
    echo "  ✓ Table renamed\n\n";
    
    // Step 5: Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // Step 6: Verify migration
    echo "Step 5: Verifying migration...\n";
    $count = $pdo->query("SELECT COUNT(*) FROM coupons")->fetchColumn();
    echo "  ✓ Migration successful! Coupons count: $count\n\n";
    
    // List columns
    $columns = $pdo->query("DESCRIBE coupons")->fetchAll(PDO::FETCH_ASSOC);
    echo "New table structure:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
    echo "\n✓ MIGRATION COMPLETE!\n\n";
    
} catch (Exception $e) {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "\n✗ MIGRATION FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    exit(1);
}
