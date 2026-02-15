<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

// Get available coupons
$stmt = $pdo->query("SELECT id, name, type FROM coupons LIMIT 5");
$coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($coupons) {
    echo "Available coupons:\n";
    foreach ($coupons as $coupon) {
        echo "- ID: {$coupon['id']}, Name: {$coupon['name']}, Type: {$coupon['type']}\n";
    }
    
    // Use first coupon
    $coupon_id = $coupons[0]['id'];
    
    // Insert pending verification with valid coupon_id
    $sql = "INSERT INTO verifications (
        transaction_reference, coupon_id, coupon_type, email, user_ip, code_hash,
        amount, currency, recharge_date, recharge_time, status, reference, code_encrypted
    ) VALUES (
        'TXN-TEST-PENDING', $coupon_id, 'Netflix', 'test@example.com', '127.0.0.1', 'hash123',
        50.00, 'USD', DATE(NOW()), TIME(NOW()), 'pending', 'REF-PENDING-001', 'code123'
    )";
    
    try {
        $pdo->exec($sql);
        $id = $pdo->lastInsertId();
        echo "\n✓ Inserted pending verification with ID: $id (coupon_id: $coupon_id)\n";
    } catch (Exception $e) {
        echo "\n✗ Failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "No coupons found! Need to create test coupons first\n";
}
?>
