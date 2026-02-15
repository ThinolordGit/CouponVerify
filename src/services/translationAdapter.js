/**
 * src/services/translationAdapter.js
 * Adapter service to integrate translations with different parts of the app
 * Handles backend API calls, component translation, and format conversion
 */

import i18n from './i18n';
import axios from 'axios';

class TranslationAdapter {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.apiEndpoint = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWithBackend();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Get available languages from backend
   */
  async getAvailableLanguages(useCache = true) {
    if (useCache && this.cache.has('languages')) {
      const cached = this.cache.get('languages');
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    if (!this.isOnline) {
      return i18n.getAvailableLanguages();
    }

    try {
      const response = await axios.get(
        `${this.apiEndpoint}/localization/available-languages`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.languages) {
        this.cache.set('languages', {
          data: response.data.languages,
          timestamp: Date.now()
        });
        return response.data.languages;
      }
    } catch (error) {
      console.warn('Failed to fetch languages from backend:', error.message);
    }

    return i18n.getAvailableLanguages();
  }

  /**
   * Get translations for a specific language from backend
   */
  async getTranslations(language, useCache = true) {
    const cacheKey = `translations_${language}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    if (!this.isOnline) {
      return null;
    }

    try {
      const response = await axios.get(
        `${this.apiEndpoint}/localization/get-translations`,
        {
          params: { lang: language },
          timeout: 5000
        }
      );
      
      if (response.data && response.data.translations) {
        this.cache.set(cacheKey, {
          data: response.data.translations,
          timestamp: Date.now()
        });
        return response.data.translations;
      }
    } catch (error) {
      console.warn(`Failed to fetch ${language} translations from backend:`, error.message);
    }

    return null;
  }

  /**
   * Set language on backend
   */
  async setLanguage(language) {
    if (!this.isOnline) {
      i18n.setLanguage(language);
      return true;
    }

    try {
      const response = await axios.post(
        `${this.apiEndpoint}/localization/set-language`,
        { language },
        { timeout: 5000 }
      );
      
      if (response.status === 200) {
        i18n.setLanguage(language);
        this.clearCache();
        return true;
      }
    } catch (error) {
      console.warn('Failed to set language on backend:', error.message);
      i18n.setLanguage(language);
      return false;
    }
  }

  /**
   * Detect language from backend
   */
  async detectLanguage() {
    if (!this.isOnline) {
      return i18n.detectLanguage();
    }

    try {
      const response = await axios.get(
        `${this.apiEndpoint}/localization/detect-language`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.language) {
        return response.data.language;
      }
    } catch (error) {
      console.warn('Failed to detect language from backend:', error.message);
    }

    return i18n.detectLanguage();
  }

  /**
   * Get current language from backend
   */
  async getCurrentLanguage() {
    if (!this.isOnline) {
      return i18n.getCurrentLanguage();
    }

    try {
      const response = await axios.get(
        `${this.apiEndpoint}/localization/get-language`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.language) {
        return response.data.language;
      }
    } catch (error) {
      console.warn('Failed to get current language from backend:', error.message);
    }

    return i18n.getCurrentLanguage();
  }

  /**
   * Sync translations with backend
   */
  async syncWithBackend() {
    const currentLang = i18n.getCurrentLanguage();
    const backendTrans = await this.getTranslations(currentLang, false);
    
    if (backendTrans) {
      i18n.addLanguage(currentLang, null, null, backendTrans);
      // console.log('Translations synced with backend');
    }
  }

  /**
   * Translate component text
   * Usage: translationAdapter.translateComponent(MyComponent, 'componentName')
   */
  translateComponent(Component, namespace) {
    return (props) => {
      const { t } = i18n;
      const translations = {};
      
      // Extract all translations for this component namespace
      if (namespace) {
        const baseKey = `components.${namespace}`;
        // This would require the translations to be structured accordingly
        // For now, just pass undefined - component should use useTranslation()
      }
      
      return <Component {...props} />;
    };
  }

  /**
   * Format date according to language
   */
  formatDate(date, language = null) {
    const lang = language || i18n.getCurrentLanguage();
    const locale = this.getLocale(lang);
    
    return new Intl.DateTimeFormat(locale).format(new Date(date));
  }

  /**
   * Format time according to language
   */
  formatTime(date, language = null) {
    const lang = language || i18n.getCurrentLanguage();
    const locale = this.getLocale(lang);
    
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Format number according to language
   */
  formatNumber(number, language = null) {
    const lang = language || i18n.getCurrentLanguage();
    const locale = this.getLocale(lang);
    
    return new Intl.NumberFormat(locale).format(number);
  }

  /**
   * Format currency according to language
   */
  formatCurrency(amount, currency = 'USD', language = null) {
    const lang = language || i18n.getCurrentLanguage();
    const locale = this.getLocale(lang);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get locale string from language code
   */
  getLocale(languageCode) {
    const localeMap = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ko': 'ko-KR'
    };
    
    return localeMap[languageCode] || 'en-US';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      isOnline: this.isOnline
    };
  }
}

export default new TranslationAdapter();
