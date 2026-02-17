<?php
/**
 * app/Controllers/RefundController.php
 * Controller for refund request lifecycle (public + admin)
 */

namespace App\Controllers;

use App\Models\RefundModel;
use App\Models\CouponModel;
use App\Utils\Validator;
use App\Services\EmailService;
use App\Services\PushNotificationService;

class RefundController extends BaseController {
    private $refundModel;
    private $couponModel;
    private $emailService;
    private $pushService;

    public function __construct($pdo) {
        parent::__construct($pdo);
        $this->refundModel = new RefundModel($this->sqlHelper);
        $this->couponModel = new CouponModel($this->sqlHelper);
        $this->emailService = new EmailService($this->sqlHelper);
        $this->pushService = new PushNotificationService($this->sqlHelper);
    }

    /**
     * POST /api/refunds/submit - submit refund (supports multipart/form-data)
     */
    public function submitRefund() {
        $this->requireMethod('POST');

        try {
            // Accept JSON or multipart/form-data
            $contentType = $_SERVER['CONTENT_TYPE'] ?? ($_SERVER['HTTP_CONTENT_TYPE'] ?? '');
            if (strpos($contentType, 'multipart/form-data') !== false) {
                $body = $_POST;
            } else {
                $body = $this->getBody();
            }

            // Basic validation
            $validator = new Validator();
            $rules = [
                'coupon_id' => 'required|numeric',
                'code' => 'required|min:3|max:255',
                'amount' => 'required|numeric',
                'currency' => 'required',
                'email' => 'required|email'
            ];

            if (!$validator->validate($body, $rules)) {
                return $this->validationError($validator->getErrors());
            }

            // Validate currency
            if (!Validator::currency($body['currency'])) {
                return $this->error('Invalid currency code', 422);
            }

            // Check coupon exists
            $coupon = $this->couponModel->getById((int)$body['coupon_id']);
            if (!$coupon) return $this->notFound('Coupon not found');

            // Rate limiting: reuse same limits as verification
            $recent_count = $this->checkRateLimit($body['email'], 10 * 60, 1000);
            if ($recent_count >= 5) {
                return $this->error('Too many refund attempts. Please try again later.', 429);
            }

            // Duplicate detection using code hash
            $code_hash = hash('sha256', $body['code']);
            if ($this->refundModel->codeHashExists($code_hash)) {
                return $this->error('A refund request for this code already exists', 409);
            }

            // Handle evidence file uploads (if multipart)
            $evidenceMeta = [];
            if (!empty($_FILES['evidence'])) {
                $uploadsDir = __DIR__ . '/../../public/uploads/refunds';
                if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0755, true);

                $files = $_FILES['evidence'];
                for ($i = 0; $i < count($files['name']); $i++) {
                    if ($files['error'][$i] !== UPLOAD_ERR_OK) continue;
                    $origName = basename($files['name'][$i]);
                    $ext = pathinfo($origName, PATHINFO_EXTENSION);
                    $targetName = sprintf('%s_%s.%s', time(), bin2hex(random_bytes(4)), $ext ?: 'dat');
                    $target = $uploadsDir . '/' . $targetName;
                    if (move_uploaded_file($files['tmp_name'][$i], $target)) {
                        $evidenceMeta[] = [
                            'path' => '/uploads/refunds/' . $targetName,
                            'name' => $origName,
                            'size' => $files['size'][$i]
                        ];
                    }
                }
            }

            // Prepare payload
            $payload = [
                'coupon_id' => (int)$body['coupon_id'],
                'coupon_type' => $coupon['name'] ?? null,
                'code_encrypted' => $body['code'], // TODO: encrypt in future
                'code_hash' => $code_hash,
                'amount' => (float)$body['amount'],
                'currency' => strtoupper($body['currency']),
                'recharge_date' => $body['recharge_date'] ?? null,
                'recharge_time' => $body['recharge_time'] ?? null,
                'email' => $body['email'] ?? null,
                'review_notes' => $body['reason'] ?? null,
                'evidence' => !empty($evidenceMeta) ? json_encode($evidenceMeta) : null,
                'status' => 'pending',
                'reference' => $body['reference'] ?? ('RFD-' . strtoupper(bin2hex(random_bytes(6)))),
                'user_uuid' => $body['user_uuid'] ?? null
            ];

            $refund = $this->refundModel->create($payload);
            if (!$refund) return $this->error('Failed to create refund', 500);

            // Send emails and notifications in background (non-blocking)
            // These are wrapped in try-catch to prevent any failure from blocking response
            try {
                // Send client confirmation (fire and forget)
                $this->sendAsync('sendRefundConfirmation', [$refund, $coupon]);
            } catch (\Exception $e) {
                error_log("Background task failed (confirmation): " . $e->getMessage());
            }

            try {
                // Notify admins (fire and forget)
                $this->sendAsync('notifyAdminsNewRefund', [$refund, $coupon]);
            } catch (\Exception $e) {
                error_log("Background task failed (admin notify): " . $e->getMessage());
            }

            // Remove sensitive fields
            unset($refund['code_encrypted']);
            unset($refund['code_hash']);

            $this->success(['refund' => $refund], 'Refund submitted successfully', 201);
        } catch (\Exception $e) {
            error_log('Error in submitRefund: ' . $e->getMessage());
            $this->error('Failed to submit refund', 500);
        }
    }

    /**
     * GET /api/refunds/:reference - public lookup
     */
    public function getRefundByReference($reference) {
        $this->requireMethod('GET');
        try {
            $refund = $this->refundModel->getByReference($reference);
            if (!$refund) return $this->notFound('Refund not found');
            unset($refund['code_encrypted']);
            unset($refund['code_hash']);
            $this->success(['refund' => $refund]);
        } catch (\Exception $e) {
            error_log('Error fetching refund by reference: ' . $e->getMessage());
            $this->error('Failed to fetch refund', 500);
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
                case 'sendRefundConfirmation':
                    $this->emailService->sendRefundStatusUpdate($args[0], 'pending', null, $args[1]);
                    break;
                case 'notifyAdminsNewRefund':
                    $this->pushService->notifyAdminsNewRefund($args[0], $args[1]);
                    $this->emailService->sendRefundAdminNotification($args[0], 'submitted', $args[1]);
                    break;
            }
        } catch (\Exception $e) {
            error_log("Async task error: " . $e->getMessage());
        }
    }

    /**
     * Local rate-limit check reused from verification controller
     */
    private function checkRateLimit($email, $time_window, $limit) {
        try {
            $pdo = $this->pdo;
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM refunds WHERE email = ? AND submitted_at > DATE_SUB(NOW(), INTERVAL ? SECOND)");
            $stmt->execute([$email, $time_window]);
            $result = $stmt->fetch();
            return (int)$result['count'];
        } catch (\Exception $e) {
            error_log('Error in refund checkRateLimit: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get refund model
     */
    public function getModel() {
        return $this->refundModel;
    }
}
