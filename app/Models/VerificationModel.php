<?php
/**
 * app/Models/VerificationModel.php - Verification Data Model
 * Handles all CRUD operations for verifications
 */

namespace App\Models;

use SQLHelper;

class VerificationModel {

    private $db;
    
    public function __construct(SQLHelper $sqlHelper) {
        $this->db = $sqlHelper;
    }
    
    /**
     * Create new verification
     */
    public function create($data) {
        try {
            $id = $this->db->create('verifications', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating verification: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get verification by ID
     */
    public function getById($id) {
        try {
            $stmt = $this->db->db->prepare("SELECT * FROM verifications WHERE id = ?");
            $stmt->execute([(int)$id]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (\Exception $e) {
            error_log("Error fetching verification by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get verification by reference (public lookup)
     */
    public function getByReference($reference) {
        try {
            return $this->db->getOne('verifications', ['reference' => $reference]);
        } catch (\Exception $e) {
            error_log("Error fetching verification by reference: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get verification by transaction reference
     */
    public function getByTransactionReference($transaction_ref) {
        try {
            return $this->db->getOne('verifications', ['transaction_reference' => $transaction_ref]);
        } catch (\Exception $e) {
            error_log("Error fetching verification by transaction reference: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check code hash exists (duplicate detection)
     */
    public function codeHashExists($code_hash) {
        try {
            return $this->db->exists('verifications', ['code_hash' => $code_hash]);
        } catch (\Exception $e) {
            error_log("Error checking code hash: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update verification
     */
    public function update($id, $data) {
        try {
            $this->db->update('verifications', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating verification: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update status
     */
    public function updateStatus($id, $status, $message = null, $verifiedAt = true) {
        try {
            $data = ['status' => $status];
            if ($message) {
                $data['message'] = $message;
            }
            if ($verifiedAt) {
                $data['verified_at'] = date('Y-m-d H:i:s');
            }

            return $this->update($id, $data);
        } catch (\Exception $e) {
            error_log("Error updating verification status: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all verifications (admin, with filters)
     */
    public function getAll($filters = []) {
        try {
            $where = [];
            $whereClause = "1=1";
            $params = [];

            if (isset($filters['status'])) {
                $whereClause .= " AND v.status = ?";
                $params[] = $filters['status'];
            }

            if (isset($filters['coupon_id'])) {
                $whereClause .= " AND v.coupon_id = ?";
                $params[] = (int)$filters['coupon_id'];
            }

            if (isset($filters['email'])) {
                $whereClause .= " AND v.email = ?";
                $params[] = $filters['email'];
            }

            if (isset($filters['date_from']) && isset($filters['date_to'])) {
                $whereClause .= " AND v.submitted_at BETWEEN ? AND ?";
                $params[] = $filters['date_from'] . ' 00:00:00';
                $params[] = $filters['date_to'] . ' 23:59:59';
            }

            $limit = isset($filters['limit']) ? (int)$filters['limit'] : 20;
            $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;

            // Join with coupons table to get logo
            $sql = <<<SQL
            SELECT 
                v.*,
                c.logo as coupon_logo,
                c.name as coupon_name
            FROM verifications v
            LEFT JOIN coupons c ON v.coupon_id = c.id
            WHERE $whereClause
            ORDER BY v.submitted_at DESC
            LIMIT ? OFFSET ?
            SQL;

            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->db->prepare($sql);
            $stmt->execute($params);
            $verifications = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return $verifications ?: [];
        } catch (\Exception $e) {
            error_log("Error fetching all verifications: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Count verifications with filters
     */
    public function countAll($filters = []) {
        try {
            $where = [];

            if (isset($filters['status'])) {
                $where['status'] = $filters['status'];
            }

            if (isset($filters['coupon_id'])) {
                $where['coupon_id'] = (int)$filters['coupon_id'];
            }

            return $this->db->count('verifications', !empty($where) ? $where : []);
        } catch (\Exception $e) {
            error_log("Error counting verifications: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get verifications by coupon (for stats)
     */
    public function getByStatus($status = null) {
        try {
            if ($status) {
                return $this->db->read('verifications',
                    ['status' => $status],
                    null,
                    null,
                    'AND',
                    'submitted_at DESC'
                );
            }
            return [];
        } catch (\Exception $e) {
            error_log("Error fetching verifications by status: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Count by status
     */
    public function countByStatus() {
        try {
            $statuses = ['valid', 'invalid', 'pending', 'blocked'];
            $counts = [];

            foreach ($statuses as $status) {
                $counts[$status] = $this->db->count('verifications', ['status' => $status]);
            }

            return $counts;
        } catch (\Exception $e) {
            error_log("Error counting by status: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get today's count
     */
    public function getTodayCount() {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count FROM verifications
                WHERE DATE(submitted_at) = DATE(NOW())
            ");
            $stmt->execute();
            $result = $stmt->fetch();
            return $result['count'] ?? 0;
        } catch (\Exception $e) {
            error_log("Error getting today's count: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get validation rate
     */
    public function getValidationRate() {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END) as valid_count
                FROM verifications
                WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ");
            $stmt->execute();
            $result = $stmt->fetch();

            if ($result['total'] == 0) {
                return 0;
            }

            return round(($result['valid_count'] / $result['total']) * 100, 1);
        } catch (\Exception $e) {
            error_log("Error calculating validation rate: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get verification distribution by coupon
     */
    public function getDistributionByCoupon() {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("
                SELECT
                    c.id,
                    c.name,
                    COUNT(v.id) as count,
                    ROUND((COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM verifications)), 2) as percentage
                FROM coupons c
                LEFT JOIN verifications v ON c.id = v.coupon_id
                GROUP BY c.id, c.name
                ORDER BY count DESC
            ");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\Exception $e) {
            error_log("Error getting distribution by coupon: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get 7-day trend
     */
    public function get7DayTrend() {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("
                SELECT
                    DATE(submitted_at) as date,
                    SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END) as valid,
                    SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END) as invalid,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM verifications
                WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(submitted_at)
                ORDER BY date ASC
            ");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (\Exception $e) {
            error_log("Error getting 7-day trend: " . $e->getMessage());
            return [];
        }
    }
}
