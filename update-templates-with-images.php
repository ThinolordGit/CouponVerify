<?php
/**
 * update-templates-with-images.php
 * Update email templates to include coupon images
 */

require_once __DIR__ . '/config/database.php';

try {
    
    // Update verification_pending template with coupon logo
    $verification_pending_html = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .coupon-info { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .coupon-logo { max-width: 120px; height: auto; margin: 10px 0; }
        .info-row { display: flex; margin: 10px 0; }
        .info-label { font-weight: 600; min-width: 120px; color: #667eea; }
        .info-value { flex: 1; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Submission Confirmation</h1>
            <p>Your coupon verification request was received</p>
        </div>
        
        <div class="content">
            <p>Hello {{customer_name}},</p>
            
            <p>Thank you for submitting your coupon for verification. We have received your request and our team is currently reviewing the information provided.</p>
            
            <div class="coupon-info">
                <strong>Coupon Details</strong>
                {{#coupon_logo}}
                <div style="text-align: center;">
                    <img src="{{coupon_logo}}" alt="{{coupon_logo_alt}}" class="coupon-logo">
                </div>
                {{/coupon_logo}}
                
                <div class="info-row">
                    <div class="info-label">Coupon:</div>
                    <div class="info-value"><strong>{{coupon_title}}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Reference:</div>
                    <div class="info-value"><code>{{reference}}</code></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Amount:</div>
                    <div class="info-value">{{amount}} {{currency}}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Submitted On:</div>
                    <div class="info-value">{{submission_date}}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value"><span class="badge">Pending Review</span></div>
                </div>
            </div>
            
            <p>You will receive a notification as soon as your verification is completed.</p>
            
            <p style="text-align: center;">
                <a href="{{dashboard_url}}" class="button">View My Dashboard</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you have any questions, please visit our <a href="{{contact_url}}" style="color: #667eea; text-decoration: none;">help center</a>.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;

    // Update verification_approved template with coupon cover and logo
    $verification_approved_html = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .success-box { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .success-box h2 { margin: 0 0 10px 0; color: #10b981; font-size: 24px; }
        .coupon-info { background: #f3f4f6; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .coupon-cover { width: 100%; max-width: 500px; height: auto; margin: 10px 0; border-radius: 4px; }
        .coupon-logo { max-width: 100px; height: auto; margin: 10px 0; }
        .info-row { display: flex; margin: 12px 0; align-items: center; }
        .info-label { font-weight: 600; min-width: 120px; color: #10b981; }
        .info-value { flex: 1; }
        .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Verification Approved!</h1>
            <p>Your coupon has been validated</p>
        </div>
        
        <div class="content">
            <p>Hello {{customer_name}},</p>
            
            <div class="success-box">
                <h2>✓ Success!</h2>
                <p>Your coupon verification has been approved successfully.</p>
            </div>
            
            {{#coupon_cover}}
            <div style="text-align: center; margin: 20px 0;">
                <img src="{{coupon_cover}}" alt="{{coupon_cover_alt}}" class="coupon-cover">
            </div>
            {{/coupon_cover}}
            
            <div class="coupon-info">
                <strong>Validated Coupon Details</strong>
                {{#coupon_logo}}
                <div style="text-align: center;">
                    <img src="{{coupon_logo}}" alt="{{coupon_logo_alt}}" class="coupon-logo">
                </div>
                {{/coupon_logo}}
                
                <div class="info-row">
                    <div class="info-label">Coupon:</div>
                    <div class="info-value"><strong>{{coupon_title}}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Reference:</div>
                    <div class="info-value"><code>{{reference}}</code></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Validated Amount:</div>
                    <div class="info-value"><strong>{{amount}} {{currency}}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Approved On:</div>
                    <div class="info-value">{{approval_date}}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value"><span class="badge">✓ Validated</span></div>
                </div>
            </div>
            
            <p>You can now view the complete details of your approved verification in your dashboard.</p>
            
            <p style="text-align: center;">
                <a href="{{dashboard_url}}" class="button">View My Dashboard</a>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;

    // Update verification_rejected template
    $verification_rejected_html = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .warning-box { background: #fff7ed; border: 2px solid #f97316; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .warning-box h2 { margin: 0 0 10px 0; color: #f97316; font-size: 20px; }
        .coupon-info { background: #f3f4f6; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .coupon-logo { max-width: 100px; height: auto; margin: 10px 0; }
        .info-row { display: flex; margin: 12px 0; }
        .info-label { font-weight: 600; min-width: 120px; color: #f97316; }
        .info-value { flex: 1; }
        .badge { display: inline-block; background: #fed7aa; color: #92400e; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠ Verification Rejected</h1>
            <p>Corrections are needed</p>
        </div>
        
        <div class="content">
            <p>Hello {{customer_name}},</p>
            
            <p>Unfortunately, your coupon verification submission could not be approved.</p>
            
            <div class="warning-box">
                <h2>Rejection Reason</h2>
                <p><strong>{{rejection_reason}}</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">{{detailed_reason}}</p>
            </div>
            
            <div class="coupon-info">
                <strong>Coupon Involved</strong>
                {{#coupon_logo}}
                <div style="text-align: center;">
                    <img src="{{coupon_logo}}" alt="{{coupon_logo_alt}}" class="coupon-logo">
                </div>
                {{/coupon_logo}}
                
                <div class="info-row">
                    <div class="info-label">Coupon:</div>
                    <div class="info-value"><strong>{{coupon_title}}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Reference:</div>
                    <div class="info-value"><code>{{reference}}</code></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Amount:</div>
                    <div class="info-value">{{amount}} {{currency}}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value"><span class="badge">✗ Rejected</span></div>
                </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul style="color: #555;">
                <li>Please correct the identified issues</li>
                <li>Resubmit your verification with the correct information</li>
                <li>Contact our support if you have any questions</li>
            </ul>
            
            <p style="text-align: center;">
                <a href="{{contact_url}}" class="button">Contact Support</a>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;

    // Update verification_blocked template
    $verification_blocked_html = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .alert-box { background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .alert-box h2 { margin: 0 0 10px 0; color: #ef4444; font-size: 20px; }
        .coupon-info { background: #f3f4f6; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .coupon-logo { max-width: 100px; height: auto; margin: 10px 0; }
        .info-row { display: flex; margin: 12px 0; }
        .info-label { font-weight: 600; min-width: 120px; color: #ef4444; }
        .info-value { flex: 1; }
        .badge { display: inline-block; background: #fee2e2; color: #7f1d1d; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⛔ Account Suspended</h1>
            <p>Your account has been temporarily disabled</p>
        </div>
        
        <div class="content">
            <p>Hello {{customer_name}},</p>
            
            <div class="alert-box">
                <h2>Account Suspension</h2>
                <p><strong>{{block_reason}}</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">{{block_details}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Suspension Date:</strong> {{block_date}}</p>
            </div>
            
            <div class="coupon-info">
                <strong>Related Coupon</strong>
                {{#coupon_logo}}
                <div style="text-align: center;">
                    <img src="{{coupon_logo}}" alt="{{coupon_logo_alt}}" class="coupon-logo">
                </div>
                {{/coupon_logo}}
                
                <div class="info-row">
                    <div class="info-label">Coupon:</div>
                    <div class="info-value"><strong>{{coupon_title}}</strong></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Reference:</div>
                    <div class="info-value"><code>{{reference}}</code></div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value"><span class="badge">⛔ Blocked</span></div>
                </div>
            </div>
            
            <p><strong>Appeal Suspension:</strong></p>
            <p>If you believe this decision is an error or wish to appeal, you can contact us using the link below.</p>
            
            <p style="text-align: center;">
                <a href="{{appeal_url}}" class="button">File an Appeal</a>
            </p>
            
            <p style="font-size: 14px; margin-top: 20px;">For more information, please review our <a href="{{contact_url}}" style="color: #ef4444; text-decoration: none;">terms of use</a>.</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">© 2026 CouponVerify. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;

    // Update templates with new HTML (with images support)
    $templates = [
        [
            'template_key' => 'verification_pending',
            'name' => 'Submission Confirmation',
            'subject' => 'Confirmation of your submission - Reference: {{reference}}',
            'html_body' => $verification_pending_html,
            'variables' => json_encode([
                'customer_name', 'customer_email', 'reference', 'coupon_title', 
                'coupon_logo', 'coupon_logo_alt',
                'amount', 'currency', 'submission_date', 
                'dashboard_url', 'contact_url'
            ])
        ],
        [
            'template_key' => 'verification_approved',
            'name' => 'Verification Approved',
            'subject' => '🎉 Your coupon {{coupon_title}} has been validated!',
            'html_body' => $verification_approved_html,
            'variables' => json_encode([
                'customer_name', 'customer_email', 'reference', 'coupon_title',
                'coupon_logo', 'coupon_logo_alt', 'coupon_cover', 'coupon_cover_alt',
                'amount', 'currency', 'approval_date',
                'dashboard_url'
            ])
        ],
        [
            'template_key' => 'verification_rejected',
            'name' => 'Verification Rejected',
            'subject' => 'Your coupon verification was rejected - {{reference}}',
            'html_body' => $verification_rejected_html,
            'variables' => json_encode([
                'customer_name', 'customer_email', 'reference', 'coupon_title',
                'coupon_logo', 'coupon_logo_alt',
                'amount', 'currency', 'rejection_reason', 'detailed_reason',
                'contact_url'
            ])
        ],
        [
            'template_key' => 'verification_blocked',
            'name' => 'Account Blocked',
            'subject' => 'Your account has been suspended',
            'html_body' => $verification_blocked_html,
            'variables' => json_encode([
                'customer_name', 'customer_email', 'reference', 'coupon_title',
                'coupon_logo', 'coupon_logo_alt',
                'block_reason', 'block_details', 'block_date',
                'appeal_url', 'contact_url'
            ])
        ]
    ];

    foreach ($templates as $template) {
        $stmt = $pdo->prepare("
            UPDATE email_templates 
            SET name = ?, subject = ?, html_body = ?, variables = ?, updated_at = NOW()
            WHERE template_key = ?
        ");
        
        $result = $stmt->execute([
            $template['name'],
            $template['subject'],
            $template['html_body'],
            $template['variables'],
            $template['template_key']
        ]);
        
        if ($result) {
            echo "✅ Updated: {$template['name']}\n";
        } else {
            echo "❌ Failed to update: {$template['name']}\n";
        }
    }
    
    echo "\n✅ All templates updated with image support!\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
