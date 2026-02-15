<?php
/**
 * api/categories.php - Category Endpoints
 * GET /api/categories - Get all categories
 * GET /api/categories/{id} - Get category by ID
 * POST /api/admin/categories - Create category (admin)
 * PUT /api/admin/categories/{id} - Update category (admin)
 * DELETE /api/admin/categories/{id} - Delete category (admin)
 */

use App\Utils\HTTPResponse;

require_once __DIR__ . '/../app/Models/CategoryModel.php';
require_once __DIR__ . '/../app/Utils/Validator.php';

try {
    // Create SQLHelper from global $pdo
    require_once __DIR__ . '/../SQLHelper.php';
    $sqlHelper = new \SQLHelper($pdo);
    
    $categoryModel = new \App\Models\CategoryModel($sqlHelper);

    // GET /api/categories or /api/admin/categories
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($action)) {
        try {
            $limit = (int)($_GET['limit'] ?? 100);
            $offset = (int)($_GET['offset'] ?? 0);

            $categories = $categoryModel->getAll(['limit' => $limit, 'offset' => $offset]);
            HTTPResponse::success(['categories' => $categories], 'Categories retrieved');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to fetch categories');
        }
    }

    // GET /api/categories/{id}
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($action) && is_numeric($action)) {
        try {
            $category = $categoryModel->getById((int)$action);
            if (!$category) {
                HTTPResponse::notFound('Category not found');
            }
            HTTPResponse::success(['category' => $category], 'Category retrieved');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to fetch category');
        }
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("Category endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Category endpoint error');
}
