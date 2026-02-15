<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');
$stmt = $pdo->query("SELECT id FROM coupons LIMIT 1");
$coupon_id = $stmt->fetchColumn();

for ($i = 0; $i < 2; $i++) {
    $txn = "TXN-TEST-REJECT-$i";
    $ref = "REF-TEST-$i";
    $email = "test$i@example.com";
    $sql = "INSERT INTO verifications (transaction_reference, coupon_id, coupon_type, email, user_ip, code_hash, amount, currency, status, reference, code_encrypted) VALUES ('$txn', $coupon_id, 'Netflix', '$email', '127.0.0.1', 'hash$i', 50.00, 'USD', 'pending', '$ref', 'code$i')";
    $pdo->exec($sql);
    $id = $pdo->lastInsertId();
    echo "✓ Inserted pending verification #$id\n";
}
?>
