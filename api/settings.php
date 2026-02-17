<?php
/**
 * api/settings.php - Public Settings Endpoint
 * Returns public settings for frontend (no auth required)
 */

use App\Utils\HTTPResponse;

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'features':
            handleGetPublicFeatures();
            break;
        
        case 'general':
            handleGetGeneralSettings();
            break;

        default:
            HTTPResponse::error('Settings action not found', 404);
            break;
    }
} catch (Exception $e) {
    error_log("Public Settings API error: " . $e->getMessage());
    HTTPResponse::error('Internal server error', 500);
}

/**
 * Get public features (no auth required)
 */
function handleGetPublicFeatures() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    try {
        // List of public features
        $featureKeys = [
            'enable_user_dashboard',
            'enable_coupon_verification',
            'enable_admin_panel',
            'enable_launching_push',
            'enable_submit_resume',
            'enable_home_page',
            'enable_public_catalog',
            'enable_social_sharing',
            'enable_api_access'
        ];

        $stmt = $pdo->prepare("SELECT `key`, value FROM site_settings WHERE `key` IN (" . 
                                implode(',', array_fill(0, count($featureKeys), '?')) . ")");
        $stmt->execute($featureKeys);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $settings = [];
        foreach ($rows as $row) {
            $value = $row['value'];
            // Convert to boolean
            $value = $value === '1' || $value === 'true';
            $settings[$row['key']] = $value;
        }

        HTTPResponse::success(['features' => $settings], 'Public features retrieved successfully');
    } catch (Exception $e) {
        error_log("Error retrieving public features: " . $e->getMessage());
        HTTPResponse::error('Failed to retrieve settings', 500);
    }
}

/**
 * Get general public settings (site name, logo, etc)
 */
function handleGetGeneralSettings() {
    global $pdo;

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    try {
        // List of public general settings
        $generalKeys = [
            'site_name',
            'site_description',
            'site_logo_url',
            'site_favicon_url',
            'seo_title_prefix',
            'site_keywords',
            'og_image_url',
            'twitter_handle'
        ];

        $stmt = $pdo->prepare("SELECT `key`, value FROM site_settings WHERE `key` IN (" . 
                                implode(',', array_fill(0, count($generalKeys), '?')) . ")");
        $stmt->execute($generalKeys);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key']] = $row['value'];
        }

        HTTPResponse::success(['settings' => $settings], 'Public settings retrieved successfully');
    } catch (Exception $e) {
        error_log("Error retrieving public settings: " . $e->getMessage());
        HTTPResponse::error('Failed to retrieve settings', 500);
    }
}

?>
