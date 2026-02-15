<?php
/**
 * api/admin/users-mgmt.php - User Management
 * GET /api/admin/admin-users - Get all users
 * GET /api/admin/admin-users/{id} - Get user by ID
 * POST /api/admin/admin-users - Create new user
 * PUT /api/admin/admin-users/{id} - Update user
 * DELETE /api/admin/admin-users/{id} - Delete user
 */

use App\Controllers\AdminController;
use App\Utils\HTTPResponse;

require_once __DIR__ . '/../../app/Models/UserModel.php';
require_once __DIR__ . '/../../app/Utils/Validator.php';

try {
    // Create SQLHelper from global $pdo
    require_once __DIR__ . '/../../SQLHelper.php';
    $sqlHelper = new \SQLHelper($pdo);
    
    $userModel = new \App\Models\AdminUserModel($sqlHelper);

    // GET /api/admin/admin-users/{id}
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($param) && is_numeric($param)) {
        try {
            $user = $userModel->getById((int)$param);
            if (!$user) {
                HTTPResponse::notFound('User not found');
            }
            HTTPResponse::success(['user' => $user], 'User retrieved');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to fetch user');
        }
    }

    // GET /api/admin/admin-users
    else if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($param)) {
        try {
            $role = $_GET['role'] ?? null;
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = (int)($_GET['offset'] ?? 0);

            $filters = ['limit' => $limit, 'offset' => $offset];
            if ($role) {
                $filters['role'] = $role;
            }
            $filters['full_name!'] = "Administrator";
            $users = $userModel->getAll($filters);
            HTTPResponse::success(['users' => $users], 'Users retrieved');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to fetch users');
        }
    }

    // POST /api/admin/admin-users
    else if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($param)) {
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            
            $validator = new \App\Utils\Validator();
            $rules = [
                'email' => 'required|email',
                'username' => 'required|min:2|max:255',
                'password_hash' => 'required|min:2|max:255',
                'role' => 'required|min:4|max:255',
            ];
            if (!isset($body["username"])) {
                $body["username"] = $body["email"]??'';
            }
            else {
                if (empty($body["username"])) {
                    $body["username"] = $body["email"]??'';
                }
            }
            if (!$validator->validate($body, $rules)) {
                HTTPResponse::validationError($validator->getErrors());
            }
            $body["password_hash"] = password_hash($body["password_hash"], PASSWORD_BCRYPT);
            $user = $userModel->create($body);
            HTTPResponse::success(['user' => $user], 'User created', 201);
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to create user');
        }
    }

    // PUT /api/admin/admin-users/{id}
    else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && !empty($param) && is_numeric($param)) {
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            $user = $userModel->update((int)$param, $body);
            
            if (!$user) {
                HTTPResponse::notFound('User not found');
            }
            HTTPResponse::success(['user' => $user], 'User updated');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to update user');
        }
    }

    // DELETE /api/admin/admin-users/{id}
    else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && !empty($param) && is_numeric($param)) {
        try {
            $userModel->delete((int)$param);
            HTTPResponse::success([], 'User deleted');
        } catch (\Exception $e) {
            HTTPResponse::serverError('Failed to delete user');
        }
    }

    else {
        HTTPResponse::error('Invalid request', 400);
    }

} catch (\Exception $e) {
    error_log("User management endpoint error: " . $e->getMessage());
    HTTPResponse::serverError('User management endpoint error');
}
