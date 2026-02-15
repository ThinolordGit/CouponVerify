<?php
$pdo = new PDO('mysql:host=localhost;dbname=coupon_verify', 'root', '');

// Create verifications table 
$sql = "
CREATE TABLE IF NOT EXISTS verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(255),
    coupon_id INT,
    coupon_type VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    recharge_date DATE,
    recharge_time TIME,
    status ENUM('pending', 'valid', 'invalid', 'blocked') DEFAULT 'pending',
    reference VARCHAR(255) UNIQUE,
    message TEXT,
    rejection_reason TEXT,
    blocking_reason TEXT,
    resolved_at DATETIME,
    blocked_at DATETIME,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
";

$pdo->exec($sql);

// Insert test data
$insertSql = "
INSERT IGNORE INTO verifications (coupon_type, email, amount, currency, status, reference, submitted_at) VALUES
('Netflix', 'test1@example.com', 50.00, 'USD', 'pending', 'REF-001', NOW()),
('Spotify', 'test2@example.com', 9.99, 'USD', 'pending', 'REF-002', NOW()),
('Amazon', 'test3@example.com', 100.00, 'USD', 'pending', 'REF-003', NOW()),
('Disney+', 'test4@example.com', 7.99, 'USD', 'valid', 'REF-004', NOW()),
('Apple Music', 'test5@example.com', 10.99, 'USD', 'invalid', 'REF-005', NOW()),
('Hulu', 'test6@example.com', 14.99, 'USD', 'blocked', 'REF-006', NOW());
";

$pdo->exec($insertSql);

echo json_encode(['status' => 'success', 'message' => 'Table created in coupon_verify and data inserted']);
?>
