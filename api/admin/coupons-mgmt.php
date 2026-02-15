<?php
/**
 * api/admin/coupons-mgmt.php - Coupon Management
 * CRUD operations for coupons (admin only)
 * Protected by JWT in admin/router.php
 */

use App\Controllers\CouponController;
use App\Utils\HTTPResponse;

try {
    $couponController = new CouponController($pdo);

    // GET /api/admin/coupons - Get all coupons (with filters)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($param)) {
        $couponController->getAllCouponsAdmin();
    }

    // POST /api/admin/coupons - Create new coupon
    else if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($param)) {
        $couponController->createCoupon();
    }

    // PUT /api/admin/coupons/:id - Update coupon
    else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && !empty($param)) {
        $couponController->updateCoupon($param);
    }

    // DELETE /api/admin/coupons/:id - Delete coupon
    else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && !empty($param)) {
        $couponController->deleteCoupon($param);
    }

    else {
        HTTPResponse::error('Invalid admin coupon request', 400);
    }

} catch (\Exception $e) {
    error_log("Admin coupon endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Coupon management endpoint error');
}

