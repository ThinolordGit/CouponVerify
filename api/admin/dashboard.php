<?php
/**
 * api/admin/dashboard.php - Admin Dashboard Stats
 * GET /api/admin/dashboard - Get dashboard data with stats and charts
 */

use App\Controllers\CouponController;
use App\Controllers\AdminController;
use App\Utils\HTTPResponse;

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
    }

    $adminController = new AdminController($pdo);
    $adminController->getDashboard();

} catch (\Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
    HTTPResponse::serverError('Dashboard error');
}
