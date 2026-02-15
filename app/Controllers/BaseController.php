<?php
/**
 * app/Controllers/BaseController.php - Base Controller Class
 * Provides common helper methods for all controllers
 */

namespace App\Controllers;

use App\Utils\HTTPResponse;

class BaseController {

    protected $pdo;
    protected $sqlHelper;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->initSQLHelper();
    }

    /**
     * Initialize SQLHelper with PDO connection
     */
    protected function initSQLHelper() {
        // Include SQLHelper class if not already loaded
        if (!class_exists('SQLHelper')) {
            require_once __DIR__ . '/../../SQLHelper.php';
        }
        $this->sqlHelper = new \SQLHelper($this->pdo);
    }

    /**
     * Get PDO connection
     */
    public function getPdo() {
        return $this->pdo;
    }

    /**
     * Get SQLHelper instance
     */
    public function getDb() {
        return $this->sqlHelper;
    }

    /**
     * Verify request method
     */
    protected function requireMethod($method) {
        if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
            HTTPResponse::error(
                "Method not allowed. Expected: $method",
                405
            );
        }
    }

    /**
     * Get request body (JSON)
     */
    protected function getBody($raw = false) {
        $input = file_get_contents('php://input');

        if ($raw) {
            return $input;
        }

        return json_decode($input, true) ?? [];
    }

    /**
     * Get query parameters
     */
    protected function getQuery($key = null) {
        if ($key) {
            return $_GET[$key] ?? null;
        }
        return $_GET;
    }

    /**
     * Get request headers
     */
    protected function getHeader($key = null) {
        $headers = apache_request_headers();

        if ($key) {
            return $headers[$key] ?? null;
        }

        return $headers;
    }

    /**
     * Get user IP address
     */
    protected function getUserIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }
    }

    /**
     * Generate unique reference
     */
    protected function generateReference($prefix = 'REF') {
        return $prefix . '-' . time() . '-' . substr(uniqid(), -5);
    }

    /**
     * Generate transaction reference
     */
    protected function generateTransactionReference() {
        $year = date('Y');
        $rand = mt_rand(1000, 9999);
        return "VER-$year-$rand";
    }

    /**
     * Success response shortcut
     */
    protected function success($data = null, $message = 'Success', $code = 200) {
        HTTPResponse::success($data, $message, $code);
    }

    /**
     * Error response shortcut
     */
    protected function error($message = 'Error', $code = 400) {
        HTTPResponse::error($message, $code);
    }

    /**
     * Validation error shortcut
     */
    protected function validationError($errors) {
        HTTPResponse::validationError($errors);
    }

    /**
     * Not found shortcut
     */
    protected function notFound($message = 'Not found') {
        HTTPResponse::notFound($message);
    }
}
