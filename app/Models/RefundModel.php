<?php
/**
 * app/Models/RefundModel.php
 * Refund model mirroring VerificationModel structure
 */

namespace App\Models;

use SQLHelper;

class RefundModel {
    private $db;
    
    public function __construct(SQLHelper $sqlHelper) {
        $this->db = $sqlHelper;
    }

    /**
     * Create refund record
     */
    public function create($data) {
        try {
            $id = $this->db->create('refunds', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating refund: " . $e->getMessage());
            return null;
        }
    }

    public function getById($id) {
        try {
            $stmt = $this->db->db->prepare("SELECT * FROM refunds WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$id]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (\Exception $e) {
            error_log("Error fetching refund by ID: " . $e->getMessage());
            return null;
        }
    }

    public function getByReference($reference) {
        try {
            return $this->db->getOne('refunds', ['reference' => $reference]);
        } catch (\Exception $e) {
            error_log("Error fetching refund by reference: " . $e->getMessage());
            return null;
        }
    }

    public function codeHashExists($code_hash) {
        try {
            return $this->db->exists('refunds', ['code_hash' => $code_hash]);
        } catch (\Exception $e) {
            error_log("Error checking refund code hash: " . $e->getMessage());
            return false;
        }
    }

    public function update($id, $data) {
        try {
            $this->db->update('refunds', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating refund: " . $e->getMessage());
            return null;
        }
    }

    public function updateStatus($id, $status, $adminId = null, $notes = null) {
        try {
            $data = [
                'status' => $status,
                'processed_by' => $adminId,
                'admin_notes' => $notes,
                'processed_at' => date('Y-m-d H:i:s')
            ];

            return $this->update($id, $data);
        } catch (\Exception $e) {
            error_log("Error updating refund status: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all refunds (admin)
     */
    public function getAll($filters = []) {
        try {
            $where = [];
            $params = [];
            $whereClause = '1=1';

            if (!empty($filters['status'])) {
                $where[] = 'r.status = :status';
                $params[':status'] = $filters['status'];
            }

            if (!empty($where)) $whereClause = implode(' AND ', $where);

            $limit = isset($filters['limit']) ? (int)$filters['limit'] : 50;
            $offset = isset($filters['offset']) ? (int)$filters['offset'] : 0;

            $sql = "SELECT r.*, c.name as coupon_name, c.logo as coupon_logo FROM refunds r LEFT JOIN coupons c ON r.coupon_id = c.id WHERE {$whereClause} ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?";
            $paramsArr = array_values($params);
            $paramsArr[] = $limit;
            $paramsArr[] = $offset;

            $stmt = $this->db->db->prepare($sql);
            $stmt->execute($paramsArr);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error fetching refunds: " . $e->getMessage());
            return [];
        }
    }

    public function countAll($filters = []) {
        try {
            $where = [];
            if (!empty($filters['status'])) {
                $where['status'] = $filters['status'];
            }
            return $this->db->count('refunds', $where);
        } catch (\Exception $e) {
            error_log("Error counting refunds: " . $e->getMessage());
            return 0;
        }
    }
}
