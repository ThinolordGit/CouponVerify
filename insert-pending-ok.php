<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

// Get available coupons
$stmt = $pdo->query("SELECT id, name FROM coupons LIMIT 5");
$coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($coupons) {
    $coupon_id = $coupons[0]['id'];
    
    // Insert pending verification
    $sql = "INSERT INTO verifications (
        transaction_reference, coupon_id, coupon_type, email, user_ip, code_hash,
        amount, currency, status, reference, code_encrypted
    ) VALUES (
        'TXN-TEST-PENDING', $coupon_id, 'Netflix', 'test@example.com', '127.0.0.1', 'hash123',
        50.00, 'USD', 'pending', 'REF-PENDING-001', 'code123'
    )";
    
    try {
        $pdo->exec($sql);
        $id = $pdo->lastInsertId();
        echo "✓ Inserted pending verification with ID: $id\n";
    } catch (Exception $e) {
        echo "✗ Failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "No coupons found\n";
}
?>
