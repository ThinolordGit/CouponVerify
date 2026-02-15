<?php
/**
 * app/Controllers/VerificationController.php - Verification Controller
 * Handles coupon verification submissions and lookups
 */

namespace App\Controllers;
use App\Models\VerificationModel;
use App\Models\CouponModel;
use App\Utils\Validator;
use App\Services\EmailService;
use App\Services\PushNotificationService;

class VerificationController extends BaseController {

    private $verificationModel;
    private $couponModel;
    private $emailService;
    private $pushService;

    public function __construct($pdo) {
        parent::__construct($pdo);
        $this->verificationModel = new VerificationModel($this->sqlHelper);
        $this->couponModel = new CouponModel($this->sqlHelper);
        $this->emailService = new EmailService($this->sqlHelper);
        $this->pushService = new PushNotificationService($this->sqlHelper);
    }

    /**
     * POST /api/verifications/submit - Submit new verification
     */
    public function submitVerification() {
        $this->requireMethod('POST');

        try {
            $body = $this->getBody();

            // Validate input
            $validator = new Validator();
            $rules = [
                'coupon_id' => 'required|numeric',
                'code' => 'required|min:3|max:255',
                'amount' => 'required|numeric',
                'currency' => 'required',
                'recharge_date' => 'required',
                'recharge_time' => 'required',
                'email' => 'required|email'
            ];

            if (!$validator->validate($body, $rules)) {
                $this->validationError($validator->getErrors());
            }
            
            // Validate currency
            if (!Validator::currency($body['currency'])) {
                $this->error('Invalid currency code', 422);
            }
            
            // Check coupon exists
            $coupon = $this->couponModel->getById((int)$body['coupon_id']);
            if (!$coupon) {
                $this->notFound('Coupon not found');
            }
            
            // Rate limiting check (5 per 10 minutes per email)
            $recent_count = $this->checkRateLimit($body['email'], 10 * 60, 1000);
            if ($recent_count >= 5) {
                $this->error('Too many verification attempts. Please try again later.', 429);
            }

            // Generate hash to detect duplicates
            $code_hash = hash('sha256', $body['code']);

            // Check for duplicate code submission
            if ($this->verificationModel->codeHashExists($code_hash)) {
                $this->error('This code has already been verified', 409);
            }
            
            // TODO: In production, encrypt the code with AES-256
            // For now, we'll just store it as-is (implement CryptoService later)
            $code_encrypted = $body['code']; // TODO: Encrypt this

            // Prepare verification data
            $verification_data = [
                'transaction_reference' => $this->generateTransactionReference(),
                'coupon_id' => (int)$body['coupon_id'],
                'coupon_type' => $coupon['name'],
                'email' => $body['email'],
                'user_ip' => $this->getUserIp(),
                'user_uuid' => $body['user_uuid'] ?? null,
                'code_encrypted' => $code_encrypted,
                'code_hash' => $code_hash,
                'amount' => (float)$body['amount'],
                'currency' => strtoupper($body['currency']),
                'recharge_date' => $body['recharge_date'],
                'recharge_time' => $body['recharge_time'],
                'status' => 'pending',
                'reference' => $this->generateReference('REF'),
                'message' => 'Verification submitted. Please wait for confirmation.'
            ];

            // Create verification record
            $verification = $this->verificationModel->create($verification_data);

            if (!$verification) {
                $this->error('Failed to create verification', 500);
            }

            // Increment coupon verification count
            $this->couponModel->incrementVerificationCount($coupon['id']);

            // Send emails and notifications in background (non-blocking)
            // These are wrapped in try-catch to prevent any failure from blocking response
            try {
                // Send client confirmation (fire and forget)
                $this->sendAsync('sendVerificationConfirmation', [$verification, $coupon]);
            } catch (\Exception $e) {
                error_log("Background task failed (confirmation): " . $e->getMessage());
            }

            try {
                // Notify admins (fire and forget)
                $this->sendAsync('notifyAdminsNewVerification', [$verification, $coupon]);
            } catch (\Exception $e) {
                error_log("Background task failed (admin notify): " . $e->getMessage());
            }

            // Return response immediately (hide encrypted code)
            unset($verification['code_encrypted']);
            unset($verification['code_hash']);

            $this->success([
                'verification' => $verification
            ], 'Verification submitted successfully', 201);

        } catch (\Exception $e) {
            error_log("Error in submitVerification: " . $e->getMessage());
            $this->error('Failed to submit verification', 500);
        }
    }

    /**
     * Execute async background task without blocking response
     * Uses output buffering to detach from client connection
     */
    private function sendAsync($method, $args) {
        try {
            // Close client connection first
            if (!headers_sent()) {
                header('Connection: close');
                header('Content-Length: 0');
            }
            ob_end_flush();
            flush();

            // Now execute background tasks
            switch ($method) {
                case 'sendVerificationConfirmation':
                    $this->emailService->sendVerificationConfirmation($args[0], $args[1]);
                    break;
                case 'notifyAdminsNewVerification':
                    $this->pushService->notifyAdminsNewVerification($args[0], $args[1]);
                    $this->emailService->sendAdminNotification($args[0], $args[1], 'NEW_VERIFICATION');
                    break;
            }
        } catch (\Exception $e) {
            error_log("Async task error: " . $e->getMessage());
        }
    }

    /**
     * GET /api/verifications/:reference - Get verification by reference
     */
    public function getVerificationByReference($reference) {
        $this->requireMethod('GET');

        try {
            $verification = $this->verificationModel->getByReference($reference);

            if (!$verification) {
                $this->notFound('Verification not found');
            }
            
            // Remove sensitive data
            unset($verification['code_encrypted']);
            unset($verification['code_hash']);
            unset($verification['user_ip']);

            $this->success([
                'verification' => $verification
            ], 'Verification retrieved successfully');

        } catch (\Exception $e) {
            error_log("Error in getVerificationByReference: " . $e->getMessage());
            $this->error('Failed to fetch verification', 500);
        }
    }

    /**
     * Check rate limiting for email
     */
    private function checkRateLimit($email, $time_window, $limit) {
        try {
            $pdo = $this->pdo;
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count FROM verifications
                WHERE email = ? AND submitted_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ");
            $stmt->execute([$email, $time_window]);
            $result = $stmt->fetch();
            return (int)$result['count'];
        } catch (\Exception $e) {
            error_log("Error in checkRateLimit: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get verification model
     */
    public function getModel() {
        return $this->verificationModel;
    }
}
