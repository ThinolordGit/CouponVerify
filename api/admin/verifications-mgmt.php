<?php
/**
 * api/admin/verifications-mgmt.php - Verification Management
 * GET /api/admin/verifications - Get all verifications
 * POST /api/admin/verifications/{id}/approve - Approve verification
 * POST /api/admin/verifications/{id}/reject - Reject verification
 * POST /api/admin/verifications/{id}/block - Block verification
 */

use App\Controllers\AdminController;
use App\Utils\HTTPResponse;

try {
    $adminController = new AdminController($pdo);

    // GET /api/admin/verifications - Get all verifications
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($param)) {
        $adminController->getVerifications();
    }

    // POST /api/admin/verifications/{id}/{action}
    else if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($param)) {
        [$id, $subaction] = explode('/', $param . '/');
        
        if ($subaction === 'approve') {
            $adminController->approveVerification($id);
        } else if ($subaction === 'reject') {
            $adminController->rejectVerification($id);
        } else if ($subaction === 'block') {
            $adminController->blockVerification($id);
        } else {
            HTTPResponse::error('Invalid action', 400);
        }
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("Verification management endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Verification management endpoint error');
}

