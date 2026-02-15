<?php
require 'config/database.php';

global $pdo;

// Insert test verifications with different statuses
$inserts = [
    [
        'transaction_reference' => 'TXN-' . date('Ymd') . '-001',
        'reference' => 'REF-' . strtoupper(bin2hex(random_bytes(3))),
        'coupon_id' => 1,
        'coupon_type' => 'Netflix 50€',
        'email' => 'john@example.com',
        'user_ip' => '192.168.1.1',
        'code_encrypted' => 'encrypted_code_1',
        'code_hash' => hash('sha256', 'netflix_code_123'),
        'amount' => 50.00,
        'currency' => 'EUR',
        'recharge_date' => '2026-02-10',
        'recharge_time' => '14:30:00',
        'status' => 'approved',
        'message' => 'Code verified successfully'
    ],
    [
        'transaction_reference' => 'TXN-' . date('Ymd') . '-002',
        'reference' => 'REF-' . strtoupper(bin2hex(random_bytes(3))),
        'coupon_id' => 2,
        'coupon_type' => 'Spotify 30€',
        'email' => 'jane@example.com',
        'user_ip' => '192.168.1.2',
        'code_encrypted' => 'encrypted_code_2',
        'code_hash' => hash('sha256', 'spotify_code_456'),
        'amount' => 30.00,
        'currency' => 'EUR',
        'recharge_date' => '2026-02-11',
        'recharge_time' => '16:45:00',
        'status' => 'pending',
        'message' => 'Awaiting verification'
    ],
    [
        'transaction_reference' => 'TXN-' . date('Ymd') . '-003',
        'reference' => 'REF-' . strtoupper(bin2hex(random_bytes(3))),
        'coupon_id' => 3,
        'coupon_type' => 'Disney+ 20€',
        'email' => 'bob@example.com',
        'user_ip' => '192.168.1.3',
        'code_encrypted' => 'encrypted_code_3',
        'code_hash' => hash('sha256', 'disney_code_789'),
        'amount' => 20.00,
        'currency' => 'EUR',
        'recharge_date' => '2026-02-09',
        'recharge_time' => '10:15:00',
        'status' => 'rejected',
        'message' => 'Invalid code provided'
    ],
    [
        'transaction_reference' => 'TXN-' . date('Ymd') . '-004',
        'reference' => 'REF-' . strtoupper(bin2hex(random_bytes(3))),
        'coupon_id' => 1,
        'coupon_type' => 'Netflix 50€',
        'email' => 'alice@example.com',
        'user_ip' => '192.168.1.4',
        'code_encrypted' => 'encrypted_code_4',
        'code_hash' => hash('sha256', 'netflix_code_blocked'),
        'amount' => 50.00,
        'currency' => 'EUR',
        'recharge_date' => '2026-02-08',
        'recharge_time' => '18:20:00',
        'status' => 'blocked',
        'message' => 'Suspicious activity detected'
    ]
];

$stmt = $pdo->prepare("
    INSERT INTO verifications (
        transaction_reference, reference, coupon_id, coupon_type, email,
        user_ip, code_encrypted, code_hash, amount, currency,
        recharge_date, recharge_time, status, message
    ) VALUES (
        :transaction_reference, :reference, :coupon_id, :coupon_type, :email,
        :user_ip, :code_encrypted, :code_hash, :amount, :currency,
        :recharge_date, :recharge_time, :status, :message
    )
");

$inserted = 0;
foreach ($inserts as $data) {
    try {
        $stmt->execute($data);
        $inserted++;
    } catch (Exception $e) {
        echo "Error inserting record: " . $e->getMessage() . "\n";
    }
}

echo "✓ Inserted $inserted verification records\n";

// Count by status
$counts = $pdo->query("SELECT status, COUNT(*) as count FROM verifications GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
echo "\nVerifications by status:\n";
foreach ($counts as $row) {
    echo "  - {$row['status']}: {$row['count']}\n";
}
?>
