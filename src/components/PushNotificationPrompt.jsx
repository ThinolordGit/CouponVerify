/**
 * src/components/PushNotificationPrompt.jsx - Push Notification Permission Prompt
 * Clean, custom UI for requesting notification permissions
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { subscribeToPush, resubmitExistingSubscription } from '../services/pushNotificationService';
import { resetUserUUID } from '../utils/uuid';
import { useTranslation } from '../context/I18nContext';

const PushNotificationPrompt = () => {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    // Only proceed in supported browsers
    if (!('Notification' in window)) return;

    const storedUUID = localStorage.getItem('user_uuid');

    // If UUID is missing we must rebind / re-prompt so backend can associate subscription
    if (!storedUUID) {
      (async () => {
        // If permission already granted, try to resend existing subscription under a new UUID
        if (Notification.permission === 'granted') {
          const result = await resubmitExistingSubscription();
          if (result?.ok) {
            // success: mark as enabled and show a brief success state
            localStorage.setItem('push_notifications_enabled', 'true');
            localStorage.setItem('pn_prompt_dismissed', 'true');
            setStatus('success');
            setTimeout(() => setStatus(null), 2000);
            return;
          }

          // no existing subscription or failed to resend — show prompt so user can re-enable
          localStorage.removeItem('pn_prompt_dismissed');
          setShowPrompt(true);
          return;
        }

        // permission not granted yet -> create a fresh UUID so next subscribe uses it
        resetUserUUID();
        const dismissed = localStorage.getItem('pn_prompt_dismissed');
        if (!dismissed) setShowPrompt(true);
      })();

      return;
    }

    // Normal flow when UUID exists
    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('pn_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    } else if (Notification.permission === 'denied') {
      localStorage.setItem('pn_prompt_dismissed', 'true');
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      // Reset UUID when enabling notifications
      resetUserUUID();
      
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Subscribe to push
        const subscription = await subscribeToPush();

        if (subscription) {
          setStatus('success');
          setTimeout(() => {
            setShowPrompt(false);
            localStorage.setItem('push_notifications_enabled', 'true');
          }, 2000);
        } else {
          throw new Error('Failed to subscribe');
        }
      } else if (permission === 'denied') {
        localStorage.setItem('pn_prompt_dismissed', 'true');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('[Push] Enable error:', error);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pn_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 right-0 m-4 max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4">
      {/* Success State */}
      {status === 'success' && (
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <h3 className="font-semibold">{t('pushNotifications.activated')}</h3>
              <p className="text-sm opacity-90">
                {t('pushNotifications.activatedDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-red-500 rounded-lg p-4 text-white shadow-lg">
          <p className="font-semibold">{t('common.error')}</p>
          <p className="text-sm opacity-90">
            {t('pushNotifications.enableError')}
          </p>
        </div>
      )}

      {/* Default Prompt */}
      {!status && (
        <div className="bg-white rounded-lg shadow-xl border-l-4 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2 flex-shrink-0 mt-1">
              <Bell size={20} className="text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">
                {t('pushNotifications.stayInformed')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('pushNotifications.realtimeDesc')}
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="px-4 py-3 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t('pushNotifications.instantPush')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t('pushNotifications.realtimeUpdates')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {t('pushNotifications.multiDevice')}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {t('pushNotifications.later')}
            </button>

            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('pushNotifications.activating')}
                </>
              ) : (
                <>
                  <Bell size={18} />
                  {t('pushNotifications.enable')}
                </>
              )}
            </button>
          </div>

          {/* Privacy Link */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              {t('pushNotifications.dataSecure')}{' '}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                {t('pushNotifications.learnMore')}
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationPrompt;
