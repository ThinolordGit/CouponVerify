<?php
/**
 * app/Controllers/AdminController.php - Admin Controller
 * Handles dashboard and admin operations
 */

namespace App\Controllers;

use App\Models\VerificationModel;
use App\Models\CouponModel;
use App\Services\EmailService;
use App\Services\PushNotificationService;

class AdminController extends BaseController {

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
     * GET /api/admin/dashboard - Get dashboard stats
     */
    public function getDashboard() {
        $this->requireMethod('GET');

        try {
            // Get verification counts
            $today_count = $this->verificationModel->getTodayCount();
            $validation_rate = $this->verificationModel->getValidationRate();
            $status_counts = $this->verificationModel->countByStatus();
            $pending_count = $status_counts['pending'] ?? 0;

            // Get coupons count
            $total_coupons = $this->couponModel->countAll(['active' => 'true']);

            // Get 7-day trend
            $trends = $this->verificationModel->get7DayTrend();

            // Format trend data for charts
            $day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            $chart_data = [];
            foreach ($trends as $trend) {
                $date = new \DateTime($trend['date']);
                $chart_data[] = [
                    'date' => $day_names[$date->format('N') - 1],
                    'valide' => (int)$trend['valid'],
                    'invalide' => (int)$trend['invalid'],
                    'attente' => (int)$trend['pending']
                ];
            }

            // Get coupon distribution
            $distribution = $this->verificationModel->getDistributionByCoupon();
            $distribution_data = [];
            foreach ($distribution as $item) {
                $distribution_data[] = [
                    'name' => $item['name'],
                    'value' => (int)$item['count'],
                    'percentage' => (float)$item['percentage']
                ];
            }

            // Get recent verifications
            $recent = $this->verificationModel->getAll(['limit' => 5, 'offset' => 0]);

            // Build stats array
            $stats = [
                [
                    'title' => "Verifications Today",
                    'value' => (string)$today_count,
                    'change' => '+12.5%',
                    'changeType' => 'increase',
                    'icon' => 'CheckCircle2',
                    'iconBg' => 'bg-gradient-to-br from-blue-500 to-blue-600'
                ],
                [
                    'title' => 'Validation Rate',
                    'value' => $validation_rate . '%',
                    'change' => '+3.2%',
                    'changeType' => 'increase',
                    'icon' => 'TrendingUp',
                    'iconBg' => 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                ],
                [
                    'title' => 'Pending',
                    'value' => (string)$pending_count,
                    'change' => '-8 vs yesterday',
                    'changeType' => 'decrease',
                    'icon' => 'Clock',
                    'iconBg' => 'bg-gradient-to-br from-amber-500 to-amber-600'
                ],
                [
                    'title' => 'Active Coupons',
                    'value' => (string)$total_coupons,
                    'change' => '+2 this month',
                    'changeType' => 'increase',
                    'icon' => 'Ticket',
                    'iconBg' => 'bg-gradient-to-br from-purple-500 to-purple-600'
                ]
            ];

            // Build response
            $response = [
                'stats' => $stats,
                'verificationChart' => $chart_data,
                'couponDistribution' => array_slice($distribution_data, 0, 6), // Top 6
                'recentVerifications' => $recent
            ];

            $this->success($response, 'Dashboard data retrieved');

        } catch (\Exception $e) {
            error_log("Dashboard error: " . $e->getMessage());
            $this->error('Failed to get dashboard data', 500);
        }
    }

    /**
     * GET /api/admin/verifications - Get all verifications (with filters)
     */
    public function getVerifications() {
        $this->requireMethod('GET');

        try {
            $status = $_GET['status'] ?? null;
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = (int)($_GET['offset'] ?? 0);

            $filters = [
                'limit' => $limit,
                'offset' => $offset
            ];

            if ($status) {
                $filters['status'] = $status;
            }

            $verifications = $this->verificationModel->getAll($filters);

            // Sanitize sensitive data while preserving code for admin UI
            $sanitized = [];
            foreach ($verifications as $v) {
                // Keep code_encrypted for admin display (will show masked in UI)
                // But remove hash and IP for privacy
                unset($v['code_hash']);
                unset($v['user_ip']);
                $sanitized[] = $v;
            }

            $this->success([
                'verifications' => $sanitized
            ], 'Verifications retrieved');

        } catch (\Exception $e) {
            error_log("Error fetching verifications: " . $e->getMessage());
            $this->error('Failed to fetch verifications', 500);
        }
    }

    /**
     * POST /api/admin/verifications/:id/approve - Approve verification
     */
    public function approveVerification($verificationId) {
        $this->requireMethod('POST');

        try {
            $verification = $this->verificationModel->getById((int)$verificationId);

            if (!$verification) {
                $this->notFound('Verification not found');
            }

            $updated = $this->verificationModel->update((int)$verificationId, [
                'status' => 'valid',
                'verified_at' => date('Y-m-d H:i:s'),
                'resolved_at' => date('Y-m-d H:i:s')
            ]);

            if (!$updated) {
                $this->error('Failed to approve verification', 500);
            }

            // Récupérer le coupon pour les notifications
            $coupon = $this->couponModel->getById($verification['coupon_id']);
            
            // Envoyer les notifications en arrière-plan (non-bloquant)
            if ($coupon) {
                try {
                    // Update verification status for notification
                    $verification['status'] = 'valid';
                    $this->sendAsync('statusUpdate', [
                        'verification' => $verification,
                        'coupon' => $coupon,
                        'newStatus' => 'valid'
                    ]);
                } catch (\Exception $e) {
                    error_log("Background task failed (approve): " . $e->getMessage());
                }
            }

            $this->success(['verification' => $updated], 'Verification approved', 200);
        
        } catch (\Exception $e) {
            error_log("Error approving verification: " . $e->getMessage());
            $this->error('Failed to approve verification', 500);
        }
    }

    /**
     * POST /api/admin/verifications/:id/reject - Reject verification
     */
    public function rejectVerification($verificationId) {
        $this->requireMethod('POST');

        try {
            $body = $this->getBody();
            $reason = $body['reason'] ?? 'No reason provided';

            $verification = $this->verificationModel->getById((int)$verificationId);

            if (!$verification) {
                $this->notFound('Verification not found');
            }

            $updated = $this->verificationModel->update((int)$verificationId, [
                'status' => 'invalid',
                'rejection_reason' => $reason,
                'resolved_at' => date('Y-m-d H:i:s')
            ]);

            if (!$updated) {
                $this->error('Failed to reject verification', 500);
            }

            // Récupérer le coupon pour les notifications
            $coupon = $this->couponModel->getById($verification['coupon_id']);

            // Envoyer les notifications en arrière-plan (non-bloquant)
            if ($coupon) {
                try {
                    // Update verification status for notification
                    $verification['status'] = 'invalid';
                    $this->sendAsync('statusUpdate', [
                        'verification' => $verification,
                        'coupon' => $coupon,
                        'newStatus' => 'invalid'
                    ]);
                } catch (\Exception $e) {
                    error_log("Background task failed (reject): " . $e->getMessage());
                }
            }

            $this->success(['verification' => $updated], 'Verification rejected', 200);

        } catch (\Exception $e) {
            error_log("Error rejecting verification: " . $e->getMessage());
            $this->error('Failed to reject verification', 500);
        }
    }

    /**
     * POST /api/admin/verifications/:id/block - Block verification
     */
    public function blockVerification($verificationId) {
        $this->requireMethod('POST');

        try {
            $body = $this->getBody();
            $reason = $body['reason'] ?? 'Blocked by admin';

            $verification = $this->verificationModel->getById((int)$verificationId);

            if (!$verification) {
                $this->notFound('Verification not found');
            }

            $updated = $this->verificationModel->update((int)$verificationId, [
                'status' => 'blocked',
                'blocking_reason' => $reason,
                'blocked_at' => date('Y-m-d H:i:s')
            ]);

            if (!$updated) {
                $this->error('Failed to block verification', 500);
            }

            // Récupérer le coupon pour les notifications
            $coupon = $this->couponModel->getById($verification['coupon_id']);

            // Envoyer les notifications en arrière-plan (non-bloquant)
            if ($coupon) {
                try {
                    $this->sendAsync('statusUpdate', [
                        'verification' => $verification,
                        'coupon' => $coupon,
                        'blocking_reason' => $reason,
                        'newStatus' => 'blocked'
                    ]);
                } catch (\Exception $e) {
                    error_log("Background task failed (block): " . $e->getMessage());
                }
            }

            $this->success(['verification' => $updated], 'Verification blocked', 200);

        } catch (\Exception $e) {
            error_log("Error blocking verification: " . $e->getMessage());
            $this->error('Failed to block verification', 500);
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
                case 'statusUpdate':
                    $verification = $args['verification'];
                    $coupon = $args['coupon'];
                    $blockingReason = $args['blocking_reason'];
                    $newStatus = $args['newStatus'];
                    
                    // Send email notification
                    $this->emailService->sendStatusUpdate($verification, $coupon, $newStatus, $blockingReason);
                    
                    // Send push notification
                    $userUUID = $verification['user_uuid'] ?? null;
                    if ($userUUID) {
                        $this->pushService->notifyClientStatusUpdate($verification, $coupon, $newStatus, $userUUID);
                    }
                    break;
            }
        } catch (\Exception $e) {
            error_log("Async task error: " . $e->getMessage());
        }
    }
}