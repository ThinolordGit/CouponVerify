<?php
/**
 * app/Models/CategoryModel.php - Category Data Model
 * Handles all CRUD operations for coupon categories
 */

namespace App\Models;

class CategoryModel {

    private $db;
    
    public function __construct($sqlHelper) {
        $this->db = $sqlHelper;
    }

    /**
     * Create new category
     */
    public function create($data) {
        try {
            $id = $this->db->create('categories', $data);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error creating category: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get category by ID
     */
    public function getById($id) {
        try {
            return $this->db->getOne('categories', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error fetching category by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get category by slug
     */
    public function getBySlug($slug) {
        try {
            return $this->db->getOne('categories', ['slug' => $slug]);
        } catch (\Exception $e) {
            error_log("Error fetching category by slug: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all categories
     */
    public function getAll($filters = []) {
        try {
            $limit = $filters['limit'] ?? 100;
            $offset = $filters['offset'] ?? 0;

            $query = "SELECT * FROM categories ORDER BY name ASC LIMIT ? OFFSET ?";
            $params = [$limit, $offset];

            $pdo = $this->db->getPdo();
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error fetching categories: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update category
     */
    public function update($id, $data) {
        try {
            $this->db->update('categories', $data, ['id' => $id]);
            return $this->getById($id);
        } catch (\Exception $e) {
            error_log("Error updating category: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete category
     */
    public function delete($id) {
        try {
            return $this->db->delete('categories', ['id' => $id]);
        } catch (\Exception $e) {
            error_log("Error deleting category: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Count all categories
     */
    public function countAll() {
        try {
            $query = "SELECT COUNT(*) as count FROM categories";
            $pdo = $this->db->getPdo();
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetch();
            return (int)$result['count'];
        } catch (\Exception $e) {
            error_log("Error counting categories: " . $e->getMessage());
            return 0;
        }
    }
}
