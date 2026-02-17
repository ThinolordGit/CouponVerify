<?php
/**
 * api/refunds.php - Refund Endpoints
 * POST /api/refunds/submit - submit refund
 * GET  /api/refunds/:reference - get refund by reference
 */

use App\Controllers\RefundController;
use App\Utils\HTTPResponse;

try {
    $refundController = new RefundController($pdo);

    // POST /api/refunds/submit
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {
        $refundController->submitRefund();
    }

    // GET /api/refunds/:reference
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($action) && $action !== 'submit') {
        $refundController->getRefundByReference($action);
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log('Refund endpoint error: ' . $e->getMessage());
    HTTPResponse::serverError('Refund endpoint error');
}
