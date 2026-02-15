<?php
require 'config/database.php';

global $pdo;

// SQL to create verifications table
$sql = "
CREATE TABLE IF NOT EXISTS verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    coupon_id INT NOT NULL,
    coupon_type VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45),
    code_encrypted LONGTEXT NOT NULL,
    code_hash VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    recharge_date DATE NOT NULL,
    recharge_time TIME NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'duplicate', 'blocked') DEFAULT 'pending',
    message TEXT,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_reference (reference),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_code_hash (code_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo->exec($sql);
    echo "✓ Verifications table created successfully!\n";

    // Insert some sample verifications
    $pdo->exec("
        INSERT INTO verifications (
            transaction_reference, reference, coupon_id, coupon_type, email,
            user_ip, code_encrypted, code_hash, amount, currency,
            recharge_date, recharge_time, status, message
        ) VALUES
        ('TXN-20260211-001', 'REF-ABCD1234', 1, 'Netflix 50€', 'user1@example.com',
         '192.168.1.1', 'encrypted_code_1', SHA2('code123', 256), 50.00, 'EUR',
         '2026-02-11', '14:30:00', 'approved', 'Verification approved'),
        ('TXN-20260211-002', 'REF-BCDE2345', 2, 'Spotify 30€', 'user2@example.com',
         '192.168.1.2', 'encrypted_code_2', SHA2('code456', 256), 30.00, 'EUR',
         '2026-02-10', '16:45:00', 'pending', 'Verification pending'),
        ('TXN-20260211-003', 'REF-CDEF3456', 3, 'Disney+ 20€', 'user3@example.com',
         '192.168.1.3', 'encrypted_code_3', SHA2('code789', 256), 20.00, 'EUR',
         '2026-02-09', '10:15:00', 'rejected', 'Invalid code'),
        ('TXN-20260211-004', 'REF-DEFA4567', 1, 'Netflix 50€', 'user4@example.com',
         '192.168.1.4', 'encrypted_code_4', SHA2('code000', 256), 50.00, 'EUR',
         '2026-02-08', '18:20:00', 'blocked', 'Suspicious activity detected');
    ");
    
    echo "✓ Sample verifications inserted!\n";
    
    // Check count
    $count = $pdo->query("SELECT COUNT(*) FROM verifications")->fetchColumn();
    echo "✓ Total verifications: $count\n";

} catch (Exception $e) {
    echo "✗ Error creating verifications table: " . $e->getMessage() . "\n";
}
?>
