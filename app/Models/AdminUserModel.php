<?php
/**
 * app/Models/AdminUserModel.php - Admin User Data Model
 * Handles authentication and admin user management
 */

namespace App\Models;

class AdminUserModel {

    private $db;

    public function __construct($sqlHelper) {
        $this->db = $sqlHelper;
    }

    /**
     * Create new admin user
     */
    public function create($data) {
        try {
            // Hash password
            if (isset($data['password'])) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                unset($data['password']);
            }

            $id = $this->db->create('admin_users', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating admin user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get admin user by ID
     */
    public function getById($id) {
        try {
            return $this->db->getOne('admin_users', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error fetching admin user by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get admin user by username
     */
    public function getByUsername($username) {
        try {
            return $this->db->getOne('admin_users', ['username' => $username, 'is_active' => true]);
        } catch (\Exception $e) {
            error_log("Error fetching admin user by username: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify password
     */
    public function verifyPassword($username, $password) {
        try {
            $user = $this->getByUsername($username);

            if (!$user) {
                return false;
            }

            return password_verify($password, $user['password_hash']);
        } catch (\Exception $e) {
            error_log("Error verifying password: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update admin user
     */
    public function update($id, $data) {
        try {
            // Hash password if provided
            if (isset($data['password'])) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                unset($data['password']);
            }

            $this->db->update('admin_users', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating admin user: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update last login
     */
    public function updateLastLogin($id) {
        try {
            return $this->update($id, ['last_login' => date('Y-m-d H:i:s')]);
        } catch (\Exception $e) {
            error_log("Error updating last login: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update last activity
     */
    public function updateLastActivity($id) {
        try {
            $pdo = $this->db->getPDO();
            $stmt = $pdo->prepare("UPDATE admin_users SET last_activity = NOW() WHERE id = ?");
            return $stmt->execute([$id]);
        } catch (\Exception $e) {
            error_log("Error updating last activity: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get admin users
     */
    public function getAll($filters = []) {
        try {
            $limit = $filters['limit'] ?? 50;
            $offset = $filters['offset'] ?? 0;
            $status = $filters['status'] ?? null;

            $query = "SELECT * FROM admin_users";
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
            error_log("Error fetching admin users: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Delete admin user
     */
    public function delete($id) {
        try {
            $this->db->delete('admin_users', ['id' => $id]);
            return true;
        } catch (\Exception $e) {
            error_log("Error deleting admin user: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if admin exists
     */
    public function exists($id) {
        try {
            return $this->db->exists('admin_users', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error checking admin existence: " . $e->getMessage());
            return false;
        }
    }
}
