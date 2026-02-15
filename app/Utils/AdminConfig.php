<?php
/**
 * app/Utils/AdminConfig.php - WordPress-style Admin Configuration Handler
 * Manages global admin options with get_option() and update_option() functions
 */

namespace App\Utils;

class AdminConfig {
    private static $pdo;
    private static $cache = [];

    public static function init($pdo) {
        self::$pdo = $pdo;
    }

    /**
     * Get an admin option value (WordPress-style)
     * 
     * @param string $option_key The option key (e.g., 'SMTP_HOST')
     * @param mixed $default Default value if option not found
     * @return mixed The option value or default
     */
    public static function getOption($option_key, $default = '') {
        // Check cache first
        if (isset(self::$cache[$option_key])) {
            return self::$cache[$option_key];
        }

        // Load from database FIRST (admin-configured values take priority)
        if (self::$pdo) {
            try {
                $stmt = self::$pdo->prepare("
                    SELECT option_value FROM admin_config 
                    WHERE option_key = ? LIMIT 1
                ");
                $stmt->execute([$option_key]);
                $result = $stmt->fetch(\PDO::FETCH_ASSOC);

                if ($result) {
                    self::$cache[$option_key] = $result['option_value'];
                    return $result['option_value'];
                }
            } catch (\PDOException $e) {
                error_log("Error loading option '$option_key': " . $e->getMessage());
            }
        }

        // Check environment variable as fallback (only if not in database)
        $env_key = $option_key;
        if (isset($_ENV[$env_key])) {
            self::$cache[$option_key] = $_ENV[$env_key];
            return $_ENV[$env_key];
        }

        return $default;
    }

    /**
     * Update/Save an admin option value (WordPress-style)
     * 
     * @param string $option_key The option key (e.g., 'SMTP_HOST')
     * @param mixed $option_value The value to save
     * @return boolean True if saved, false otherwise
     */
    public static function updateOption($option_key, $option_value) {
        if (!self::$pdo) {
            return false;
        }

        try {
            // Check if option exists
            $stmt = self::$pdo->prepare("
                SELECT id FROM admin_config 
                WHERE option_key = ? LIMIT 1
            ");
            $stmt->execute([$option_key]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update existing
                $stmt = self::$pdo->prepare("
                    UPDATE admin_config 
                    SET option_value = ?, updated_at = NOW()
                    WHERE option_key = ?
                ");
                $result = $stmt->execute([$option_value, $option_key]);
            } else {
                // Insert new
                $stmt = self::$pdo->prepare("
                    INSERT INTO admin_config 
                    (option_key, option_value, created_at, updated_at)
                    VALUES (?, ?, NOW(), NOW())
                ");
                $result = $stmt->execute([$option_key, $option_value]);
            }

            // Update cache
            if ($result) {
                self::$cache[$option_key] = $option_value;
            }

            return $result;
        } catch (\PDOException $e) {
            error_log("Error updating option '$option_key': " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete an admin option (rarely used)
     * 
     * @param string $option_key The option key to delete
     * @return boolean True if deleted, false otherwise
     */
    public static function deleteOption($option_key) {
        if (!self::$pdo) {
            return false;
        }

        try {
            $stmt = self::$pdo->prepare("
                DELETE FROM admin_config 
                WHERE option_key = ?
            ");
            $result = $stmt->execute([$option_key]);

            // Clear from cache
            unset(self::$cache[$option_key]);

            return $result;
        } catch (\PDOException $e) {
            error_log("Error deleting option '$option_key': " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all admin options as array (WordPress-style get_options)
     * 
     * @return array All options as key => value pairs
     */
    public static function getAllOptions() {
        if (!self::$pdo) {
            return [];
        }

        try {
            $stmt = self::$pdo->prepare("
                SELECT option_key, option_value FROM admin_config
                ORDER BY option_key ASC
            ");
            $stmt->execute();
            $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $options = [];
            foreach ($results as $row) {
                $options[$row['option_key']] = $row['option_value'];
                self::$cache[$row['option_key']] = $row['option_value'];
            }

            return $options;
        } catch (\PDOException $e) {
            error_log("Error loading all options: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Clear the in-memory cache (useful after batch updates)
     */
    public static function clearCache() {
        self::$cache = [];
    }

    /**
     * Check if an option exists in database
     * 
     * @param string $option_key The option key to check
     * @return boolean True if exists, false otherwise
     */
    public static function hasOption($option_key) {
        if (isset(self::$cache[$option_key])) {
            return true;
        }

        if (!self::$pdo) {
            return false;
        }

        try {
            $stmt = self::$pdo->prepare("
                SELECT id FROM admin_config 
                WHERE option_key = ? LIMIT 1
            ");
            $stmt->execute([$option_key]);
            return $stmt->fetch() !== false;
        } catch (\PDOException $e) {
            error_log("Error checking option existence: " . $e->getMessage());
            return false;
        }
    }
}
