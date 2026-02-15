<?php
/**
 * app/Middleware/JWTAuth.php - JWT Authentication Middleware
 * Verifies JWT tokens in Authorization header
 */

namespace App\Middleware;

use App\Utils\JWTHelper;
use App\Utils\HTTPResponse;

class JWTAuth {

    /**
     * Verify JWT token from Authorization header
     * 
     * @return array|null Decoded token payload or null if invalid
     */
    public static function verify() {
        $token = self::getTokenFromHeader();

        if (!$token) {
            error_log('[JWT] No token provided in Authorization header');
            return null;
        }

        // Initialize JWT
        JWTHelper::init();

        // Verify token
        $payload = JWTHelper::verifyToken($token);

        if (!$payload) {
            error_log('[JWT] Token verification failed');
            return null;
        }

        error_log('[JWT] Token verified successfully');

        return $payload;
    }

    /**
     * Require JWT authentication
     * Returns 401 if token is invalid or missing
     * Sets auth data in $_SERVER['JWT_PAYLOAD']
     * 
     * @return void
     */
    public static function require() {
        $payload = self::verify();

        if (!$payload) {
            HTTPResponse::unauthorized('Invalid or missing JWT token');
        }

        // Store payload in $_SERVER for use in controllers
        $_SERVER['JWT_PAYLOAD'] = $payload;
        $_SERVER['AUTH_USER'] = $payload['user'] ?? $payload;

        return $payload;
    }

    /**
     * Optional JWT authentication
     * Returns null if token is invalid/missing, but doesn't terminate request
     * 
     * @return array|null Token payload or null
     */
    public static function optional() {
        $payload = self::verify();

        if ($payload) {
            $_SERVER['JWT_PAYLOAD'] = $payload;
            $_SERVER['AUTH_USER'] = $payload['user'] ?? $payload;
        }

        return $payload;
    }

    /**
     * Get authenticated user ID
     * 
     * @return int|null User ID or null if not authenticated
     */
    public static function getAuthenticatedUserId() {
        $user = $_SERVER['AUTH_USER'] ?? null;

        if ($user && is_array($user) && isset($user['id'])) {
            return $user['id'];
        }

        return null;
    }

    /**
     * Get authenticated user data
     * 
     * @return array|null User data or null
     */
    public static function getAuthenticatedUser() {
        return $_SERVER['AUTH_USER'] ?? null;
    }

    /**
     * Extract JWT token from Authorization header
     * Expected format: "Bearer <token>"
     * 
     * @return string|null Token or null if not found
     */
    private static function getTokenFromHeader() {
        // Get Authorization header
        $headers = shell_exec('cd /d %cd% && apache_request_headers 2>/dev/null || echo');
        
        // Try different methods to get Authorization header
        $authHeader = null;

        // Method 1: apache_request_headers (most reliable)
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        // Method 2: $_SERVER
        if (!$authHeader) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        }

        if (!$authHeader) {
            return null;
        }

        // Extract token from "Bearer <token>" format
        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Check if request has valid JWT
     * 
     * @return bool true if valid JWT present
     */
    public static function hasValidToken() {
        return self::verify() !== null;
    }

    /**
     * Get remaining time until token expires
     * 
     * @return int Seconds remaining, or 0 if no token
     */
    public static function getTokenTTL() {
        $token = self::getTokenFromHeader();

        if (!$token) {
            return 0;
        }

        return JWTHelper::getTokenTTL($token);
    }
}
