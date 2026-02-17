<?php
/**
 * api/admin/refunds-mgmt.php - Refunds Management (admin)
 * GET  /api/admin/refunds            - list refunds (optional ?status=...)
 * POST /api/admin/refunds/{id}/approve|reject|block - update status
 */

use App\Controllers\AdminController;
use App\Utils\HTTPResponse;

try {
    $adminController = new AdminController($pdo);

    // GET /api/admin/refunds - list
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($param)) {
        $adminController->getRefunds();
    }
    
    // POST /api/admin/refunds/{id}/{action}
    else if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($param)) {
        [$id, $subaction] = explode('/', $param . '/');
        if ($subaction === 'approve') {
            $adminController->approveRefund($id);
        } else if ($subaction === 'reject') {
            $adminController->rejectRefund($id);
        } else if ($subaction === 'block') {
            $adminController->blockRefund($id);
        } else {
            HTTPResponse::error('Invalid action', 400);
        }
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log('Admin refunds management error: ' . $e->getMessage());
    HTTPResponse::serverError('Admin refunds management error');
}
