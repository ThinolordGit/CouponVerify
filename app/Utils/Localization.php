<?php
/**
 * app/Utils/Localization.php - Backend Localization Service
 * Provides translation services for PHP backend
 */

namespace App\Utils;

class Localization {
    private static $translations = [];
    private static $currentLanguage = 'en';
    private static $defaultLanguage = 'en';

    /**
     * Initialize localization for a specific language
     */
    public static function init($language = null) {
        // Detect language from parameter, session, or default
        if ($language === null) {
            $language = $_SESSION['language'] ?? $_GET['lang'] ?? self::detectLanguage();
        }

        self::$currentLanguage = self::validateLanguage($language);
        self::loadTranslations(self::$currentLanguage);
    }

    /**
     * Detect language from HTTP Accept-Language header
     */
    public static function detectLanguage() {
        if (!isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            return self::$defaultLanguage;
        }

        // Parse Accept-Language header
        $languages = [];
        $header = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        
        if (preg_match_all('/([a-z]{2})(?:-[a-z]{2})?(?:;q=([0-9.]+))?/i', $header, $matches)) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $lang = strtolower($matches[1][$i]);
                $q = isset($matches[2][$i]) ? (float)$matches[2][$i] : 1.0;
                $languages[$lang] = $q;
            }
            
            // Sort by quality
            arsort($languages);
            
            foreach ($languages as $lang => $q) {
                if ($lang === 'en' || $lang === 'fr' || $lang === 'es') {
                    return $lang;
                }
            }
        }

        return self::$defaultLanguage;
    }

    /**
     * Load translation file for language
     */
    private static function loadTranslations($language) {
        $lang = self::validateLanguage($language);
        $filePath = __DIR__ . "/../../src/locales/{$lang}.json";

        if (!file_exists($filePath)) {
            error_log("Translation file not found: {$filePath}");
            self::loadTranslations(self::$defaultLanguage);
            return;
        }

        $content = file_get_contents($filePath);
        self::$translations[$lang] = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error parsing translation file: " . json_last_error_msg());
            self::$translations[$lang] = [];
        }
    }

    /**
     * Validate language code
     */
    private static function validateLanguage($language) {
        $validLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'];
        
        if (in_array(strtolower($language), $validLanguages)) {
            return strtolower($language);
        }

        return self::$defaultLanguage;
    }

    /**
     * Get translation by key
     * Supports nested keys like "emails.verification_pending"
     */
    public static function t($key, $default = null) {
        if (empty(self::$translations)) {
            self::init();
        }

        $lang = self::$currentLanguage;
        $keys = explode('.', $key);
        $value = self::$translations[$lang] ?? [];

        foreach ($keys as $k) {
            if (is_array($value) && isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default ?? $key;
            }
        }

        return $value ?? ($default ?? $key);
    }

    /**
     * Get translation with variable substitution
     */
    public static function tReplace($key, $variables = [], $default = null) {
        $text = self::t($key, $default);

        foreach ($variables as $var => $val) {
            $text = str_replace('{' . $var . '}', $val, $text);
        }

        return $text;
    }

    /**
     * Set current language
     */
    public static function setLanguage($language) {
        $lang = self::validateLanguage($language);
        self::$currentLanguage = $lang;
        self::loadTranslations($lang);
        $_SESSION['language'] = $lang;
    }

    /**
     * Get current language
     */
    public static function getCurrentLanguage() {
        return self::$currentLanguage;
    }

    /**
     * Get all available languages
     */
    public static function getAvailableLanguages() {
        return [
            'en' => ['name' => 'English', 'flag' => '🇺🇸'],
            'fr' => ['name' => 'Français', 'flag' => '🇫🇷'],
            'es' => ['name' => 'Español', 'flag' => '🇪🇸'],
            'de' => ['name' => 'Deutsch', 'flag' => '🇩🇪'],
            'it' => ['name' => 'Italiano', 'flag' => '🇮🇹'],
            'pt' => ['name' => 'Português', 'flag' => '🇵🇹'],
            'ru' => ['name' => 'Русский', 'flag' => '🇷🇺'],
            'ja' => ['name' => '日本語', 'flag' => '🇯🇵'],
            'zh' => ['name' => '中文', 'flag' => '🇨🇳'],
            'ko' => ['name' => '한국어', 'flag' => '🇰🇷'],
        ];
    }

    /**
     * Get all available language codes
     */
    public static function getAvailableLanguageCodes() {
        return array_keys(self::getAvailableLanguages());
    }

    /**
     * Check if language is available
     */
    public static function isLanguageAvailable($language) {
        return in_array(strtolower($language), self::getAvailableLanguageCodes());
    }

    /**
     * Get all translations for current language (for JSON API response)
     */
    public static function getAllTranslations() {
        if (empty(self::$translations)) {
            self::init();
        }

        return self::$translations[self::$currentLanguage] ?? [];
    }
}

// Auto-initialize on first use
Localization::init();
