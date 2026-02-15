-- ============================================
-- CouponVerify Database Schema
-- MySQL/MariaDB Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS coupon_verify;
USE coupon_verify;

-- ============================================
-- 1. COUPONS Table
-- ============================================
CREATE TABLE coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Coupon type name (PCS, Steam, etc)',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
  short_description TEXT COMMENT 'Short marketing description',
  logo VARCHAR(255) COMMENT 'Path to logo image',
  logo_alt VARCHAR(255) COMMENT 'Alt text for logo',
  cover_image VARCHAR(255) COMMENT 'Path to cover image',
  cover_image_alt VARCHAR(255) COMMENT 'Alt text for cover',
  theme_color VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color code for branding',
  category VARCHAR(50) COMMENT 'Coupon category (prepaid, mobile, gaming, etc)',
  supported_currencies JSON COMMENT 'Supported currencies as JSON array',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether coupon is publicly available',
  verification_count INT DEFAULT 0 COMMENT 'Total verifications performed',
  added_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When coupon was added',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_slug (slug),
  KEY idx_active (is_active),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. VERIFICATIONS Table
-- ============================================
CREATE TABLE verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_reference VARCHAR(50) NOT NULL UNIQUE COMMENT 'VER-YYYY-NNN format',
  coupon_id INT NOT NULL COMMENT 'Reference to coupons table',
  coupon_type VARCHAR(100) COMMENT 'Coupon type name (cached for performance)',
  email VARCHAR(100) NOT NULL COMMENT 'User email address',
  user_ip VARCHAR(45) COMMENT 'User IP address for security',
  code_encrypted VARCHAR(255) COMMENT 'AES-256 encrypted coupon code',
  code_hash VARCHAR(64) UNIQUE COMMENT 'SHA-256 hash for duplicate detection',
  amount DECIMAL(10, 2) COMMENT 'Verification amount',
  currency VARCHAR(3) COMMENT 'Currency code (EUR, USD, etc)',
  recharge_date DATE COMMENT 'Date when coupon was recharged',
  recharge_time TIME COMMENT 'Time when coupon was recharged',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When verification was submitted',
  verified_at DATETIME COMMENT 'When verification was completed',
  status ENUM('valid', 'invalid', 'pending', 'blocked') DEFAULT 'pending' COMMENT 'Verification status',
  reference VARCHAR(50) NOT NULL UNIQUE COMMENT 'Public reference for user (REF-xxx)',
  message VARCHAR(255) COMMENT 'Status message to display to user',
  is_manual_review BOOLEAN DEFAULT FALSE COMMENT 'Whether manual review is needed',
  reviewed_by INT COMMENT 'Admin ID who reviewed this',
  review_notes TEXT COMMENT 'Admin notes on review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_coupon_id (coupon_id),
  KEY idx_submitted_at (submitted_at),
  KEY idx_reference (reference),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ADMIN_USERS Table
-- ============================================
CREATE TABLE admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Login username',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'Admin email address',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  full_name VARCHAR(100) COMMENT 'Admin display name',
  role ENUM('admin', 'super_admin') DEFAULT 'admin' COMMENT 'Admin role/permissions level',
  permissions JSON COMMENT 'Specific permissions as JSON',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether account is active',
  last_login DATETIME COMMENT 'Last login timestamp',
  last_activity DATETIME COMMENT 'Last activity timestamp',
  approvals_count INT DEFAULT 0 COMMENT 'Total verifications approved',
  rejections_count INT DEFAULT 0 COMMENT 'Total verifications rejected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_username (username),
  KEY idx_email (email),
  KEY idx_active (is_active),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. ACTIVITY_LOG Table
-- ============================================
CREATE TABLE activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) COMMENT 'Activity type (approval, rejection, verification, etc)',
  description TEXT NOT NULL COMMENT 'User-friendly activity description',
  verification_id INT COMMENT 'Related verification ID',
  admin_id INT COMMENT 'Admin who performed action',
  coupon_id INT COMMENT 'Related coupon ID',
  details JSON COMMENT 'Additional details as JSON',
  severity ENUM('info', 'warning', 'error') DEFAULT 'info' COMMENT 'Activity severity',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Activity timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  KEY idx_timestamp (timestamp),
  KEY idx_type (type),
  KEY idx_admin_id (admin_id),
  KEY idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. EMAIL_NOTIFICATIONS Table
-- ============================================
CREATE TABLE email_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  verification_id INT COMMENT 'Related verification ID',
  recipient_email VARCHAR(100) NOT NULL COMMENT 'Email recipient',
  template_type VARCHAR(50) COMMENT 'Email template type (valid, invalid, pending, blocked)',
  subject VARCHAR(255) COMMENT 'Email subject line',
  status ENUM('sent', 'pending', 'failed') DEFAULT 'pending' COMMENT 'Delivery status',
  sent_at DATETIME COMMENT 'When email was sent',
  failure_reason VARCHAR(255) COMMENT 'Error message if failed',
  content_data JSON COMMENT 'Template variables used',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
  KEY idx_status (status),
  KEY idx_recipient_email (recipient_email),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. PUSH_NOTIFICATIONS Table
-- ============================================
CREATE TABLE push_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  verification_id INT COMMENT 'Related verification ID',
  recipient_email VARCHAR(100) NOT NULL COMMENT 'Recipient email for notifications',
  notification_type VARCHAR(50) COMMENT 'Type of notification (submission, status_change, etc)',
  title VARCHAR(255) COMMENT 'Notification title',
  body TEXT COMMENT 'Notification body content',
  image_url VARCHAR(255) COMMENT 'Path to coupon image for notification',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending' COMMENT 'Notification status',
  sent_at DATETIME COMMENT 'When notification was sent',
  failure_reason VARCHAR(255) COMMENT 'Error message if failed',
  metadata JSON COMMENT 'Additional metadata as JSON',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES verifications(id) ON DELETE SET NULL,
  KEY idx_status (status),
  KEY idx_recipient_email (recipient_email),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Initial Data Seed
-- ============================================

-- Insert default super admin (password: admin123 - CHANGE IN PRODUCTION!)
INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@couponverify.local', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/GOe', 'Administrator', 'super_admin', TRUE);

-- Insert initial coupons
INSERT INTO coupons (name, slug, short_description, theme_color, category, supported_currencies, is_active) VALUES
('PCS Mastercard', 'pcs', 'PCS Mastercard prepaid card verification', '#003DA5', 'prepaid', '["EUR", "USD", "GBP"]', TRUE),
('Transcash', 'transcash', 'Transcash prepaid card verification', '#FF6600', 'prepaid', '["EUR", "USD", "GBP"]', TRUE),
('Steam Wallet', 'steam', 'Steam gaming gift card verification', '#1B2838', 'gaming', '["EUR", "USD", "GBP", "CHF"]', TRUE),
('Paysafecard', 'paysafecard', 'Paysafecard prepaid voucher verification', '#00A86B', 'prepaid', '["EUR", "USD", "GBP"]', TRUE),
('Google Play', 'google-play', 'Google Play Store gift card verification', '#4285F4', 'mobile', '["EUR", "USD", "GBP"]', TRUE),
('Apple Card', 'apple', 'Apple iTunes/App Store gift card verification', '#000000', 'mobile', '["EUR", "USD", "GBP"]', TRUE),
('Neosurf', 'neosurf', 'Neosurf prepaid card verification', '#FF0000', 'prepaid', '["EUR", "USD", "GBP"]', TRUE),
('Amazon Gift Card', 'amazon', 'Amazon gift card verification', '#FF9900', 'retail', '["EUR", "USD", "GBP"]', TRUE);

-- ============================================
-- Create Indexes for Better Performance
-- ============================================
CREATE INDEX idx_verify_email_status ON verifications(email, status);
CREATE INDEX idx_verify_coupon_status ON verifications(coupon_id, status);
CREATE INDEX idx_email_status ON email_notifications(status, created_at);
CREATE INDEX idx_push_status ON push_notifications(status, created_at);
CREATE INDEX idx_activity_created ON activity_log(created_at, type);

-- ============================================
-- Views for Analytics
-- ============================================

CREATE VIEW verification_stats AS
SELECT
  DATE(submitted_at) as verification_date,
  coupon_id,
  c.name as coupon_name,
  status,
  COUNT(*) as count,
  AVG(CAST(amount AS DECIMAL(10,2))) as avg_amount
FROM verifications v
LEFT JOIN coupons c ON v.coupon_id = c.id
GROUP BY verification_date, coupon_id, status;

CREATE VIEW admin_activity_summary AS
SELECT
  admin_id,
  u.username,
  u.full_name,
  COUNT(*) as total_actions,
  SUM(CASE WHEN type = 'approval' THEN 1 ELSE 0 END) as approvals,
  SUM(CASE WHEN type = 'rejection' THEN 1 ELSE 0 END) as rejections,
  MAX(timestamp) as last_activity
FROM activity_log a
LEFT JOIN admin_users u ON a.admin_id = u.id
WHERE admin_id IS NOT NULL
GROUP BY admin_id;

-- ============================================
-- End of Schema
-- ============================================
