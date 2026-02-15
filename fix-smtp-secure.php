<?php
/**
 * fix-smtp-secure.php
 * Fix SMTP_SECURE values in admin_config table
 * Converts 'true'/'false' strings to proper 'TLS'/'SSL' values
 */

require_once __DIR__ . '/config/database.php';

echo "Fixing SMTP_SECURE values in admin_config...\n\n";

try {
    // First, check current values
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM admin_config WHERE option_key = 'SMTP_SECURE'");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result['cnt'] > 0) {
        $stmt = $pdo->prepare("SELECT option_value FROM admin_config WHERE option_key = 'SMTP_SECURE'");
        $stmt->execute();
        $current = $stmt->fetch(\PDO::FETCH_ASSOC);
        $currentValue = $current['option_value'] ?? '';
        
        echo "Current SMTP_SECURE value: " . json_encode($currentValue) . "\n";
        
        // Determine what it should be
        $newValue = 'TLS'; // Default to TLS for port 587
        
        // Check SMTP_PORT to determine correct encryption
        $stmt = $pdo->prepare("SELECT option_value FROM admin_config WHERE option_key = 'SMTP_PORT'");
        $stmt->execute();
        $portResult = $stmt->fetch(\PDO::FETCH_ASSOC);
        $port = $portResult['option_value'] ?? '587';
        
        if ($port == 465 || strtolower($currentValue) === 'ssl') {
            $newValue = 'SSL';
            echo "Port 465 detected - using SSL\n";
        } else {
            echo "Port 587 detected - using TLS\n";
        }
        
        if ($currentValue !== $newValue) {
            // Update the value
            $stmt = $pdo->prepare("UPDATE admin_config SET option_value = ? WHERE option_key = 'SMTP_SECURE'");
            $stmt->execute([$newValue]);
            echo "✅ Updated SMTP_SECURE from " . json_encode($currentValue) . " to " . json_encode($newValue) . "\n";
        } else {
            echo "ℹ️  SMTP_SECURE already set correctly to " . json_encode($newValue) . "\n";
        }
    } else {
        echo "ℹ️  No SMTP_SECURE configuration found\n";
    }
    
    echo "\n✅ Fix complete!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
