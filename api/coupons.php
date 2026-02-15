<?php
/**
 * api/coupons.php - Coupon Endpoints
 * GET /api/coupons - Get all active coupons
 * GET /api/coupons/:slug - Get coupon by slug
 * GET /api/coupons/:slug/seo - Get coupon SEO data
 */

use App\Controllers\CouponController;
use App\Utils\HTTPResponse;

try {
    $couponController = new CouponController($pdo);

    // GET /api/coupons
    if (empty($action)) {
        $couponController->getAllCoupons();
    }

    // GET /api/coupons/:slug/seo - Check for SEO endpoint
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($action, '/seo') !== false) {
        $slug = str_replace('/seo', '', $action);
        $couponController->getCouponSeo($slug);
    }

    // GET /api/coupons/:slug
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($action)) {
        $couponController->getCouponBySlug($action);
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("Coupon endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Coupon endpoint error');
}
