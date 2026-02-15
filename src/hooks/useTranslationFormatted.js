/**
 * src/hooks/useTranslationFormatted.js
 * Custom hook for translations with built-in formatting
 * 
 * Usage:
 *   const { t, formatDate, formatCurrency } = useTranslationFormatted();
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from '../context/I18nContext';
import translationAdapter from '../services/translationAdapter';

export function useTranslationFormatted() {
  const { t, tReplace, setLanguage, getAvailableLanguages, getCurrentLanguageName } = useTranslation();

  // Format date based on current language
  const formatDate = useCallback((date, options = {}) => {
    try {
      return translationAdapter.formatDate(date, undefined, options);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return new Date(date).toLocaleDateString();
    }
  }, []);

  // Format time based on current language
  const formatTime = useCallback((date, options = {}) => {
    try {
      return translationAdapter.formatTime(date, undefined, options);
    } catch (error) {
      console.warn('Time formatting error:', error);
      return new Date(date).toLocaleTimeString();
    }
  }, []);

  // Format date and time together
  const formatDateTime = useCallback((date, options = {}) => {
    try {
      const d = new Date(date);
      const locale = translationAdapter.getLocale();
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      }).format(d);
    } catch (error) {
      console.warn('DateTime formatting error:', error);
      return new Date(date).toLocaleString();
    }
  }, []);

  // Format number based on current language
  const formatNumber = useCallback((number, options = {}) => {
    try {
      return translationAdapter.formatNumber(number, undefined, options);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return number.toString();
    }
  }, []);

  // Format currency based on current language
  const formatCurrency = useCallback((amount, currency = 'USD', options = {}) => {
    try {
      return translationAdapter.formatCurrency(amount, currency, undefined, options);
    } catch (error) {
      console.warn('Currency formatting error:', error);
      return `${currency} ${amount}`;
    }
  }, []);

  // Format percentage
  const formatPercent = useCallback((value, decimals = 0) => {
    try {
      const locale = translationAdapter.getLocale();
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    } catch (error) {
      console.warn('Percentage formatting error:', error);
      return `${value}%`;
    }
  }, []);

  // Format relative time (e.g., "2 hours ago")
  const formatRelativeTime = useCallback((date) => {
    try {
      const now = new Date();
      const then = new Date(date);
      const diffMs = now - then;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffDays > 0) {
        return t('time.daysAgo', `${diffDays} days ago`).replace('{{count}}', diffDays);
      }
      if (diffHours > 0) {
        return t('time.hoursAgo', `${diffHours} hours ago`).replace('{{count}}', diffHours);
      }
      if (diffMinutes > 0) {
        return t('time.minutesAgo', `${diffMinutes} minutes ago`).replace('{{count}}', diffMinutes);
      }
      if (diffSeconds > 0) {
        return t('time.secondsAgo', `${diffSeconds} seconds ago`).replace('{{count}}', diffSeconds);
      }
      return t('time.justNow', 'just now');
    } catch (error) {
      console.warn('Relative time formatting error:', error);
      return 'just now';
    }
  }, [t]);

  // Pluralize text (e.g., "1 item" vs "5 items")
  const pluralize = useCallback((count, singular, plural) => {
    return count === 1 ? singular : plural;
  }, []);

  // Get formatted list of items (e.g., "item1, item2, and item3")
  const formatList = useCallback((items, options = {}) => {
    try {
      const locale = translationAdapter.getLocale();
      const formatter = new Intl.ListFormat(locale, {
        style: options.style || 'long',
        type: options.type || 'conjunction'
      });
      return formatter.format(items);
    } catch (error) {
      console.warn('List formatting error:', error);
      return items.join(', ');
    }
  }, []);

  const memoizedFormatters = useMemo(() => ({
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    pluralize,
    formatList
  }), [
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    pluralize,
    formatList
  ]);

  return {
    t,
    tReplace,
    setLanguage,
    getAvailableLanguages,
    getCurrentLanguageName,
    ...memoizedFormatters
  };
}

export default useTranslationFormatted;
