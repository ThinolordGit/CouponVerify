<?php
/**
 * Diagnose the UPDATE settings issue
 */

require_once __DIR__ . '/config/database.php';

echo "\n===== SETTINGS UPDATE DIAGNOSIS =====\n\n";

// Step 1: List all valid settings in database
echo "Step 1: Valid settings in database:\n";
$stmt = $pdo->query("SELECT `key`, type FROM site_settings ORDER BY `key`");
$validKeys = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  ✓ " . $row['key'] . " (" . $row['type'] . ")\n";
    $validKeys[$row['key']] = $row['type'];
}

echo "\n\nStep 2: Check payload against valid keys:\n";

$payload = [
    "site_name" => "Gift card check",
    "site_description" => "Coupon verification platform",
    "site_logo_url" => "https://...",
    "site_favicon_url" => "https://...",
    "support_email" => "support@couponverify.local",
    "timezone" => "America/New_York",
    "language" => "en",
    "seo_title_prefix" => "Gift card checking",
    "site_keywords" => "coupon,verification,gift card",
    "og_image_url" => "https://...",
    "twitter_handle" => "@giftcard",
    "custom_head_html" => "",
    "auto_approve_enabled" => false,
    "min_verification_amount" => 5,
    "max_verification_amount" => 1000,
    "verification_timeout_hours" => 24,
    "require_proof" => true,
    "enable_notifications" => true
];

$invalidKeys = [];
$validPayload = [];

foreach ($payload as $key => $value) {
    if (!isset($validKeys[$key])) {
        echo "  ✗ '$key' - NOT IN DATABASE\n";
        $invalidKeys[] = $key;
    } else {
        echo "  ✓ '$key' - valid\n";
        $validPayload[$key] = $value;
    }
}

if (!empty($invalidKeys)) {
    echo "\n⚠️  Warning: " . count($invalidKeys) . " keys are invalid (not in database):\n";
    foreach ($invalidKeys as $k) {
        echo "     - $k\n";
    }
    echo "\nThese will be skipped by the backend (due to regex sanitization).\n";
}

// Step 3: Test the UPDATE query syntax
echo "\n\nStep 3: Test UPDATE query syntax:\n";
try {
    $testStmt = $pdo->prepare("
        UPDATE site_settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE \`key\` = ?
    ");
    echo "  ✓ Query is valid\n";
} catch (Exception $e) {
    echo "  ✗ Query error: " . $e->getMessage() . "\n";
}

// Step 4: Test actual UPDATE with sample data
echo "\n\nStep 4: Test actual UPDATE operation:\n";
try {
    $pdo->beginTransaction();
    
    $updateStmt = $pdo->prepare("
        UPDATE site_settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE \`key\` = ?
    ");
    
    $testUpdates = [
        'site_name' => 'Gift card check',
        'seo_title_prefix' => 'Gift card checking',
        'timezone' => 'America/New_York'
    ];
    
    $updated = 0;
    foreach ($testUpdates as $key => $value) {
        $updateStmt->execute([(string)$value, $key]);
        if ($updateStmt->rowCount() > 0) {
            echo "  ✓ Updated '$key' = '$value'\n";
            $updated++;
        }
    }
    
    $pdo->rollBack();
    echo "\n  ✓ Update logic works (rolled back for testing)\n";
} catch (Exception $e) {
    $pdo->rollBack();
    echo "  ✗ Update failed: " . $e->getMessage() . "\n";
}

echo "\n===== DIAGNOSIS COMPLETE =====\n\n";
?>
