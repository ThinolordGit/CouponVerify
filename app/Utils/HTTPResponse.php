<?php
/**
 * HTTPResponse.php - Standardized JSON Response Builder
 * Provides consistent JSON response formatting for API endpoints
 */

namespace App\Utils;

class HTTPResponse {

    /**
     * Send success response
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        self::setJsonHeaders();
        http_response_code($statusCode);

        echo json_encode([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Send error response
     */
    public static function error($message = 'Error', $statusCode = 400, $errors = null) {
        self::setJsonHeaders();
        http_response_code($statusCode);

        $response = [
            'status' => 'error',
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        echo json_encode($response);
        exit;
    }

    /**
     * Send validation error response
     */
    public static function validationError($errors) {
        self::setJsonHeaders();
        http_response_code(422);

        echo json_encode([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Send unauthorized response
     */
    public static function unauthorized($message = 'Unauthorized') {
        self::setJsonHeaders();
        http_response_code(401);

        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Send forbidden response
     */
    public static function forbidden($message = 'Forbidden') {
        self::setJsonHeaders();
        http_response_code(403);

        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Send not found response
     */
    public static function notFound($message = 'Not found') {
        self::setJsonHeaders();
        http_response_code(404);

        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Send server error response
     */
    public static function serverError($message = 'Internal server error') {
        self::setJsonHeaders();
        http_response_code(500);

        echo json_encode([
            'status' => 'error',
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Set JSON response headers
     */
    private static function setJsonHeaders() {
        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
    }
}
