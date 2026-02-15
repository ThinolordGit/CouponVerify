<?php
/**
 * api/admin/email-config.php - Email Configuration
 * Deprecated: Email configuration is now managed via /api/admin/notifications/config
 * This file is kept for backward compatibility
 */

use App\Utils\HTTPResponse;

// Redirect to notifications endpoint
require_once __DIR__ . '/notifications.php';
