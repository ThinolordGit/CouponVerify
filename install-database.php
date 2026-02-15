<?php
/**
 * install-database.php
 * Script d'installation complet de la base de données
 * À exécuter une seule fois lors du déploiement
 * 
 * Usage: php install-database.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/SQLHelper.php';

echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║         Installation Complète de la Base de Données            ║\n";
echo "║                    GiftCard Verification                       ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

try {
    // Disable foreign key checks during installation
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    echo "🚀 Phase 1: Suppression des tables existantes...\n";
    $tables = [
        'admin_config',
        'activity_log',
        'email_notifications',
        'push_notifications',
        'push_subscriptions',
        'verifications',
        'coupons',
        'categories',
        'admin_users',
        'users'
    ];
    
    foreach ($tables as $table) {
        try {
            $pdo->exec("DROP TABLE IF EXISTS `$table`");
            echo "   ✓ Deleted: $table\n";
        } catch (Exception $e) {
            echo "   ⚠ Skip: $table\n";
        }
    }
    
    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "\n🏗️  Phase 2: Création des tables...\n\n";
    
    // ==========================================
    // TABLE: users
    // ==========================================
    echo "   Creating: users\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
          `id` int NOT NULL AUTO_INCREMENT,
          `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User full name',
          `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'User email address',
          `status` enum('active','blocked','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'User status',
          `joined_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'When user joined',
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `email` (`email`),
          KEY `idx_email` (`email`),
          KEY `idx_status` (`status`),
          KEY `idx_joined_date` (`joined_date`)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: admin_users
    // ==========================================
    echo "   Creating: admin_users\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_users` (
          `id` int NOT NULL AUTO_INCREMENT,
          `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
          `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `role` enum('admin','super_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
          `permissions` json DEFAULT NULL,
          `is_active` tinyint(1) DEFAULT '1',
          `last_login` datetime DEFAULT NULL,
          `last_activity` datetime DEFAULT NULL,
          `approvals_count` int DEFAULT '0',
          `rejections_count` int DEFAULT '0',
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `username` (`username`),
          UNIQUE KEY `email` (`email`),
          KEY `idx_username` (`username`),
          KEY `idx_email` (`email`)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: categories
    // ==========================================
    echo "   Creating: categories\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `categories` (
          `id` int NOT NULL AUTO_INCREMENT,
          `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Category name',
          `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL-friendly slug',
          `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Category description',
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `name` (`name`),
          UNIQUE KEY `slug` (`slug`),
          KEY `idx_slug` (`slug`),
          KEY `idx_name` (`name`)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: coupons
    // ==========================================
    echo "   Creating: coupons\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `coupons` (
          `id` int NOT NULL AUTO_INCREMENT,
          `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `short_description` text COLLATE utf8mb4_unicode_ci,
          `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `logo_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `cover_image_alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `theme_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#3B82F6',
          `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `supported_currencies` json DEFAULT NULL,
          `is_active` tinyint(1) DEFAULT '1',
          `verification_count` int DEFAULT '0',
          `added_date` datetime DEFAULT CURRENT_TIMESTAMP,
          
          `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci COMMENT 'Custom SEO page title',
          `seo_description` text COLLATE utf8mb4_unicode_ci COMMENT 'Custom SEO description',
          `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci COMMENT 'SEO keywords (comma-separated)',
          `og_image_url` varchar(255) COLLATE utf8mb4_unicode_ci COMMENT 'OpenGraph image URL',
          `custom_head_html` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Custom HTML to inject in page head',
          
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `name` (`name`),
          UNIQUE KEY `slug` (`slug`),
          KEY `idx_slug` (`slug`),
          KEY `idx_active` (`is_active`),
          KEY `idx_category` (`category`)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: verifications
    // ==========================================
    echo "   Creating: verifications\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `verifications` (
          `id` int NOT NULL AUTO_INCREMENT,
          `transaction_reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
          `coupon_id` int NOT NULL,
          `coupon_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `user_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `user_uuid` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `code_encrypted` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `code_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `amount` decimal(10,2) DEFAULT NULL,
          `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `recharge_date` date DEFAULT NULL,
          `recharge_time` time DEFAULT NULL,
          `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `verified_at` datetime DEFAULT NULL,
          `status` enum('valid','invalid','pending','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
          `reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
          `message` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `rejection_reason` text COLLATE utf8mb4_unicode_ci,
          `blocking_reason` text COLLATE utf8mb4_unicode_ci,
          `resolved_at` datetime DEFAULT NULL,
          `blocked_at` datetime DEFAULT NULL,
          `is_manual_review` tinyint(1) DEFAULT '0',
          `reviewed_by` int DEFAULT NULL,
          `review_notes` text COLLATE utf8mb4_unicode_ci,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `transaction_reference` (`transaction_reference`),
          UNIQUE KEY `reference` (`reference`),
          UNIQUE KEY `code_hash` (`code_hash`),
          KEY `reviewed_by` (`reviewed_by`),
          KEY `idx_email` (`email`),
          KEY `idx_status` (`status`),
          KEY `idx_coupon_id` (`coupon_id`),
          KEY `idx_submitted_at` (`submitted_at`),
          KEY `idx_reference` (`reference`),
          KEY `idx_created_at` (`created_at`),
          KEY `idx_user_uuid` (`user_uuid`),
          CONSTRAINT `verifications_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE RESTRICT,
          CONSTRAINT `verifications_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: push_subscriptions
    // ==========================================
    echo "   Creating: push_subscriptions\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `push_subscriptions` (
          `id` int NOT NULL AUTO_INCREMENT,
          `endpoint` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
          `subscription` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
          `admin_id` int DEFAULT NULL,
          `user_uuid` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `user_id` int DEFAULT NULL,
          `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `is_active` tinyint(1) DEFAULT '1',
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: push_notifications
    // ==========================================
    echo "   Creating: push_notifications\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `push_notifications` (
          `id` int NOT NULL AUTO_INCREMENT,
          `verification_id` int DEFAULT NULL,
          `recipient_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `body` text COLLATE utf8mb4_unicode_ci,
          `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `status` enum('pending','sent','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
          `sent_at` datetime DEFAULT NULL,
          `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `metadata` json DEFAULT NULL,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `verification_id` (`verification_id`),
          KEY `idx_status` (`status`),
          KEY `idx_recipient_email` (`recipient_email`),
          CONSTRAINT `push_notifications_ibfk_1` FOREIGN KEY (`verification_id`) REFERENCES `verifications` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: email_notifications
    // ==========================================
    echo "   Creating: email_notifications\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `email_notifications` (
          `id` int NOT NULL AUTO_INCREMENT,
          `verification_id` int DEFAULT NULL,
          `recipient_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
          `template_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `status` enum('sent','pending','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
          `sent_at` datetime DEFAULT NULL,
          `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `content_data` json DEFAULT NULL,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `verification_id` (`verification_id`),
          KEY `idx_status` (`status`),
          KEY `idx_recipient_email` (`recipient_email`),
          CONSTRAINT `email_notifications_ibfk_1` FOREIGN KEY (`verification_id`) REFERENCES `verifications` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: activity_log
    // ==========================================
    echo "   Creating: activity_log\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `activity_log` (
          `id` int NOT NULL AUTO_INCREMENT,
          `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
          `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
          `verification_id` int DEFAULT NULL,
          `admin_id` int DEFAULT NULL,
          `coupon_id` int DEFAULT NULL,
          `details` json DEFAULT NULL,
          `severity` enum('info','warning','error') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
          `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `verification_id` (`verification_id`),
          KEY `admin_id` (`admin_id`),
          KEY `coupon_id` (`coupon_id`),
          KEY `idx_timestamp` (`timestamp`),
          KEY `idx_type` (`type`),
          CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`verification_id`) REFERENCES `verifications` (`id`) ON DELETE SET NULL,
          CONSTRAINT `activity_log_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
          CONSTRAINT `activity_log_ibfk_3` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: admin_config (WordPress-style options)
    // ==========================================
    echo "   Creating: admin_config\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_config` (
          `id` int NOT NULL AUTO_INCREMENT,
          `option_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
          `option_value` longtext COLLATE utf8mb4_unicode_ci,
          `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,        
          PRIMARY KEY (`id`),
          UNIQUE KEY `unique_option_key` (`option_key`),
          KEY `idx_option_key` (`option_key`)
        )
    ");
    
    // ==========================================
    // TABLE: site_settings
    // ==========================================
    echo "   Creating: site_settings\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `site_settings` (
          `id` INT PRIMARY KEY AUTO_INCREMENT,
          `key` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Setting key (e.g., site_name, site_logo)',
          `value` LONGTEXT COMMENT 'Setting value',
          `type` VARCHAR(50) DEFAULT 'string' COMMENT 'Data type: string, number, boolean, json',
          `description` VARCHAR(255) COMMENT 'Human readable description',
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY `idx_key` (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // ==========================================
    // TABLE: email_templates
    // ==========================================
    echo "   Creating: email_templates\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `email_templates` (
          `id` INT PRIMARY KEY AUTO_INCREMENT,
          `template_key` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique key for template (e.g. verification_pending)',
          `name` VARCHAR(255) NOT NULL COMMENT 'Human readable name',
          `subject` VARCHAR(500) NOT NULL COMMENT 'Email subject with variables',
          `html_body` LONGTEXT NOT NULL COMMENT 'HTML email body with variables',
          `text_body` LONGTEXT COMMENT 'Plain text version',
          `variables` JSON COMMENT 'Available variables for this template',
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY `idx_template_key` (`template_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    echo "\n📊 Phase 3: Insertion des données de base...\n\n";
    
    // ==========================================
    // Admin User
    // ==========================================
    echo "   Creating: Default Admin User\n";
    // Password: 'admin@admin2026' hashed with password_hash
    $adminHash = password_hash('admin@admin2026', PASSWORD_BCRYPT);
    $pdo->exec("
        INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
        VALUES ('admin', 'othnieldos@gmail.com', '$adminHash', 'Administrator', 'super_admin', 1)
    ");
    
    // ==========================================
    // Site Settings
    // ==========================================
    echo "   Creating: Default Site Settings\n";
    
    $defaultSettings = [
        ['key' => 'site_name', 'value' => 'CouponVerify', 'type' => 'string', 'description' => 'Site name displayed in browser and branding'],
        ['key' => 'site_description', 'value' => 'Coupon verification platform', 'type' => 'string', 'description' => 'Meta description for SEO'],
        ['key' => 'site_keywords', 'value' => 'coupon,verification,gift card', 'type' => 'string', 'description' => 'Meta keywords for SEO'],
        ['key' => 'site_logo_url', 'value' => '/logo.png', 'type' => 'string', 'description' => 'URL to site logo'],
        ['key' => 'site_favicon_url', 'value' => '/favicon.ico', 'type' => 'string', 'description' => 'URL to site favicon'],
        ['key' => 'support_email', 'value' => 'support@couponverify.local', 'type' => 'string', 'description' => 'Support email address'],
        ['key' => 'seo_title_prefix', 'value' => 'CouponVerify', 'type' => 'string', 'description' => 'Prefix for all page titles'],
        ['key' => 'custom_head_html', 'value' => '', 'type' => 'string', 'description' => 'Custom HTML to inject in <head> (analytics, tracking, etc)'],
        ['key' => 'og_image_url', 'value' => '', 'type' => 'string', 'description' => 'Open Graph image URL for social sharing'],
        ['key' => 'twitter_handle', 'value' => '', 'type' => 'string', 'description' => 'Twitter handle for social meta tags'],
        ['key' => 'timezone', 'value' => 'Europe/Paris', 'type' => 'string', 'description' => 'Default timezone'],
        ['key' => 'language', 'value' => 'en', 'type' => 'string', 'description' => 'Default language'],
        ['key' => 'auto_approve_enabled', 'value' => '0', 'type' => 'boolean', 'description' => 'Auto-approve verifications'],
        ['key' => 'min_verification_amount', 'value' => '5', 'type' => 'number', 'description' => 'Minimum verification amount in EUR'],
        ['key' => 'max_verification_amount', 'value' => '1000', 'type' => 'number', 'description' => 'Maximum verification amount in EUR'],
        ['key' => 'verification_timeout_hours', 'value' => '24', 'type' => 'number', 'description' => 'Verification timeout in hours'],
        ['key' => 'enable_user_dashboard', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable user dashboard feature'],
        ['key' => 'enable_coupon_verification', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable coupon verification feature'],
        ['key' => 'enable_admin_panel', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable admin panel feature'],
        ['key' => 'enable_home_page', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable public homepage for customers'],
        ['key' => 'enable_public_catalog', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable public coupon catalog'],
        ['key' => 'enable_social_sharing', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable social sharing features'],
        ['key' => 'enable_api_access', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable public API access']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO site_settings (`key`, value, type, description) VALUES (?, ?, ?, ?)");
    foreach ($defaultSettings as $setting) {
        $stmt->execute([$setting['key'], $setting['value'], $setting['type'], $setting['description']]);
    }
    
    // ==========================================
    // Email Templates
    // ==========================================
    echo "   Creating: Default Email Templates\n";
    
    $emailTemplates = [
        [
            'template_key' => 'verification_pending',
            'name' => 'Submission Confirmation',
            'subject' => 'Your verification request was received - Reference: {{reference}}',
            'html_body' => '
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: #e8f4f8; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .info-box strong { color: #667eea; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .status-badge { display: inline-block; background: #ffc107; color: #333; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        a { color: #667eea; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Verification Received</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{customer_name}}</strong>,</p>
            
            <p>Your coupon verification request was received successfully. We are currently reviewing it and will notify you of the result within 24-48 hours.</p>

            <div class="details">
                <div class="details-row">
                    <span><strong>Tracking Reference:</strong></span>
                    <span style="font-weight: bold; color: #667eea;">{{reference}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Coupon Type:</strong></span>
                    <span>{{coupon_title}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Amount:</strong></span>
                    <span>{{amount}} {{currency}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Submission Date:</strong></span>
                    <span>{{submission_date}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Status:</strong></span>
                    <span class="status-badge">Pending Verification</span>
                </div>
            </div>

            <div class="info-box">
                <strong>💡 Keep in Mind:</strong>
                <p>Our team verifies each submission to ensure its authenticity. Please keep your reference number to track your request.</p>
            </div>

            <p>Best regards,<br><strong>The CouponVerify Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 CouponVerify. All rights reserved.<br>
            This email was sent to {{customer_email}}</p>
        </div>
    </div>
</body>
</html>',
            'text_body' => 'Hello {{customer_name}},

Your verification request was received successfully.

Reference: {{reference}}
Coupon: {{coupon_title}}
Amount: {{amount}} {{currency}}
Date: {{submission_date}}
Status: Pending Verification

We will notify you of the result within 24-48 hours.

Best regards,
The CouponVerify Team',
            'variables' => '["customer_name","customer_email","reference","coupon_title","amount","currency","submission_date"]'
        ],
        [
            'template_key' => 'verification_approved',
            'name' => 'Verification Approved',
            'subject' => '🎉 Your coupon has been verified successfully!',
            'html_body' => '
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .success-box h3 { color: #155724; margin-top: 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .status-badge { display: inline-block; background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Verification Approved!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{customer_name}}</strong>,</p>
            
            <div class="success-box">
                <h3>✓ Congratulations!</h3>
                <p>Your coupon verification request has been <strong>approved</strong>.</p>
            </div>

            <div class="details">
                <div class="details-row">
                    <span><strong>Reference:</strong></span>
                    <span style="color: #28a745; font-weight: bold;">{{reference}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Coupon:</strong></span>
                    <span>{{coupon_title}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Validated Amount:</strong></span>
                    <span>{{amount}} {{currency}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Approval Date:</strong></span>
                    <span>{{approval_date}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Status:</strong></span>
                    <span class="status-badge">APPROVED</span>
                </div>
            </div>

            <p>Thank you for using our platform. Your verification is now valid and can be used according to the coupon\'s terms and conditions.</p>
            
            <p style="text-align: center;">
                <a href="{{dashboard_url}}" class="button">View my dashboard</a>
            </p>
            
            <p>Best regards,<br><strong>The CouponVerify Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
            'text_body' => 'Hello {{customer_name}},

CONGRATULATIONS! 🎉

Your verification request has been APPROVED.

Reference: {{reference}}
Coupon: {{coupon_title}}
Amount: {{amount}} {{currency}}
Date: {{approval_date}}

Thank you for using CouponVerify!

Best regards,
The CouponVerify Team',
            'variables' => '["customer_name","customer_email","reference","coupon_title","amount","currency","approval_date","dashboard_url"]'
        ],
        [
            'template_key' => 'verification_rejected',
            'name' => 'Verification Rejected',
            'subject' => 'Status of your verification request - Reference: {{reference}}',
            'html_body' => '
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .warning-box h3 { color: #856404; margin-top: 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .reason-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .reason-box strong { color: #721c24; }
        .button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠ Request Not Approved</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{customer_name}}</strong>,</p>
            
            <p>After reviewing your verification request, we were unable to approve it at this time.</p>

            <div class="details">
                <div class="details-row">
                    <span><strong>Reference:</strong></span>
                    <span style="color: #f39c12; font-weight: bold;">{{reference}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Coupon:</strong></span>
                    <span>{{coupon_title}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Reason:</strong></span>
                    <span>{{rejection_reason}}</span>
                </div>
            </div>

            <div class="reason-box">
                <strong>Why?</strong>
                <p>{{detailed_reason}}</p>
            </div>

            <h3>What to do now?</h3>
            <ul>
                <li>Verify that all documents meet the criteria</li>
                <li>Verify that the information is accurate and up-to-date</li>
                <li>You can submit a new request after making corrections</li>
            </ul>

            <p style="text-align: center;">
                <a href="{{contact_url}}" class="button">Contact Us</a>
            </p>

            <p>Feel free to contact us if you have any questions.</p>
            <p>Best regards,<br><strong>The CouponVerify Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
            'text_body' => 'Hello {{customer_name}},

After reviewing your request, we could not approve it.

Reference: {{reference}}
Coupon: {{coupon_title}}
Reason: {{rejection_reason}}

Detailed reason:
{{detailed_reason}}

You can submit a new request after making corrections.

Best regards,
The CouponVerify Team',
            'variables' => '["customer_name","customer_email","reference","coupon_title","rejection_reason","detailed_reason","contact_url"]'
        ],
        [
            'template_key' => 'verification_blocked',
            'name' => 'Coupon Bloqué',
            'subject' => '⛔ Votre coupon a été bloqué',
            'html_body' => '
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .alert-box h3 { color: #721c24; margin-top: 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .details-row:last-child { border-bottom: none; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⛔ Coupon Blocked</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{customer_name}}</strong>,</p>
            
            <div class="alert-box">
                <h3>Coupon Blocked</h3>
                <p>Your coupon verification request has been <strong>blocked</strong> due to suspicious activity or policy violations.</p>
            </div>

            <div class="details">
                <div class="details-row">
                    <span><strong>Reference:</strong></span>
                    <span>{{reference}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Coupon:</strong></span>
                    <span>{{coupon_title}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Amount:</strong></span>
                    <span>{{amount}} {{currency}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Block Date:</strong></span>
                    <span>{{block_date}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Block Reason:</strong></span>
                    <span>{{block_reason}}</span>
                </div>
            </div>

            <p><strong>Why is this coupon blocked?</strong></p>
            <p>{{block_details}}</p>

            <h3>What can you do?</h3>
            <ul>
                <li>Review the reason for blocking</li>
                <li>Ensure your coupon is legitimate and authentic</li>
                <li>You may appeal this decision if you believe it was made in error</li>
            </ul>

            <p style="text-align: center;">
                <a href="{{appeal_url}}" class="button">Appeal This Decision</a>
            </p>

            <p>If you have questions about this decision, please contact our support team.</p>
            <p>Best regards,<br><strong>The CouponVerify Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>',
            'text_body' => 'Hello {{customer_name}},

Your coupon has been blocked.

Reference: {{reference}}
Coupon: {{coupon_title}}
Amount: {{amount}} {{currency}}
Date: {{block_date}}
Reason: {{block_reason}}

Detailed reason:
{{block_details}}

You may appeal this decision if you believe it was made in error.

Best regards,
The CouponVerify Team',
        'variables' => '["customer_name","customer_email","reference","coupon_title","amount","currency","block_reason","block_date","block_details","appeal_url"]'
    ]
];
    
    $stmt = $pdo->prepare("INSERT INTO email_templates (template_key, name, subject, html_body, text_body, variables) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($emailTemplates as $template) {
        $stmt->execute([
            $template['template_key'],
            $template['name'],
            $template['subject'],
            $template['html_body'],
            $template['text_body'],
            $template['variables']
        ]);
    }
    
    // ==========================================
    // Categories
    // ==========================================
    echo "   Creating: Default Categories\n";
    
    $categories = [
        ['name' => 'iTunes', 'slug' => 'itunes', 'description' => 'Apple iTunes Gift Cards'],
        ['name' => 'Google Play', 'slug' => 'google-play', 'description' => 'Google Play Store Gift Cards'],
        ['name' => 'Amazon', 'slug' => 'amazon', 'description' => 'Amazon Gift Cards'],
        ['name' => 'PlayStation', 'slug' => 'playstation', 'description' => 'PlayStation Network Gift Cards'],
        ['name' => 'Prepaid', 'slug' => 'prepaid', 'description' => 'Prepaid Gift Cards'],
        ['name' => 'Xbox', 'slug' => 'xbox', 'description' => 'Xbox Game Pass & Gift Cards'],
        ['name' => 'Netflix', 'slug' => 'netflix', 'description' => 'Netflix Subscription Gift Cards'],
        ['name' => 'Spotify', 'slug' => 'spotify', 'description' => 'Spotify Premium Gift Cards'],
        ['name' => 'Steam', 'slug' => 'steam', 'description' => 'Steam Gaming Platform Gift Cards'],
        ['name' => 'Other', 'slug' => 'other', 'description' => 'Other Gift Cards'],
    ];
    
    $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)");
    foreach ($categories as $cat) {
        $stmt->execute([$cat['name'], $cat['slug'], $cat['description']]);
    }
    
    // ==========================================
    // Coupons
    // ==========================================
    echo "   Creating: Default Coupons\n";
    
    $coupons = [
        [
            'name' => 'iTunes Gift Card',
            'slug' => 'itunes-giftcard',
            'short_description' => 'Apple iTunes Gift Cards',
            'theme_color' => '#000000',
            'category' => 'iTunes',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP', 'CAD']),
            'logo' => 'https://livecards.net/_pl/be-itunes-gc-10-eur-70050.png',
            'cover_image' => 'https://livecards.net/_pl/be-itunes-gc-10-eur-70050.png',
            'logo_alt' => 'iTunes Gift Cards',
            'cover_image_alt' => 'iTunes Gift Cards',
            'seo_title' => 'Verify iTunes Gift Cards Instantly - CouponVerify',
            'seo_description' => 'Verify iTunes gift cards quickly and securely. Check balance and validate Apple gift card codes.',
            'seo_keywords' => 'iTunes gift card, verify gift card, check balance, Apple gift card',
            'og_image_url' => 'https://livecards.net/_pl/be-itunes-gc-10-eur-70050.png',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Google Play Card',
            'slug' => 'google-play-card',
            'short_description' => 'Google Play Store Gift Cards',
            'theme_color' => '#34A853',
            'category' => 'Google Play',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://meremobil.dk/wp-content/uploads/2024/10/Logo_Play_512px_clr.original.jpg',
            'cover_image' => 'https://meremobil.dk/wp-content/uploads/2024/10/Logo_Play_512px_clr.original.jpg',
            'logo_alt' => 'Google Play Store Gift Cards',
            'cover_image_alt' => 'Google Play Store Gift Cards',
            'seo_title' => 'Verify Google Play Gift Cards Online - CouponVerify',
            'seo_description' => 'Verify Google Play store credits and gift cards instantly. Free verification service with no hidden fees.',
            'seo_keywords' => 'Google Play gift card, verify Google Play code, Android gift card, Play Store verification',
            'og_image_url' => 'https://meremobil.dk/wp-content/uploads/2024/10/Logo_Play_512px_clr.original.jpg',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Amazon Gift Card',
            'slug' => 'amazon-giftcard',
            'short_description' => 'Amazon Gift Cards',
            'theme_color' => '#FF9900',
            'category' => 'Amazon',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://eshop.umniah.com/media/catalog/product/cache/10f775673909dc895c411fb073a2d26d/1/0/10_amazon_gift_card.png',
            'cover_image' => 'https://eshop.umniah.com/media/catalog/product/cache/10f775673909dc895c411fb073a2d26d/1/0/10_amazon_gift_card.png',
            'logo_alt' => 'Amazon Gift Cards',
            'cover_image_alt' => 'Amazon Gift Cards',
            'seo_title' => 'Verify Amazon Gift Cards Safely - CouponVerify',
            'seo_description' => 'Verify your Amazon gift cards instantly. Check card balance and validate Amazon vouchers in seconds.',
            'seo_keywords' => 'Amazon gift card, verify coupon code, check balance, Amazon voucher, gift card verification',
            'og_image_url' => 'https://eshop.umniah.com/media/catalog/product/cache/10f775673909dc895c411fb073a2d26d/1/0/10_amazon_gift_card.png',
            'custom_head_html' => ''
        ],
        [
            'name' => 'PlayStation Card',
            'slug' => 'playstation-card',
            'short_description' => 'PlayStation Network Gift Cards',
            'theme_color' => '#003087',
            'category' => 'PlayStation',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://cdn.gameseal.com/media/bd/65/50/1669889570/PlayStation%20Network%20Card%20100USD%20USA.png',
            'cover_image' => 'https://cdn.gameseal.com/media/bd/65/50/1669889570/PlayStation%20Network%20Card%20100USD%20USA.png',
            'logo_alt' => 'Playstation Gift Cards',
            'cover_image_alt' => 'Playstation Gift Cards',
            'seo_title' => 'Verify PlayStation Network Cards - CouponVerify',
            'seo_description' => 'Verify PSN gift cards online. Check PlayStation Network card balances and validate codes.',
            'seo_keywords' => 'PlayStation gift card, PSN card, verify PS4 code, PlayStation Network verification',
            'og_image_url' => 'https://cdn.gameseal.com/media/bd/65/50/1669889570/PlayStation%20Network%20Card%20100USD%20USA.png',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Xbox Gift Card',
            'slug' => 'xbox-gift-card',
            'short_description' => 'Xbox Game Pass & Gift Cards',
            'theme_color' => '#107C10',
            'category' => 'Xbox',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://gaming-cdn.com/images/products/12487/orig/xbox-gift-card-50gbp-gbp50-card-xbox-one-xbox-series-x-s-pc-game-microsoft-store-united-kingdom-cover.jpg?v=1745404006',
            'cover_image' => 'https://gaming-cdn.com/images/products/12487/orig/xbox-gift-card-50gbp-gbp50-card-xbox-one-xbox-series-x-s-pc-game-microsoft-store-united-kingdom-cover.jpg?v=1745404006',
            'logo_alt' => 'Xbox Gift Cards',
            'cover_image_alt' => 'Xbox Gift Cards',
            'seo_title' => 'Verify Xbox Gift Cards & Game Pass - CouponVerify',
            'seo_description' => 'Verify Xbox gift cards and Game Pass codes instantly. Validate Microsoft Store vouchers securely.',
            'seo_keywords' => 'Xbox gift card, verify Game Pass code, Microsoft gift card, Xbox Live verification',
            'og_image_url' => 'https://gaming-cdn.com/images/products/12487/orig/xbox-gift-card-50gbp-gbp50-card-xbox-one-xbox-series-x-s-pc-game-microsoft-store-united-kingdom-cover.jpg?v=1745404006',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Netflix Card',
            'slug' => 'netflix-card',
            'short_description' => 'Netflix Subscription Gift Cards',
            'theme_color' => '#E50914',
            'category' => 'Netflix',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://cdn.gameseal.com/media/89/98/1a/1715246622/Ramka%20Netflix%201000%20TURKEY.png',
            'cover_image' => 'https://cdn.gameseal.com/media/89/98/1a/1715246622/Ramka%20Netflix%201000%20TURKEY.png',
            'logo_alt' => 'Netflix Gift Cards',
            'cover_image_alt' => 'Netflix Gift Cards',
            'seo_title' => 'Verify Netflix Gift Cards - CouponVerify',
            'seo_description' => 'Verify Netflix subscription gift cards instantly. Check balance and validate Netflix vouchers.',
            'seo_keywords' => 'Netflix gift card, verify Netflix code, subscription voucher, Netflix card verification',
            'og_image_url' => 'https://cdn.gameseal.com/media/89/98/1a/1715246622/Ramka%20Netflix%201000%20TURKEY.png',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Spotify Card',
            'slug' => 'spotify-card',
            'short_description' => 'Spotify Premium Gift Cards',
            'theme_color' => '#1DB954',
            'category' => 'Spotify',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://static01.galaxus.com/productimages/7/4/8/2/2/2/9/2/2/1/4/8/3/3/2/9/3/0/4/7542e495-719f-40d8-b286-5a189fa9ee82.png_720.jpeg',
            'cover_image' => 'https://static01.galaxus.com/productimages/7/4/8/2/2/2/9/2/2/1/4/8/3/3/2/9/3/0/4/7542e495-719f-40d8-b286-5a189fa9ee82.png_720.jpeg',
            'logo_alt' => 'Spotify Gift Cards',
            'cover_image_alt' => 'Spotify Gift Cards',
            'seo_title' => 'Verify Spotify Premium Gift Cards - CouponVerify',
            'seo_description' => 'Verify Spotify gift cards and vouchers instantly. Check subscription codes securely.',
            'seo_keywords' => 'Spotify gift card, verify Spotify code, music subscription, premium membership verification',
            'og_image_url' => 'https://static01.galaxus.com/productimages/7/4/8/2/2/2/9/2/2/1/4/8/3/3/2/9/3/0/4/7542e495-719f-40d8-b286-5a189fa9ee82.png_720.jpeg',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Steam Card',
            'slug' => 'steam-card',
            'short_description' => 'Steam Gaming Platform Gift Cards',
            'theme_color' => '#1B2838',
            'category' => 'Steam',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBQQaDDKKJMipUtfEYPaQxJMAQJIq6faTZgA&s',
            'cover_image' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBQQaDDKKJMipUtfEYPaQxJMAQJIq6faTZgA&s',
            'logo_alt' => 'Steam Gift Cards',
            'cover_image_alt' => 'Steam Gift Cards',
            'seo_title' => 'Verify Steam Gift Cards Online - CouponVerify',
            'seo_description' => 'Verify Steam wallet gift cards quickly. Check balance and validate Steam codes.',
            'seo_keywords' => 'Steam gift card, verify Steam code, gaming wallet, Steam voucher verification',
            'og_image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBQQaDDKKJMipUtfEYPaQxJMAQJIq6faTZgA&s',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Neosurf',
            'slug' => 'neosurf',
            'short_description' => 'Neosurf prepaid card verification',
            'theme_color' => '#D120AB',
            'category' => 'Prepaid',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://www.mygiftcardsupply.com/wp-content/uploads/2024/08/neosurf-eu.png',
            'cover_image' => 'https://www.mygiftcardsupply.com/wp-content/uploads/2024/08/neosurf-eu.png',
            'logo_alt' => 'Neosurf Gift Cards',
            'cover_image_alt' => 'Neosurf Gift Cards',
            'seo_title' => 'Verify Neosurf Prepaid Cards - CouponVerify',
            'seo_description' => 'Verify Neosurf prepaid cards instantly. Check balance and validate Neosurf vouchers online.',
            'seo_keywords' => 'Neosurf card, verify prepaid card, check balance, Neosurf voucher verification',
            'og_image_url' => 'https://www.mygiftcardsupply.com/wp-content/uploads/2024/08/neosurf-eu.png',
            'custom_head_html' => ''
        ],
        [
            'name' => 'Paysafecard',
            'slug' => 'paysafecard',
            'short_description' => 'Paysafecard prepaid card verification',
            'theme_color' => '#D120AB',
            'category' => 'Prepaid',
            'supported_currencies' => json_encode(['USD', 'EUR', 'GBP']),
            'logo' => 'https://cds.epayworldwide.com/front/images/thegiftstation_com_au-image-sync/products/product_33347.png?width=1600&height=900',
            'cover_image' => 'https://cds.epayworldwide.com/front/images/thegiftstation_com_au-image-sync/products/product_33347.png?width=1600&height=900',
            'logo_alt' => 'Paysafecard Gift Cards',
            'cover_image_alt' => 'Paysafecard Gift Cards',
            'seo_title' => 'Verify Paysafecard Prepaid Vouchers - CouponVerify',
            'seo_description' => 'Verify Paysafecard prepaid vouchers securely. Check pin codes and validate Paysafecard payments.',
            'seo_keywords' => 'Paysafecard, verify prepaid voucher, check balance, Paysafecard verification',
            'og_image_url' => 'https://cds.epayworldwide.com/front/images/thegiftstation_com_au-image-sync/products/product_33347.png?width=1600&height=900',
            'custom_head_html' => ''
        ],
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO coupons 
        (name, slug, short_description, theme_color, category, supported_currencies, logo, cover_image, logo_alt, cover_image_alt, seo_title, seo_description, seo_keywords, og_image_url, custom_head_html)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($coupons as $coupon) {
        $stmt->execute([
            $coupon['name'],
            $coupon['slug'],
            $coupon['short_description'],
            $coupon['theme_color'],
            $coupon['category'],
            $coupon['supported_currencies'],
            $coupon['logo'],
            $coupon['cover_image'],
            $coupon['logo_alt'],
            $coupon['cover_image_alt'],
            $coupon['seo_title'],
            $coupon['seo_description'],
            $coupon['seo_keywords'],
            $coupon['og_image_url'],
            $coupon['custom_head_html'],
        ]);
    }
    
    echo "\n✅ Installation terminée avec succès!\n\n";
    echo "═══════════════════════════════════════════════════════════════\n";
    echo "📋 Résumé:\n";
    echo "   ✓ 12 tables créées\n";
    echo "   ✓ 1 administrateur par défaut: admin / admin\n";
    echo "   ✓ 16 paramètres globaux du site configurés\n";
    echo "   ✓ 4 templates d'email disponibles\n";
    echo "   ✓ 9 catégories ajoutées\n";
    echo "   ✓ 10 coupons par défaut avec SEO configurés\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";
    
    echo "🔧 Configuration initiale recommandée:\n";
    echo "   1. Changer le mot de passe admin\n";
    echo "   2. Vérifier et ajuster les paramètres SEO du site\n";
    echo "   3. Configurer les paramètres SMTP pour les emails\n";
    echo "   4. Ajouter des logos/images personnalisés pour les coupons\n\n";
    
} catch (PDOException $e) {
    echo "\n❌ Erreur d'installation: " . $e->getMessage() . "\n\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Erreur: " . $e->getMessage() . "\n\n";
    exit(1);
}
