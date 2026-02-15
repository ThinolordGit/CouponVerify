<?php
/**
 * create-email-templates-table.php
 * Create email_templates table for configurable email templates
 */

require_once __DIR__ . '/config/database.php';

echo "Creating email_templates table...\n\n";

try {
    $sql = "CREATE TABLE IF NOT EXISTS `email_templates` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
    echo "✅ Table created successfully\n\n";

    // Check if templates exist
    $stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM email_templates");
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result['cnt'] == 0) {
        echo "📧 Installing default email templates...\n\n";

        // Template 1: Verification Pending Confirmation
        $templates = [
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
                    <span><strong>Statut:</strong></span>
                    <span class="status-badge">Pending Verification</span>
                </div>
            </div>

            <div class="info-box">
                <strong>💡 Keep in Mind:</strong>
                <p>Our team verifies each submission to ensure its authenticity. Please keep your reference number to track your request.</p>
            </div>

            <p>Cordialement,<br><strong>L\'équipe CouponVerify</strong></p>
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
                'variables' => json_encode(['customer_name', 'customer_email', 'reference', 'coupon_title', 'amount', 'currency', 'submission_date'])
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
                    <span><strong>Référence:</strong></span>
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
                    <span><strong>Statut:</strong></span>
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
            <p>© 2026 CouponVerify. Tous droits réservés.</p>
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
                'variables' => json_encode(['customer_name', 'customer_email', 'reference', 'coupon_title', 'amount', 'currency', 'approval_date', 'dashboard_url'])
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
                    <span><strong>Référence:</strong></span>
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
            <p>© 2026 CouponVerify. Tous droits réservés.</p>
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
                'variables' => json_encode(['customer_name', 'customer_email', 'reference', 'coupon_title', 'rejection_reason', 'detailed_reason', 'contact_url'])
            ],
            [
                'template_key' => 'verification_blocked',
                'name' => 'Account Blocked',
                'subject' => '⛔ Your account has been suspended',
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
            <h1>⛔ Account Suspended</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{customer_name}}</strong>,</p>
            
            <div class="alert-box">
                <h3>Account Suspension</h3>
                <p>Your account has been <strong>suspended</strong> due to violations of our terms of service.</p>
            </div>

            <div class="details">
                <div class="details-row">
                    <span><strong>Account:</strong></span>
                    <span>{{customer_email}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Reason:</strong></span>
                    <span>{{block_reason}}</span>
                </div>
                <div class="details-row">
                    <span><strong>Date:</strong></span>
                    <span>{{block_date}}</span>
                </div>
            </div>

            <p><strong>Reason for suspension:</strong></p>
            <p>{{block_details}}</p>

            <p style="text-align: center;">
                <a href="{{appeal_url}}" class="button">Appeal This Decision</a>
            </p>

            <p>If you believe this is an error, you can contact us to appeal this decision.</p>
            <p>Best regards,<br><strong>The CouponVerify Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2026 CouponVerify. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>',
                'text_body' => 'Hello {{customer_name}},

Your account has been suspended.

Email: {{customer_email}}
Reason: {{block_reason}}
Date: {{block_date}}

Detailed reason: {{block_details}}

You can appeal this decision.

Best regards,
The CouponVerify Team',
                'variables' => json_encode(['customer_name', 'customer_email', 'block_reason', 'block_date', 'block_details', 'appeal_url'])
            ]
        ];

        foreach ($templates as $template) {
            $stmt = $pdo->prepare("
                INSERT INTO email_templates 
                (template_key, name, subject, html_body, text_body, variables)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            try {
                $stmt->execute([
                    $template['template_key'],
                    $template['name'],
                    $template['subject'],
                    $template['html_body'],
                    $template['text_body'],
                    $template['variables']
                ]);
            echo "✅ Installed: " . $template['name'] . "\n";
            } catch (Exception $e) {
                echo "⚠️  Error installing " . $template['name'] . ": " . $e->getMessage() . "\n";
            }
        }

        echo "\n✅ All templates installed successfully!\n";
    } else {
        echo "ℹ️  Templates already exist (" . $result['cnt'] . ")\n";
    }

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
