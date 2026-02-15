<?php
/**
 * api/admin/categories-mgmt.php - Category Management
 * POST /api/admin/categories - Create category
 * PUT /api/admin/categories/{id} - Update category
 * DELETE /api/admin/categories/{id} - Delete category
 */

use App\Utils\HTTPResponse;

require_once __DIR__ . '/../../app/Models/CategoryModel.php';
require_once __DIR__ . '/../../app/Utils/Validator.php';

try {
    // Create SQLHelper from global $pdo
    require_once __DIR__ . '/../../SQLHelper.php';
    $sqlHelper = new \SQLHelper($pdo);
    
    $categoryModel = new \App\Models\CategoryModel($sqlHelper);

    // POST /api/admin/categories
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($param)) {
        try {
            $body = json_decode(file_get_contents('php://input'), true);

            $validator = new \App\Utils\Validator();
            $rules = [
                'name' => 'required|min:2|max:255'
            ];

            if (!$validator->validate($body, $rules)) {
                HTTPResponse::validationError($validator->getErrors());
            }

            // Generate slug if not provided
            if (!isset($body['slug'])) {
                $body['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['name']), '-'));
            }

            $category = $categoryModel->create($body);
            HTTPResponse::success(['category' => $category], 'Category created', 201);
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to create category');
        }
    }

    // PUT /api/admin/categories/{id}
    else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && !empty($param) && is_numeric($param)) {
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            
            if (isset($body['name']) && !isset($body['slug'])) {
                $body['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['name']), '-'));
            }

            $category = $categoryModel->update((int)$param, $body);
            if (!$category) {
                HTTPResponse::notFound('Category not found');
            }
            HTTPResponse::success(['category' => $category], 'Category updated');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to update category');
        }
    }

    // DELETE /api/admin/categories/{id}
    else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && !empty($param) && is_numeric($param)) {
        try {
            $categoryModel->delete((int)$param);
            HTTPResponse::success([], 'Category deleted');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to delete category');
        }
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("Category management endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('Category management endpoint error');
}
