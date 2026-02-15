<?php
/**
 * app/Models/CouponModel.php - Coupon Data Model
 * Handles all CRUD operations for coupons
 */

namespace App\Models;

class CouponModel {

    private $db;

    public function __construct($sqlHelper) {
        $this->db = $sqlHelper;
    }

    /**
     * Get all active coupons
     */
    public function getAllActive($limit = null, $offset = null) {
        try {
            $coupons = $this->db->read('coupons',
                ['is_active' => true],
                $limit,
                $offset,
                'AND',
                'created_at DESC'
            );
            return $coupons;
        } catch (\Exception $e) {
            error_log("Error fetching active coupons: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get coupon by ID
     */
    public function getById($id) {
        try {
            return $this->db->getOne('coupons', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error fetching coupon by ID: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get coupon by slug
     */
    public function getBySlug($slug) {
        try {
            return $this->db->getOne('coupons', ['slug' => $slug, 'is_active' => true]);
        } catch (\Exception $e) {
            error_log("Error fetching coupon by slug: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create new coupon
     */
    public function create($data) {
        try {
            // Prepare supported_currencies as JSON
            if (isset($data['supported_currencies']) && is_array($data['supported_currencies'])) {
                $data['supported_currencies'] = json_encode($data['supported_currencies']);
            }

            $id = $this->db->create('coupons', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating coupon: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update coupon
     */
    public function update($id, $data) {
        try {
            // Prepare supported_currencies as JSON
            if (isset($data['supported_currencies']) && is_array($data['supported_currencies'])) {
                $data['supported_currencies'] = json_encode($data['supported_currencies']);
            }

            $this->db->update('coupons', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating coupon: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete coupon
     */
    public function delete($id) {
        try {
            $this->db->delete('coupons', ['id' => $id]);
            return true;
        } catch (\Exception $e) {
            error_log("Error deleting coupon: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all coupons (admin)
     */
    public function getAll($filters = []) {
        try {
            $where = [];

            if (isset($filters['active'])) {
                $where['is_active'] = $filters['active'] == 'true' ? 1 : 0;
            }

            if (isset($filters['category'])) {
                $where['category'] = $filters['category'];
            }

            if (isset($filters['search'])) {
                $where['name~'] = $filters['search']; // LIKE search
            }

            $coupons = $this->db->read('coupons',
                !empty($where) ? $where : [],
                isset($filters['limit']) ? (int)$filters['limit'] : null,
                isset($filters['offset']) ? (int)$filters['offset'] : null,
                'AND',
                'created_at DESC'
            );

            return $coupons;
        } catch (\Exception $e) {
            error_log("Error fetching all coupons: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Count total coupons
     */
    public function countAll($filters = []) {
        try {
            $where = [];

            if (isset($filters['active'])) {
                $where['is_active'] = $filters['active'] == 'true' ? 1 : 0;
            }

            if (isset($filters['category'])) {
                $where['category'] = $filters['category'];
            }

            return $this->db->count('coupons', !empty($where) ? $where : []);
        } catch (\Exception $e) {
            error_log("Error counting coupons: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Increment verification count
     */
    public function incrementVerificationCount($coupon_id) {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("UPDATE coupons SET verification_count = verification_count + 1 WHERE id = ?");
            return $stmt->execute([$coupon_id]);
        } catch (\Exception $e) {
            error_log("Error incrementing verification count: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if coupon exists
     */
    public function exists($coupon_id) {
        try {
            return $this->db->exists('coupons', ['id' => $coupon_id]);
        } catch (\Exception $e) {
            error_log("Error checking coupon existence: " . $e->getMessage());
            return false;
        }
    }
}
