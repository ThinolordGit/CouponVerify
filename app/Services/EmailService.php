<?php
/**
 * app/Services/EmailService.php - Email Service
 * Wrapper around PHPMailer for sending notifications
 */

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Utils\AdminConfig;

class EmailService {
    
    private $mailer;
    private $db;

    public function __construct($sqlHelper) {
        $this->db = $sqlHelper;
        $this->initMailer();
    }

    /**
     * Load SMTP configuration from admin settings (WordPress-style) or environment
     */
    private function loadSmtpConfig() {
        // Normalize SMTP_SECURE: convert string to boolean
        // 'SSL' => false (SMTPS), 'TLS' or anything else => true (STARTTLS)
        $envSecure = strtoupper($_ENV['SMTP_SECURE'] ?? 'TLS');
        $envSecureBoolean = $envSecure === 'SSL' ? false : true;
        
        $config = [
            'host' => $_ENV['SMTP_HOST'] ?? 'smtp.mailtrap.io',
            'port' => $_ENV['SMTP_PORT'] ?? 2525,
            'user' => $_ENV['SMTP_USER'] ?? '',
            'password' => $_ENV['SMTP_PASSWORD'] ?? '',
            'from' => $_ENV['SMTP_FROM_EMAIL'] ?? 'noreply@couponverify.local',
            'fromName' => $_ENV['SMTP_FROM_NAME'] ?? 'CouponVerify',
            'secure' => $envSecureBoolean
        ];

        // Try to load admin-configured SMTP settings using WordPress-style options
        try {
            // Load from admin_config table using AdminConfig utility
            $adminHost = AdminConfig::getOption('SMTP_HOST', '');
            $adminPort = AdminConfig::getOption('SMTP_PORT', '');
            $adminUser = AdminConfig::getOption('SMTP_USER', '');
            $adminPassword = AdminConfig::getOption('SMTP_PASSWORD', '');
            $adminFrom = AdminConfig::getOption('SMTP_FROM_EMAIL', '');
            $adminSecure = AdminConfig::getOption('SMTP_SECURE', 'TLS');

            // Override defaults with admin-configured values (only if not empty)
            if ($adminHost) $config['host'] = $adminHost;
            if ($adminPort) $config['port'] = (int)$adminPort;
            if ($adminUser) $config['user'] = $adminUser;
            if ($adminPassword) $config['password'] = $adminPassword;
            if ($adminFrom) $config['from'] = $adminFrom;
            
            // Handle SMTP_SECURE - can be string ('TLS', 'SSL') or boolean
            // Convert to boolean for consistent internal representation
            if (is_string($adminSecure)) {
                $config['secure'] = strtoupper($adminSecure) === 'SSL' ? false : true; // false=SMTPS(SSL), true=STARTTLS(TLS)
            } else {
                $config['secure'] = (bool)$adminSecure;
            }

            if ($adminHost) {
                error_log("[EmailService] Using admin-configured SMTP settings from options");
            }
        } catch (\Exception $e) {
            error_log("[EmailService] Failed to load admin SMTP config: " . $e->getMessage());
            // Fall back to environment variables
        }

        return $config;
    }

    /**
     * Initialize PHPMailer instance
     */
    private function initMailer() {
        try {
            $smtpConfig = $this->loadSmtpConfig();

            $this->mailer = new PHPMailer(true);
            $this->mailer->isSMTP();
            $this->mailer->Host = $smtpConfig['host'];
            $this->mailer->Port = $smtpConfig['port'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $smtpConfig['user'];
            $this->mailer->Password = $smtpConfig['password'];
            $this->mailer->SMTPSecure = $smtpConfig['secure'] ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
            // $this->mailer->SMTPConnectTimeout = 10; // 10 second timeout
            $this->mailer->SMTPKeepAlive = false;   // Close connection after send
            $this->mailer->From = $smtpConfig['from'];
            $this->mailer->FromName = $smtpConfig['fromName'];
            $this->mailer->isHTML(true);
        } catch (Exception $e) {
            error_log("Mailer init error: " . $e->getMessage());
        }
    }

    /**
     * Send verification confirmation email
     */
    public function sendVerificationConfirmation($verification, $coupon) {
        try {
            $to = $verification['email'];
            $subject = "Confirmation of your submission - Reference: " . $verification['reference'];

            // Get frontend URL
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? $_ENV['APP_URL'] ?? 'http://localhost:5173';

            // Build HTML content with all coupon images
            $html = $this->getTemplate('verification_pending', [
                'customer_name' => $verification['first_name'] ?? 'User',
                'customer_email' => $verification['email'],
                'reference' => $verification['reference'],
                'coupon_title' => $coupon['name'],
                'coupon_logo' => $coupon['logo'] ?? '',
                'coupon_logo_alt' => $coupon['logo_alt'] ?? $coupon['name'],
                'amount' => $verification['amount'],
                'currency' => $verification['currency'],
                'submission_date' => date('Y-m-d H:i', strtotime($verification['created_at'])),
                'dashboard_url' => $frontendUrl . '/user-dashboard',
                'contact_url' => $frontendUrl . '/contact'
            ]);

            return $this->send($to, $subject, $html, $verification['id']);

        } catch (Exception $e) {
            error_log("Error sending verification confirmation: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send status update email
     */
    public function sendStatusUpdate($verification, $coupon, $status, $reason = null, $details = null) {
        try {
            $to = $verification['email'];
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? $_ENV['APP_URL'] ?? 'http://localhost:5173';
            
            // Map statuses to template names
            $templates = [
                'approved' => 'verification_approved',
                'valid' => 'verification_approved',
                'rejected' => 'verification_rejected',
                'invalid' => 'verification_rejected',
                'blocked' => 'verification_blocked',
                'duplicate' => 'verification_rejected'
            ];
            
            $template_name = $templates[$status] ?? 'verification_pending';
            
            // Build base variables
            $variables = [
                'customer_name' => $verification['first_name'] ?? 'User',
                'customer_email' => $verification['email'],
                'reference' => $verification['reference'],
                'coupon_title' => $coupon['name'],
                'coupon_logo' => $coupon['logo'] ?? '',
                'coupon_logo_alt' => $coupon['logo_alt'] ?? $coupon['name'],
                'amount' => $verification['amount'],
                'currency' => $verification['currency'],
                'dashboard_url' => $frontendUrl . '/user-dashboard',
                'contact_url' => $frontendUrl . '/contact'
            ];

            // Add status-specific variables
            switch ($status) {
                case 'approved':
                case 'valid':
                    $variables['approval_date'] = date('Y-m-d H:i');
                    $variables['coupon_cover'] = $coupon['cover_image'] ?? '';
                    $variables['coupon_cover_alt'] = $coupon['cover_image_alt'] ?? $coupon['name'];
                    break;

                case 'rejected':
                case 'invalid':
                case 'duplicate':
                    $variables['rejection_reason'] = $reason ?? 'The information provided is invalid';
                    $variables['detailed_reason'] = $details ?? 'Please contact support for more information';
                    break;

                case 'blocked':
                    $variables['block_reason'] = $reason ?? 'Suspected fraudulent activity';
                    $variables['block_details'] = $details ?? 'Your account has been temporarily suspended for verification';
                    $variables['block_date'] = date('Y-m-d H:i');
                    $variables['appeal_url'] = $frontendUrl . '/appeal';
                    break;
            }

            // Get the appropriate subject based on template
            $subjects = [
                'verification_approved' => '🎉 Your coupon ' . $coupon['name'] . ' has been validated!',
                'verification_rejected' => 'Your coupon verification was rejected - ' . $verification['reference'],
                'verification_blocked' => 'Your account has been suspended'
            ];

            $subject = $subjects[$template_name] ?? 'Update on your coupon verification';

            $html = $this->getTemplate($template_name, $variables);
            // file_put_contents("verif_mail.html",$html);
            return $this->send($to, $subject, $html, $verification['id']);

        } catch (Exception $e) {
            error_log("Error sending status update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get status label
     */
    private function getStatusLabel($status) {
        $labels = [
            'approved' => '✓ Approved',
            'valid' => '✓ Valid',
            'rejected' => '✗ Rejected',
            'invalid' => '✗ Invalid',
            'blocked' => '⚠ Blocked',
            'duplicate' => '⊘ Duplicate'
        ];

        return $labels[$status] ?? ucfirst($status);
    }

    /**
     * Send email to admin
     */
    public function sendAdminNotification($verification, $coupon, $action) {
        try {
            $admin_emails = array_filter(['othnieldos@gmail.com']);
            
            if (empty($admin_emails)) {
                return true; // No admin emails configured
            }

            $subject = "Action on verification: $action - " . $coupon['name'];

            $html = $this->getTemplate('admin-notification', [
                'verification_reference' => $verification['reference'],
                'coupon_type' => $coupon['name'],
                'email' => $verification['email'],
                'amount' => $verification['amount'],
                'currency' => $verification['currency'],
                'action' => $action,
                'timestamp' => date('Y-m-d H:i:s'),
                'admin_link' => $_ENV['APP_URL'] . '/admin/verifications/' . $verification['id']
            ]);

            $result = true;
            foreach ($admin_emails as $email) {
                if (!$this->send($email, $subject, $html, $verification['id'])) {
                    $result = false;
                }
            }

            return $result;

        } catch (Exception $e) {
            error_log("Error sending admin notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send email (generic) - Non-blocking with timeout
     */
    private function send($to, $subject, $html, $verification_id = null) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($to);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $html;
            
            // Use error suppression and timeout for email sending
            // to prevent request from hanging
            $sent = false;
            try {
                @$sent = $this->mailer->send();
            } catch (Exception $e) {
                error_log("Email send timeout or error: " . $e->getMessage());
                $sent = false;
                // Queue for async/retry instead of blocking request
                $this->queueEmailForRetry($to, $subject, $html, $verification_id);
            }

            // Log email notification (async preferred, but log synchronously)
            if ($verification_id) {
                $this->logEmailNotification($verification_id, $to, $subject, $sent);
            }

            return $sent;

        } catch (Exception $e) {
            error_log("Error in send(): " . $e->getMessage());
            // Don't block request on email errors
            return true; // Return true to not block verification creation
        }
    }

    /**
     * Queue email for async/retry processing
     */
    private function queueEmailForRetry($to, $subject, $html, $verification_id) {
        try {
            if ($verification_id) {
                $this->logEmailNotification($verification_id, $to, $subject, false, 'queued');
            }
            error_log("Email queued for retry: $to");
        } catch (\Exception $e) {
            error_log("Failed to queue email: " . $e->getMessage());
        }
    }

    /**
     * Log email notification to database
     */
    private function logEmailNotification($verification_id, $to, $subject, $sent, $status = null) {
        try {
            $data = [
                'verification_id' => $verification_id,
                'recipient_email' => $to,
                'template_type' => 'custom',
                'subject' => $subject,
                'status' => $status ?? ($sent ? 'sent' : 'failed'),
                'sent_at' => $sent ? date('Y-m-d H:i:s') : null
            ];

            $this->db->create('email_notifications', $data);
        } catch (\Exception $e) {
            error_log("Error logging email: " . $e->getMessage());
        }
    }

    /**
     * Get email template (from database first, then file system)
     */
    private function getTemplate($name, $variables = []) {
        // Try loading from database first
        try {
            require_once __DIR__ . '/../../app/Utils/AdminConfig.php';
            
            $stmt = $this->db->db->prepare("
                SELECT html_body FROM email_templates 
                WHERE template_key = ? LIMIT 1
            ");
            $stmt->execute([$name]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($result && $result['html_body']) {
                $html = $result['html_body'];
                
                // Replace both simple variables and conditional blocks
                $html = $this->renderTemplate($html, $variables);
                
                return $html;
            }
        } catch (\Exception $e) {
            error_log("Error loading template from DB: " . $e->getMessage());
        }

        // Fallback to file system
        $template_path = __DIR__ . '/../../templates/' . $name . '.html';

        if (!file_exists($template_path)) {
            // Return a basic HTML if template not found
            return '<h2>' . ($variables['coupon_title'] ?? 'CouponVerify') . '</h2><p>Reference: ' . ($variables['reference'] ?? 'N/A') . '</p>';
        }
        
        $html = file_get_contents($template_path);

        // Replace variables
        $html = $this->renderTemplate($html, $variables);

        return $html;
    }

    /**
     * Render template with variable replacement and conditional blocks
     */
    private function renderTemplate($html, $variables = []) {
        // Handle conditional blocks like {{#image}}content{{/image}}
        // Pattern: {{#variable_name}}content{{/variable_name}}
        $pattern = '/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/s';
        $html = preg_replace_callback($pattern, function($matches) use ($variables) {
            $varName = $matches[1];
            $content = $matches[2];
            
            // Check if variable exists and is not empty
            if (isset($variables[$varName]) && !empty($variables[$varName])) {
                // Recursively replace variables in the conditional block
                return $this->replaceVariables($content, $variables);
            }
            return ''; // Remove the block if condition not met
        }, $html);

        // Replace simple variables like {{variable_name}}
        $html = $this->replaceVariables($html, $variables);

        return $html;
    }

    /**
     * Replace variables in template string
     */
    private function replaceVariables($html, $variables = []) {
        foreach ($variables as $key => $value) {
            $html = str_replace('{{' . $key . '}}', $value, $html);
        }
        return $html;
    }

    /**
     * Test SMTP connection
     */
    public function testConnection() {
        try {
            $this->mailer->smtpConnect();
            return true;
        } catch (Exception $e) {
            error_log("SMTP test error: " . $e->getMessage());
            return false;
        }
    }
}
