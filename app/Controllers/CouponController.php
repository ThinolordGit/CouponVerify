<?php
/**
 * app/Controllers/CouponController.php - Coupon Controller
 * Handles coupon-related business logic
 */

namespace App\Controllers;

use App\Models\CouponModel;
use App\Utils\Validator;

class CouponController extends BaseController {
    
    private $couponModel;

    public function __construct($pdo) {
        parent::__construct($pdo);
        $this->couponModel = new CouponModel($this->sqlHelper);
    }

    /**
     * GET /api/coupons - Get all active coupons
     */
    public function getAllCoupons() {
        $this->requireMethod('GET');

        try {
            $limit = $this->getQuery('limit') ? (int)$this->getQuery('limit') : 50;
            $offset = $this->getQuery('offset') ? (int)$this->getQuery('offset') : 0;

            $coupons = $this->couponModel->getAllActive($limit, $offset);

            // Parse JSON fields
            foreach ($coupons as &$coupon) {
                if (isset($coupon['supported_currencies'])) {
                    $coupon['supported_currencies'] = json_decode($coupon['supported_currencies'], true);
                }
            }

            $this->success([
                'coupons' => $coupons,
                'total' => count($coupons),
                'limit' => $limit,
                'offset' => $offset
            ], 'Coupons retrieved successfully');

        } catch (\Exception $e) {
            error_log("Error in getAllCoupons: " . $e->getMessage());
            $this->error('Failed to fetch coupons', 500);
        }
    }

    /**
     * GET /api/coupons/:slug - Get single coupon by slug
     */
    public function getCouponBySlug($slug) {
        $this->requireMethod('GET');

        try {
            $coupon = $this->couponModel->getBySlug($slug);

            if (!$coupon) {
                $this->notFound('Coupon not found');
            }

            // Parse JSON fields
            if (isset($coupon['supported_currencies'])) {
                $coupon['supported_currencies'] = json_decode($coupon['supported_currencies'], true);
            }

            // Add instructions and FAQs placeholders
            $coupon['instructions'] = [
                'Enter the ' . $coupon['name'] . ' code on the card',
                'Enter the amount and currency',
                'Verify your email address',
                'Wait for confirmation'
            ];

            $coupon['faqs'] = [
                [
                    'question' => 'What is ' . $coupon['name'] . '?',
                    'answer' => $coupon['short_description']
                ],
                [
                    'question' => 'How long does verification take?',
                    'answer' => 'Most verifications are completed instantly, some may require manual review.'
                ],
                [
                    'question' => 'What if my code is invalid?',
                    'answer' => 'Please check the code again and ensure it has not been used previously.'
                ]
            ];

            $this->success([
                'coupon' => $coupon
            ], 'Coupon retrieved successfully');

        } catch (\Exception $e) {
            error_log("Error in getCouponBySlug: " . $e->getMessage());
            $this->error('Failed to fetch coupon', 500);
        }
    }

    /**
     * POST /api/admin/coupons - Create new coupon (admin only)
     */
    public function createCoupon() {
        $this->requireMethod('POST');

        try {
            $body = $this->getBody();

            // Validate required fields
            // Accept either 'category' or 'category_id'
            $category = $body['category'] ?? null;
            if (!$category && isset($body['category_id'])) {
                // If category_id provided, use it as category name for now
                // In a real app, you'd fetch the category name from the categories table
                $category = $body['category_id'];
            }

            $required = ['name', 'slug', 'short_description'];
            foreach ($required as $field) {
                if (empty($body[$field])) {
                    $this->error("Field '$field' is required", 400);
                }
            }

            if (!$category) {
                $this->error("Field 'category' is required", 400);
            }

            // Prepare coupon data
            $couponData = [
                'name' => trim($body['name']),
                'slug' => trim($body['slug']),
                'short_description' => trim($body['short_description']),
                'category' => trim($category),
                'supported_currencies' => $body['supported_currencies'] ?? ['USD'],
                'is_active' => $body['is_active'] ?? true,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];

            // Optional fields
            if (isset($body['logo'])) $couponData['logo'] = $body['logo'];
            if (isset($body['logo_alt'])) $couponData['logo_alt'] = $body['logo_alt'];
            if (isset($body['cover_image'])) $couponData['cover_image'] = $body['cover_image'];
            if (isset($body['cover_image_alt'])) $couponData['cover_image_alt'] = $body['cover_image_alt'];
            if (isset($body['theme_color'])) $couponData['theme_color'] = $body['theme_color'];

            // Create coupon
            $coupon = $this->couponModel->create($couponData);

            if (!$coupon) {
                $this->error('Failed to create coupon', 500);
            }

            // Parse JSON fields
            if (isset($coupon['supported_currencies'])) {
                $coupon['supported_currencies'] = json_decode($coupon['supported_currencies'], true);
            }

            $this->success([
                'coupon' => $coupon
            ], 'Coupon created successfully', 201);

        } catch (\Exception $e) {
            error_log("Error in createCoupon: " . $e->getMessage());
            $this->error('Failed to create coupon', 500);
        }
    }

    /**
     * PUT /api/admin/coupons/:id - Update coupon (admin only)
     */
    public function updateCoupon($id) {
        $this->requireMethod('PUT');

        try {
            $id = (int)$id;

            // Check if coupon exists
            $existing = $this->couponModel->getById($id);
            if (!$existing) {
                $this->notFound('Coupon not found');
            }

            $body = $this->getBody();

            // Prepare update data (only update fields that are provided)
            $updateData = [];

            if (isset($body['name'])) {
                $updateData['name'] = trim($body['name']);
            }
            if (isset($body['slug'])) {
                $updateData['slug'] = trim($body['slug']);
            }
            if (isset($body['short_description'])) {
                $updateData['short_description'] = trim($body['short_description']);
            }
            // Accept both 'category' and 'category_id'
            if (isset($body['category'])) {
                $updateData['category'] = trim($body['category']);
            } elseif (isset($body['category_id'])) {
                $updateData['category'] = trim($body['category_id']);
            }
            if (isset($body['supported_currencies'])) {
                $updateData['supported_currencies'] = $body['supported_currencies'];
            }
            if (isset($body['is_active'])) {
                $updateData['is_active'] = $body['is_active'] ? 1 : 0;
            }
            if (isset($body['logo'])) {
                $updateData['logo'] = $body['logo'];
            }
            if (isset($body['logo_alt'])) {
                $updateData['logo_alt'] = $body['logo_alt'];
            }
            if (isset($body['cover_image'])) {
                $updateData['cover_image'] = $body['cover_image'];
            }
            if (isset($body['cover_image_alt'])) {
                $updateData['cover_image_alt'] = $body['cover_image_alt'];
            }
            if (isset($body['theme_color'])) {
                $updateData['theme_color'] = $body['theme_color'];
            }

            $updateData['updated_at'] = date('Y-m-d H:i:s');

            // Update coupon
            $coupon = $this->couponModel->update($id, $updateData);

            if (!$coupon) {
                $this->error('Failed to update coupon', 500);
            }

            // Parse JSON fields
            if (isset($coupon['supported_currencies'])) {
                $coupon['supported_currencies'] = json_decode($coupon['supported_currencies'], true);
            }

            $this->success([
                'coupon' => $coupon
            ], 'Coupon updated successfully');

        } catch (\Exception $e) {
            error_log("Error in updateCoupon: " . $e->getMessage());
            $this->error('Failed to update coupon', 500);
        }
    }

    /**
     * DELETE /api/admin/coupons/:id - Delete coupon (admin only)
     */
    public function deleteCoupon($id) {
        $this->requireMethod('DELETE');

        try {
            $id = (int)$id;

            // Check if coupon exists
            $existing = $this->couponModel->getById($id);
            if (!$existing) {
                $this->notFound('Coupon not found');
            }

            // Delete coupon
            $deleted = $this->couponModel->delete($id);

            if (!$deleted) {
                $this->error('Failed to delete coupon', 500);
            }

            $this->success(null, 'Coupon deleted successfully');

        } catch (\Exception $e) {
            error_log("Error in deleteCoupon: " . $e->getMessage());
            $this->error('Failed to delete coupon', 500);
        }
    }

    /**
     * GET /api/admin/coupons - Get all coupons with filters (admin only)
     */
    public function getAllCouponsAdmin() {
        $this->requireMethod('GET');

        try {
            $filters = [
                'active' => $this->getQuery('active'),
                'category' => $this->getQuery('category'),
                'search' => $this->getQuery('search'),
                'limit' => $this->getQuery('limit') ? (int)$this->getQuery('limit') : 50,
                'offset' => $this->getQuery('offset') ? (int)$this->getQuery('offset') : 0
            ];

            // Remove nulls
            $filters = array_filter($filters, fn($v) => $v !== null);

            $coupons = $this->couponModel->getAll($filters);

            // Parse JSON fields
            foreach ($coupons as &$coupon) {
                if (isset($coupon['supported_currencies'])) {
                    $coupon['supported_currencies'] = json_decode($coupon['supported_currencies'], true);
                }
            }

            $total = $this->couponModel->countAll($filters);

            $this->success([
                'coupons' => $coupons,
                'total' => $total,
                'limit' => $filters['limit'],
                'offset' => $filters['offset']
            ], 'Coupons retrieved successfully');

        } catch (\Exception $e) {
            error_log("Error in getAllCouponsAdmin: " . $e->getMessage());
            $this->error('Failed to fetch coupons', 500);
        }
    }

    /**
     * GET /api/coupons/:slug/seo - Get SEO data for a coupon
     */
    public function getCouponSeo($slug) {
        $this->requireMethod('GET');

        try {
            $coupon = $this->couponModel->getBySlug($slug);

            if (!$coupon) {
                $this->notFound('Coupon not found');
                return;
            }

            // Extract SEO fields
            $seoData = [
                'title' => $coupon['seo_title'] ?? $coupon['name'],
                'description' => $coupon['seo_description'] ?? $coupon['short_description'],
                'keywords' => $coupon['seo_keywords'] ?? '',
                'ogImage' => $coupon['og_image_url'] ?? $coupon['logo'],
                'customHead' => $coupon['custom_head_html'] ?? '',
                'couponName' => $coupon['name'],
                'couponSlug' => $coupon['slug'],
                'couponLogo' => $coupon['logo']
            ];

            $this->success($seoData, 'Coupon SEO data retrieved');

        } catch (\Exception $e) {
            error_log("Error in getCouponSeo: " . $e->getMessage());
            $this->error('Failed to fetch coupon SEO data', 500);
        }
    }

    /**
     * Get coupon model instance
     */
    public function getModel() {
        return $this->couponModel;
    }
}
