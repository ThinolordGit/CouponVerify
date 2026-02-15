<?php
/**
 * migrate-to-wordpress-options.php
 * Migration script to convert old admin_config (per-admin) to new WordPress-style options
 * 
 * Run this if you have data in the old admin_config table with admin_id references
 * Usage: php migrate-to-wordpress-options.php
 */

require_once __DIR__ . '/config/database.php';

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║     Migration: Old admin_config → WordPress-style Options      ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

try {
    // Step 1: Check if old table structure exists
    echo "📋 Step 1: Checking old table structure...\n";
    $checkOld = $pdo->prepare("
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'admin_config' AND COLUMN_NAME = 'admin_id'
    ");
    $checkOld->execute();
    $hasAdminId = $checkOld->fetch();

    if (!$hasAdminId) {
        echo "✅ Table is already using new WordPress-style structure (no admin_id column)\n";
        echo "ℹ️  No migration needed. Exiting.\n";
        exit(0);
    }

    echo "⚠️  Old structure detected with admin_id column\n";
    echo "🔄 Proceeding with migration...\n\n";

    // Step 2: Backup old data
    echo "📦 Step 2: Backing up old configuration data...\n";
    $stmt = $pdo->prepare("
        SELECT admin_id, config_key, config_value FROM admin_config 
        WHERE admin_id IS NOT NULL OR config_value IS NOT NULL
    ");
    $stmt->execute();
    $oldData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Backed up " . count($oldData) . " configuration entries\n\n";

    // Step 3: Create new table structure
    echo "🏗️  Step 3: Creating new WordPress-style table...\n";
    
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Drop old table
    $pdo->exec("DROP TABLE IF EXISTS `admin_config_old`");
    
    // Rename old to backup
    $pdo->exec("RENAME TABLE `admin_config` TO `admin_config_old`");
    echo "   Old table backed up as admin_config_old\n";
    
    // Create new structure
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_config` (
          `id` int NOT NULL AUTO_INCREMENT,
          `option_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
          `option_value` longtext COLLATE utf8mb4_unicode_ci,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,        
          PRIMARY KEY (`id`),
          UNIQUE KEY `unique_option_key` (`option_key`),
          KEY `idx_option_key` (`option_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "   New WordPress-style table created\n\n";

    // Step 4: Migrate data
    echo "🔀 Step 4: Migrating configuration data...\n";
    
    if (!empty($oldData)) {
        // Get unique config keys from old data
        $uniqueKeys = [];
        $lastValues = [];
        
        // Process old data: take the last non-empty value for each config_key
        foreach ($oldData as $row) {
            $key = $row['config_key'];
            $value = $row['config_value'];
            
            // Keep track of the last non-empty value per key
            // (ignoring per-admin configs, taking a global view)
            if (!empty($value)) {
                $lastValues[$key] = $value;
            }
            $uniqueKeys[$key] = true;
        }
        
        // Insert migrated data
        foreach ($uniqueKeys as $key => $true) {
            $value = $lastValues[$key] ?? '';
            
            $insertStmt = $pdo->prepare("
                INSERT INTO admin_config (option_key, option_value, created_at, updated_at)
                VALUES (?, ?, NOW(), NOW())
            ");
            $insertStmt->execute([$key, $value]);
        }
        
        echo "   ✅ Migrated " . count($uniqueKeys) . " unique configuration keys\n";
        echo "   Note: For keys with multiple admin values, the last non-empty value was kept\n\n";
    }

    // Step 5: Re-enable foreign keys
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "✨ Migration completed successfully!\n\n";
    
    echo "📝 Summary:\n";
    echo "   • Old data backed up in: admin_config_old\n";
    echo "   • New structure uses WordPress-style option_key (UNIQUE)\n";
    echo "   • Configuration is now independent of admin_id\n";
    echo "   • Use AdminConfig::getOption() / AdminConfig::updateOption() in code\n\n";
    
    echo "⚠️  Important: You can safely delete admin_config_old table later:\n";
    echo "    DROP TABLE admin_config_old;\n\n";
    
} catch (PDOException $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    // Try to restore
    try {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        $pdo->exec("DROP TABLE IF EXISTS `admin_config`");
        $pdo->exec("RENAME TABLE `admin_config_old` TO `admin_config`");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        echo "\n⚠️  Database restored to previous state\n";
    } catch (Exception $restore_e) {
        echo "⚠️  Could not restore database. Manual intervention may be needed.\n";
    }
    exit(1);
}
?>
