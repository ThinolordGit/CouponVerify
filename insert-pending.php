<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

// Insert proper pending verification with all required fields
$sql = "INSERT INTO verifications (transaction_reference, coupon_type, email, amount, currency, status, reference, submitted_at, code_hash) 
VALUES ('TXN-TEST-001', 'Netflix', 'test-pending@example.com', 50.00, 'USD', 'pending', 'TEST-001', NOW(), 'test-hash')";

try {
    $pdo->exec($sql);
    $id = $pdo->lastInsertId();
    echo "✓ Inserted pending verification with ID: $id\n";
    
    // Confirm it exists
    $stmt = $pdo->prepare("SELECT id, coupon_type, email, status FROM verifications WHERE id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✓ Verified: " . json_encode($result) . "\n";
} catch (Exception $e) {
    echo "✗ Failed: " . $e->getMessage() . "\n";
}
?>
