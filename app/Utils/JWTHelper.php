<?php
/**
 * app/Utils/JWTHelper.php - JWT Token Helper
 * Handles JWT token generation and verification
 */

namespace App\Utils;

class JWTHelper {
    
    private static $secret = '';
    private static $algorithm = 'HS256';

    /**
     * Initialize JWT helper with secret key
     */
    public static function init($secret = null) {
        if ($secret) {
            self::$secret = $secret;
        } else {
            // Get from environment or use default
            self::$secret = $_ENV['JWT_SECRET'] ?? 'your-jwt-secret-key-here';
        }

        if (!self::$secret || self::$secret === 'your-jwt-secret-key-here') {
            error_log('WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env file!');
        }
    }

    /**
     * Generate JWT token
     * 
     * @param array $payload Token payload data
     * @param int $expiresIn Expiration time in seconds (default 86400 = 24 hours)
     * @return string JWT token
     */
    public static function generateToken($payload, $expiresIn = 86400) {
        if (!self::$secret) {
            self::init();
        }

        $header = [
            'alg' => self::$algorithm,
            'typ' => 'JWT'
        ];

        $issuedAt = time();
        $expiresAt = $issuedAt + $expiresIn;

        $payload = array_merge(
            $payload,
            [
                'iat' => $issuedAt,    // issued at
                'exp' => $expiresAt,   // expiration time
                'nbf' => $issuedAt     // not before
            ]
        );

        // Encode header and payload
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        // Create signature
        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            self::$secret,
            true
        );
        $signatureEncoded = self::base64UrlEncode($signature);

        // Return complete token
        $token = "$headerEncoded.$payloadEncoded.$signatureEncoded";

        error_log('[JWT] Token generated for: ' . ($payload['user']['username'] ?? 'unknown'));

        return $token;
    }

    /**
     * Verify and decode JWT token
     * 
     * @param string $token JWT token to verify
     * @return array|false Decoded payload or false if invalid
     */
    public static function verifyToken($token) {
        if (!self::$secret) {
            self::init();
        }

        if (!$token || !is_string($token)) {
            error_log('[JWT] Invalid token format');
            return false;
        }

        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            error_log('[JWT] Invalid token structure (expected 3 parts)');
            return false;
        }

        $headerEncoded = $parts[0];
        $payloadEncoded = $parts[1];
        $signatureEncoded = $parts[2];

        // Verify signature
        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            self::$secret,
            true
        );
        $expectedSignature = self::base64UrlEncode($signature);

        if ($signatureEncoded !== $expectedSignature) {
            error_log('[JWT] Invalid signature');
            return false;
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        if ($payload === null) {
            error_log('[JWT] Failed to decode payload');
            return false;
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            error_log('[JWT] Token expired');
            return false;
        }

        // Check not before
        if (isset($payload['nbf']) && $payload['nbf'] > time()) {
            error_log('[JWT] Token not yet valid');
            return false;
        }

        error_log('[JWT] Token verified successfully');

        return $payload;
    }

    /**
     * Decode JWT without verification (UNSAFE - use only for debugging)
     * 
     * @param string $token JWT token
     * @return array|false Decoded payload or false if invalid
     */
    public static function decodeToken($token) {
        if (!$token || !is_string($token)) {
            return false;
        }

        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $payloadEncoded = $parts[1];

        return json_decode(self::base64UrlDecode($payloadEncoded), true);
    }

    /**
     * Check if token is expired
     * 
     * @param string $token JWT token
     * @return bool true if expired, false otherwise
     */
    public static function isTokenExpired($token) {
        $payload = self::decodeToken($token);

        if (!$payload || !isset($payload['exp'])) {
            return true;
        }

        return $payload['exp'] < time();
    }

    /**
     * Get user from token
     * 
     * @param string $token JWT token
     * @return array|null User data or null if not found
     */
    public static function getUserFromToken($token) {
        $payload = self::decodeToken($token);

        if (!$payload) {
            return null;
        }

        // Check different possible user data locations
        return $payload['user'] ?? $payload['data'] ?? $payload;
    }

    /**
     * Get remaining time until expiration
     * 
     * @param string $token JWT token
     * @return int Seconds remaining, or 0 if expired
     */
    public static function getTokenTTL($token) {
        $payload = self::decodeToken($token);

        if (!$payload || !isset($payload['exp'])) {
            return 0;
        }

        $remaining = $payload['exp'] - time();

        return max(0, $remaining);
    }

    /**
     * Helper function: Base64 URL safe encoding
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Helper function: Base64 URL safe decoding
     */
    private static function base64UrlDecode($data) {
        // Add padding if necessary
        $padLen = 4 - (strlen($data) % 4);
        if ($padLen < 4) {
            $data .= str_repeat('=', $padLen);
        }

        return base64_decode(strtr($data, '-_', '+/'));
    }
}
