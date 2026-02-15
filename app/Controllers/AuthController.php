<?php
/**
 * app/Controllers/AuthController.php - Authentication Controller
 * Handles admin login, logout, and session management
 */

namespace App\Controllers;

use App\Models\AdminUserModel;
use App\Utils\HTTPResponse;
use App\Utils\JWTHelper;
use App\Middleware\JWTAuth;

class AuthController extends BaseController {

    private $adminModel;

    public function __construct($pdo) {
        parent::__construct($pdo);
        $this->adminModel = new AdminUserModel($this->sqlHelper);
        $this->initSession();
    }

    /**
     * Initialize session configuration
     */
    private function initSession() {
        // Set secure session configuration
        ini_set('session.name', $_ENV['SESSION_NAME'] ?? 'coupon_verify_session');
        ini_set('session.cookie_httponly', $_ENV['SESSION_HTTPONLY'] ?? 'true');
        
        // For development cross-origin: allow cookies in development, secure in production
        $app_env = $_ENV['APP_ENV'] ?? 'development';
        if ($app_env === 'development') {
            // Development: less strict for cross-origin requests
            ini_set('session.cookie_secure', 'false');
            ini_set('session.cookie_samesite', 'Lax');
        } else {
            // Production: strict security
            ini_set('session.cookie_secure', $_ENV['SESSION_SECURE'] ?? 'true');
            ini_set('session.cookie_samesite', $_ENV['SESSION_SAMESITE'] ?? 'Strict');
        }
        
        ini_set('session.gc_maxlifetime', $_ENV['SESSION_LIFETIME'] ?? 86400);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * POST /api/admin/auth/login - Admin login with JWT
     */
    public function login() {
        $this->requireMethod('POST');

        try {
            $body = $this->getBody();

            // Validate required fields
            if (empty($body['username']) || empty($body['password'])) {
                $this->error('Username and password are required', 400);
            }

            // Verify credentials
            $username = trim($body['username']);
            $password = trim($body['password']);

            // Check if user exists and password matches
            if (!$this->adminModel->verifyPassword($username, $password)) {
                HTTPResponse::error('Invalid credentials', 401);
            }

            // Get user
            $user = $this->adminModel->getByUsername($username);

            if (!$user || !$user['is_active']) {
                HTTPResponse::error('Account is inactive', 403);
            }

            // Update last login
            $this->adminModel->updateLastLogin($user['id']);

            // Initialize JWT
            JWTHelper::init();

            // Generate JWT token (24 hours expiration)
            $token = JWTHelper::generateToken(
                [
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'full_name' => $user['full_name'],
                        'role' => $user['role']
                    ]
                ],
                86400  // 24 hours
            );

            // Remove sensitive data
            unset($user['password_hash']);

            error_log("[AUTH] User {$username} logged in successfully");

            $this->success([
                'token' => $token,
                'user' => $user,
                'message' => 'Login successful'
            ], 'Logged in successfully', 200);

        } catch (\Exception $e) {
            error_log("Login error: " . $e->getMessage());
            $this->error('Login failed', 500);
        }
    }

    /**
     * POST /api/admin/auth/logout - Admin logout (JWT is client-side, just acknowledge)
     */
    public function logout() {
        $this->requireMethod('POST');

        try {
            // With JWT, logout is handled client-side by deleting the token
            // Optional: Could implement token blacklist here for added security
            // but it's not necessary for basic JWT logout

            error_log("[AUTH] User logged out");

            $this->success(null, 'Logged out successfully');

        } catch (\Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            $this->error('Logout failed', 500);
        }
    }

    /**
     * GET /api/admin/auth/check - Check JWT authentication status
     */
    public function check() {
        $this->requireMethod('GET');

        try {
            // Verify JWT token from Authorization header
            $payload = JWTAuth::verify();

            if ($payload) {
                // Token is valid, fetch user info
                $user = $this->adminModel->getById($payload['user']['id'] ?? null);
                
                if ($user) {
                    unset($user['password_hash']);
                    // Update last activity
                    $this->adminModel->updateLastActivity($user['id']);

                    $this->success([
                        'authenticated' => true,
                        'user' => $user
                    ], 'Authenticated');
                } else {
                    $this->success([
                        'authenticated' => false,
                        'user' => null
                    ], 'User not found');
                }
            } else {
                $this->success([
                    'authenticated' => false,
                    'user' => null
                ], 'Not authenticated');
            }

        } catch (\Exception $e) {
            error_log("Auth check error: " . $e->getMessage());
            $this->error('Authentication check failed', 500);
        }
    }

    /**
     * Check if user is authenticated via JWT
     * DEPRECATED: Use JWTAuth::verify() instead
     */
    public function isAuthenticated() {
        return JWTAuth::verify() !== null;
    }

    /**
     * Get authenticated admin ID from JWT
     * DEPRECATED: Use JWTAuth::getAuthenticatedUserId() instead
     */
    public function getAuthenticatedAdminId() {
        return JWTAuth::getAuthenticatedUserId();
    }

    /**
     * Verify admin authentication (middleware)
     * DEPRECATED: Use JWTAuth::require() instead
     */
    public static function requireAuth() {
        JWTAuth::require();
    }
}
