/**
 * src/services/i18n.js - Internationalization Service
 * Manages language detection, switching, and translations
 */

import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import pl from '../locales/pl.json';
import it from '../locales/it.json';
import pt from '../locales/pt.json';
import hu from '../locales/hu.json';
import nl from '../locales/nl.json';
import tr from '../locales/tr.json';
import el from '../locales/el.json';
import sv from '../locales/sv.json';
import ro from '../locales/ro.json';
import cs from '../locales/cs.json';
import da from '../locales/da.json';
import fi from '../locales/fi.json';
import no from '../locales/no.json';
import bg from '../locales/bg.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import ar from '../locales/ar.json';
import ru from '../locales/ru.json';
import ptBR from '../locales/pt-BR.json';

// Available languages and their data
const AVAILABLE_LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', data: en },
  fr: { name: 'Français', flag: '🇫🇷', data: fr },
  es: { name: 'Español', flag: '🇪🇸', data: es },
  de: { name: 'Deutsch', flag: '🇩🇪', data: de },
  pl: { name: 'Polski', flag: '🇵🇱', data: pl },
  it: { name: 'Italiano', flag: '🇮🇹', data: it },
  pt: { name: 'Português', flag: '🇵🇹', data: pt },
  hu: { name: 'Magyar', flag: '🇭🇺', data: hu },
  nl: { name: 'Nederlands', flag: '🇳🇱', data: nl },
  tr: { name: 'Türkçe', flag: '🇹🇷', data: tr },
  el: { name: 'Ελληνικά', flag: '🇬🇷', data: el },
  sv: { name: 'Svenska', flag: '🇸🇪', data: sv },
  ro: { name: 'Română', flag: '🇷🇴', data: ro },
  cs: { name: 'Čeština', flag: '🇨🇿', data: cs },
  da: { name: 'Dansk', flag: '🇩🇰', data: da },
  fi: { name: 'Suomi', flag: '🇫🇮', data: fi },
  no: { name: 'Norsk', flag: '🇳🇴', data: no },
  bg: { name: 'Български', flag: '🇧🇬', data: bg },
  zh: { name: '中文 (简体)', flag: '🇨🇳', data: zh },
  ja: { name: '日本語', flag: '🇯🇵', data: ja },
  ar: { name: 'العربية', flag: '🇸🇦', data: ar },
  ru: { name: 'Русский', flag: '🇷🇺', data: ru },
  'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷', data: ptBR },
};

class I18nService {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = AVAILABLE_LANGUAGES[this.currentLanguage]?.data || en;
    this.listeners = [];
  }
  
  /**
   * Detect user's browser language
   */
  detectLanguage() {
    // Check localStorage first
    const saved = localStorage.getItem('language');
    if (saved && AVAILABLE_LANGUAGES[saved]) {
      return saved;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (AVAILABLE_LANGUAGES[browserLang]) {
      return browserLang;
    }

    // Fall back to English
    return 'en';
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get current language name
   */
  getCurrentLanguageName() {
    return AVAILABLE_LANGUAGES[this.currentLanguage]?.name || 'English';
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    if (AVAILABLE_LANGUAGES[lang]) {
      this.currentLanguage = lang;
      this.translations = AVAILABLE_LANGUAGES[lang].data;
      localStorage.setItem('language', lang);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.entries(AVAILABLE_LANGUAGES).map(([code, { name, flag }]) => ({
      code,
      name,
      flag,
      isActive: code === this.currentLanguage
    }));
  }

  /**
   * Get translation key
   * Supports nested keys like "homepage.title"
   */
  t(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return value || defaultValue || key;
  }

  /**
   * Replace variables in translation string
   * Example: t('validation.minLength', { min: 5 })
   */
  tReplace(key, variables = {}, defaultValue = null) {
    let text = this.t(key, defaultValue);
    
    for (const [varName, varValue] of Object.entries(variables)) {
      text = text.replace(`{${varName}}`, varValue);
    }
    
    return text;
  }

  /**
   * Add language listener for reactive updates
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of language change
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  /**
   * Add new language (for dynamic language loading)
   */
  addLanguage(code, name, flag, translations) {
    if (!AVAILABLE_LANGUAGES[code]) {
      AVAILABLE_LANGUAGES[code] = { name, flag, data: translations };
      return true;
    }
    return false;
  }

  /**
   * Get all translations (for debugging)
   */
  getAllTranslations() {
    return { ...this.translations };
  }
}

// Create singleton instance
const i18nService = new I18nService();

export default i18nService;
