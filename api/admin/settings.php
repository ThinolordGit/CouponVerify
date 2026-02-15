<?php
/**
 * api/admin/settings.php - Site Settings Management
 * Manage global site configuration
 */

use App\Utils\HTTPResponse;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get-all':
            handleGetAllSettings();
            break;

        case 'get':
            handleGetSetting();
            break;

        case 'update':
            handleUpdateSettings();
            break;

        case 'get-seo':
            handleGetSeoSettings();
            break;

        default:
            HTTPResponse::error('Settings action not found', 404);
            break;
    }
} catch (Exception $e) {
    error_log("Settings API error: " . $e->getMessage());
    HTTPResponse::error('Internal server error', 500);
}

/**
 * Get all settings
 */
function handleGetAllSettings() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM site_settings ORDER BY `key`");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($rows as $row) {
            $value = $row['value'];
            // Convert types
            if ($row['type'] === 'boolean') {
                $value = $value === '1' || $value === 'true';
            } elseif ($row['type'] === 'number') {
                $value = is_numeric($value) ? (strpos($value, '.') !== false ? (float)$value : (int)$value) : 0;
            } elseif ($row['type'] === 'json') {
                $value = json_decode($value, true) ?? [];
            }

            $settings[$row['key']] = $value;
        }

        HTTPResponse::success(['settings' => $settings], 'Settings retrieved successfully');
    } catch (Exception $e) {
        error_log("Error retrieving settings: " . $e->getMessage());
        HTTPResponse::error('Failed to retrieve settings', 500);
    }
}

/**
 * Get specific setting
 */
function handleGetSetting() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    $key = $_GET['key'] ?? null;

    if (!$key) {
        HTTPResponse::error('Setting key is required', 400);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM site_settings WHERE `key` = ? LIMIT 1");
        $stmt->execute([$key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            HTTPResponse::error('Setting not found', 404);
            return;
        }

        $value = $row['value'];
        // Convert types
        if ($row['type'] === 'boolean') {
            $value = $value === '1' || $value === 'true';
        } elseif ($row['type'] === 'number') {
            $value = is_numeric($value) ? (strpos($value, '.') !== false ? (float)$value : (int)$value) : 0;
        } elseif ($row['type'] === 'json') {
            $value = json_decode($value, true) ?? [];
        }

        HTTPResponse::success(['key' => $key, 'value' => $value, 'type' => $row['type']]);
    } catch (Exception $e) {
        error_log("Error retrieving setting: " . $e->getMessage());
        HTTPResponse::error('Failed to retrieve setting', 500);
    }
}

/**
 * Update settings
 */
function handleUpdateSettings() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['settings']) || !is_array($data['settings'])) {
        HTTPResponse::error('Settings object is required', 400);
        return;
    }

    try {
        $updated = [];
        // Use INSERT ... ON DUPLICATE KEY UPDATE to create or update settings
        $stmt = $pdo->prepare("
            INSERT INTO site_settings (`key`, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE 
            value = VALUES(value), 
            updated_at = CURRENT_TIMESTAMP
        ");

        foreach ($data['settings'] as $key => $value) {
            // Sanitize key
            if (!preg_match('/^[a-z0-9_]+$/', $key)) {
                continue;
            }

            // Convert value to string for storage
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            } elseif (is_array($value) || is_object($value)) {
                $value = json_encode($value);
            } else {
                $value = (string)$value;
            }

            try {
                $stmt->execute([$key, $value]);
                $updated[] = $key;
            } catch (Exception $e) {
                error_log("Error updating setting $key: " . $e->getMessage());
            }
        }

        if (empty($updated)) {
            HTTPResponse::error('No settings were updated', 400);
            return;
        }

        HTTPResponse::success(
            ['updated' => $updated, 'count' => count($updated)],
            'Settings updated successfully'
        );
    } catch (Exception $e) {
        error_log("Error updating settings: " . $e->getMessage());
        HTTPResponse::error('Failed to update settings', 500);
    }
}

/**
 * Get SEO settings (for frontend)
 */
function handleGetSeoSettings() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    try {
        $keys = ['site_name', 'site_description', 'site_keywords', 'site_logo_url', 'site_favicon_url', 
                 'seo_title_prefix', 'og_image_url', 'twitter_handle', 'custom_head_html'];

        $stmt = $pdo->prepare("SELECT `key`, value FROM site_settings WHERE `key` IN (" . 
                                        implode(',', array_fill(0, count($keys), '?')) . ")");
        $stmt->execute($keys);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key']] = $row['value'];
        }

        HTTPResponse::success(['seo' => $settings], 'SEO settings retrieved successfully');
    } catch (Exception $e) {
        error_log("Error retrieving SEO settings: " . $e->getMessage());
        HTTPResponse::error('Failed to retrieve SEO settings', 500);
    }
}

?>
