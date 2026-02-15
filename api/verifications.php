<?php
/**
 * api/verifications.php - Verification Endpoints
 * POST /api/verifications/submit - Submit new verification
 * GET /api/verifications/:reference - Get verification by reference
 */

use App\Controllers\VerificationController;
use App\Utils\HTTPResponse;

try {
    $verificationController = new VerificationController($pdo);

    // POST /api/verifications/submit
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {
        $verificationController->submitVerification();
    }
    
    // GET /api/verifications/:reference
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($action) && $action !== 'submit') {
        $verificationController->getVerificationByReference($action);
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("Verification endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Verification endpoint error');
}
