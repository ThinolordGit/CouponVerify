<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

$migrations = [
    'ALTER TABLE verifications ADD COLUMN rejection_reason TEXT AFTER message',
    'ALTER TABLE verifications ADD COLUMN blocking_reason TEXT AFTER rejection_reason',
    'ALTER TABLE verifications ADD COLUMN resolved_at DATETIME AFTER blocking_reason',
    'ALTER TABLE verifications ADD COLUMN blocked_at DATETIME AFTER resolved_at'
];

foreach ($migrations as $sql) {
    try {
        $pdo->exec($sql);
        echo "✓ Executed: $sql\n";
    } catch (Exception $e) {
        echo "✗ Skipped: $sql\n";
    }
}

// Insert pending verification for testing
try {
    $pdo->exec("INSERT INTO verifications (coupon_type, email, amount, currency, status, reference, submitted_at) 
    VALUES ('Netflix', 'test@example.com', 50.00, 'USD', 'pending', 'TEST-PENDING-001', NOW())");
    echo "\n✓ Inserted pending verification\n";
} catch (Exception $e) {
    echo "\n✗ Failed to insert: " . $e->getMessage() . "\n";
}
?>
