/**
 * src/context/I18nContext.jsx - Internationalization Context
 * Provides translation functions and language switching to the entire app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import i18nService from '../services/i18n';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18nService.getCurrentLanguage());
  
  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = i18nService.subscribe((newLanguage) => {
      setLanguage(newLanguage);
    });

    return unsubscribe;
  }, []);

  const value = {
    language,
    t: (key, defaultValue) => i18nService.t(key, defaultValue),
    tReplace: (key, variables, defaultValue) => i18nService.tReplace(key, variables, defaultValue),
    setLanguage: (lang) => i18nService.setLanguage(lang),
    getAvailableLanguages: () => i18nService.getAvailableLanguages(),
    getCurrentLanguageName: () => i18nService.getCurrentLanguageName(),
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook to use translations in components
 */
export const useTranslation = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  
  return context;
};

export default I18nContext;
