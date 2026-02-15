<?php
/**
 * app/Models/UserModel.php - User Data Model
 * Handles all CRUD operations for regular users
 */

namespace App\Models;

use SQLHelper;

class UserModel {
    
    private $db;
    
    public function __construct(SQLHelper $sqlHelper) {
        $this->db = $sqlHelper;
    }

    /**
     * Create new user
     */
    public function create($data) {
        try {
            $id = $this->db->create('users', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating user: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get user by ID
     */
    public function getById($id) {
        try {
            return $this->db->getOne('users', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error fetching user by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get user by email
     */
    public function getByEmail($email) {
        try {
            return $this->db->getOne('users', ['email' => $email]);
        } catch (\Exception $e) {
            error_log("Error fetching user by email: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all users
     */
    public function getAll($filters = []) {
        try {
            $limit = $filters['limit'] ?? 50;
            $offset = $filters['offset'] ?? 0;
            $status = $filters['status'] ?? null;

            $query = "SELECT * FROM users";
            $params = [];

            if ($status) {
                $query .= " WHERE status = ?";
                $params[] = $status;
            }

            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;

            $pdo = $this->db->getPdo();
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error fetching users: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update user
     */
    public function update($id, $data) {
        try {
            $this->db->update('users', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete user
     */
    public function delete($id) {
        try {
            return $this->db->delete('users', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error deleting user: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Block user
     */
    public function blockUser($id) {
        try {
            return $this->update($id, ['status' => 'blocked']);
        } catch (\Exception $e) {
            error_log("Error blocking user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Unblock user
     */
    public function unblockUser($id) {
        try {
            return $this->update($id, ['status' => 'active']);
        } catch (\Exception $e) {
            error_log("Error unblocking user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Count all users
     */
    public function countAll($filters = []) {
        try {
            $query = "SELECT COUNT(*) as count FROM users";
            $params = [];

            if (isset($filters['status'])) {
                $query .= " WHERE status = ?";
                $params[] = $filters['status'];
            }

            $pdo = $this->db->getPdo();
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            
            $result = $stmt->fetch();
            return (int)$result['count'];
        } catch (\Exception $e) {
            error_log("Error counting users: " . $e->getMessage());
            return 0;
        }
    }
}
