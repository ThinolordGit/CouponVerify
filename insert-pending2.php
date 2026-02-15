<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

// Get actual table structure to see all required fields
$stmt = $pdo->query("DESCRIBE verifications");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Table structure:\n";
foreach ($columns as $col) {
    $null = ($col['Null'] === 'YES') ? 'NULL' : 'NOT NULL';
    $default = $col['Default'] !== null ? "DEFAULT: " . $col['Default'] : "NO DEFAULT";
    echo "- {$col['Field']}: {$col['Type']} $null ($default)\n";
}

// Insert with ALL non-null fields
$sql = "INSERT INTO verifications (
    transaction_reference, coupon_id, coupon_type, email, user_ip, code_hash, 
    amount, currency, recharge_date, recharge_time, status, reference, code_encrypted
) VALUES (
    'TXN-TEST-PENDING', 0, 'Netflix', 'test@example.com', '127.0.0.1', 'hash123',
    50.00, 'USD', '2026-02-11', '14:00:00', 'pending', 'REF-PENDING-001', 'code123'
)";

try {
    $pdo->exec($sql);
    $id = $pdo->lastInsertId();
    echo "\n✓ Inserted pending verification with ID: $id\n";
} catch (Exception $e) {
    echo "\n✗ Failed: " . $e->getMessage() . "\n";
}
?>
