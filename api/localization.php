<?php
/**
 * api/localization.php - Localization API Endpoints
 * Provides translations via HTTP API
 */

use App\Utils\HTTPResponse;
use App\Utils\Localization;

$method = $_SERVER['REQUEST_METHOD'];
$subAction = $GLOBALS['param'] ?? '';

try {
    Localization::init($_GET['lang'] ?? null);

    switch ($subAction) {
        case 'get-translations':
            handleGetTranslations();
            break;

        case 'get-language':
            handleGetLanguage();
            break;

        case 'set-language':
            handleSetLanguage();
            break;

        case 'available-languages':
            handleGetAvailableLanguages();
            break;

        case 'detect-language':
            handleDetectLanguage();
            break;

        default:
            HTTPResponse::error('Localization endpoint not found', 404);
            break;
    }

} catch (Exception $e) {
    error_log("Localization API error: " . $e->getMessage());
    HTTPResponse::serverError('Localization endpoint error');
    exit;
}

/**
 * Get all translations for current language
 */
function handleGetTranslations() {
    $lang = $_GET['lang'] ?? Localization::getCurrentLanguage();
    
    if (!Localization::isLanguageAvailable($lang)) {
        HTTPResponse::error('Language not available', 400);
        return;
    }

    Localization::setLanguage($lang);
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'language' => $lang,
        'translations' => Localization::getAllTranslations()
    ]);
}

/**
 * Get current language
 */
function handleGetLanguage() {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'language' => Localization::getCurrentLanguage(),
        'languages' => Localization::getAvailableLanguages()
    ]);
}

/**
 * Set language
 */
function handleSetLanguage() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        HTTPResponse::error('Method not allowed', 405);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $lang = $data['language'] ?? null;

    if (!$lang) {
        HTTPResponse::error('Language parameter required', 400);
        return;
    }

    if (!Localization::isLanguageAvailable($lang)) {
        HTTPResponse::error('Language not available', 400);
        return;
    }

    Localization::setLanguage($lang);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Language set successfully',
        'language' => $lang
    ]);
}

/**
 * Get available languages
 */
function handleGetAvailableLanguages() {
    $languages = array_map(function($code, $data) {
        return [
            'code' => $code,
            'name' => $data['name'],
            'flag' => $data['flag'],
            'isActive' => $code === Localization::getCurrentLanguage()
        ];
    }, array_keys(Localization::getAvailableLanguages()), 
       array_values(Localization::getAvailableLanguages()));

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'languages' => $languages
    ]);
}

/**
 * Detect language from request
 */
function handleDetectLanguage() {
    $detectedLang = Localization::detectLanguage();
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'detected_language' => $detectedLang,
        'browser_language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'not set'
    ]);
}
