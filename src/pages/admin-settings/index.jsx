/**
 * src/pages/admin-settings/index.jsx
 * Admin Site Settings - Global configuration
 */

import React, { useState, useEffect } from 'react';
import { Bell, Save, CheckCircle, AlertCircle, Loader, Upload } from 'lucide-react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import { useTranslation } from '../../context/I18nContext';
import settingsService from '../../services/settingsService';

const AdminSettings = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'CouponVerify',
    site_description: 'Gift card verification platform',
    site_logo_url: '/logo.png',
    site_favicon_url: '/favicon.ico',
    support_email: 'support@giftcard.test',
    timezone: 'Europe/Paris',
    language: 'en',
    seo_title_prefix: 'CouponVerify',
    site_keywords: 'coupon,verification,gift card',
    og_image_url: '',
    twitter_handle: '',
    custom_head_html: ''
  });

  // Verification Settings State
  const [verificationSettings, setVerificationSettings] = useState({
    autoApproveEnabled: false,
    minVerificationAmount: 5,
    maxVerificationAmount: 1000,
    verificationTimeout: 24,
    requireProof: true,
    enableNotifications: true
  });

  // Feature Flags State
  const [features, setFeatures] = useState({
    enableUserDashboard: true,
    enableCouponVerification: true,
    enableAdminPanel: true,
    enableHomePage: true,
    enableLaunchingPush: true,
    enableSubmitResume: false,
    enablePublicCatalog: true,
    enableSocialSharing: false,
    enableApiAccess: false
  });

  // Notification State
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const handleGeneralChange = (field, value) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleVerificationChange = (field, value) => {
    setVerificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
      const adminSubscribed = localStorage.getItem('admin_notifications_subscribed') === 'true';
      setNotificationEnabled(Notification.permission === 'granted' && adminSubscribed);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await settingsService.getAllSettings();
      
      // Map API settings to general state
      setGeneralSettings(prev => ({
        ...prev,
        site_name: allSettings.site_name || prev.site_name,
        site_description: allSettings.site_description || prev.site_description,
        site_logo_url: allSettings.site_logo_url || prev.site_logo_url,
        site_favicon_url: allSettings.site_favicon_url || prev.site_favicon_url,
        support_email: allSettings.support_email || prev.support_email,
        timezone: allSettings.timezone || prev.timezone,
        language: allSettings.language || prev.language,
        seo_title_prefix: allSettings.seo_title_prefix || prev.seo_title_prefix,
        site_keywords: allSettings.site_keywords || prev.site_keywords,
        og_image_url: allSettings.og_image_url || prev.og_image_url,
        twitter_handle: allSettings.twitter_handle || prev.twitter_handle,
        custom_head_html: allSettings.custom_head_html || prev.custom_head_html
      }));

      // Map API settings to verification state
      setVerificationSettings(prev => ({
        ...prev,
        autoApproveEnabled: allSettings.auto_approve_enabled === '1' || allSettings.auto_approve_enabled === true,
        minVerificationAmount: parseFloat(allSettings.min_verification_amount) || prev.minVerificationAmount,
        maxVerificationAmount: parseFloat(allSettings.max_verification_amount) || prev.maxVerificationAmount,
        verificationTimeout: parseInt(allSettings.verification_timeout_hours) || prev.verificationTimeout
      }));

      // Map API settings to features state
      setFeatures(prev => ({
        ...prev,
        enableUserDashboard: allSettings.enable_user_dashboard === '1' || allSettings.enable_user_dashboard === true,
        enableCouponVerification: allSettings.enable_coupon_verification === '1' || allSettings.enable_coupon_verification === true,
        enableAdminPanel: allSettings.enable_admin_panel === '1' || allSettings.enable_admin_panel === true,
        enableHomePage: allSettings.enable_home_page === '1' || allSettings.enable_home_page === true,
        enableLaunchingPush: allSettings.enable_launching_push === '1' || allSettings.enable_launching_push === true,
        enableSubmitResume: allSettings.enable_submit_resume === '1' || allSettings.enable_submit_resume === true,
        enablePublicCatalog: allSettings.enable_public_catalog === '1' || allSettings.enable_public_catalog === true,
        enableSocialSharing: allSettings.enable_social_sharing === '1' || allSettings.enable_social_sharing === true,
        enableApiAccess: allSettings.enable_api_access === '1' || allSettings.enable_api_access === true
      }));
    
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      const settingsToSave = {};

      // Map all general settings
      Object.keys(generalSettings).forEach(key => {
        settingsToSave[key] = generalSettings[key];
      });

      // Map verification settings with proper key names
      if (verificationSettings.autoApproveEnabled !== undefined) {
        settingsToSave['auto_approve_enabled'] = verificationSettings.autoApproveEnabled;
      }
      if (verificationSettings.minVerificationAmount !== undefined) {
        settingsToSave['min_verification_amount'] = verificationSettings.minVerificationAmount;
      }
      if (verificationSettings.maxVerificationAmount !== undefined) {
        settingsToSave['max_verification_amount'] = verificationSettings.maxVerificationAmount;
      }
      if (verificationSettings.verificationTimeout !== undefined) {
        settingsToSave['verification_timeout_hours'] = verificationSettings.verificationTimeout;
      }

      // Map feature settings with proper key names
      if (features.enableUserDashboard !== undefined) {
        settingsToSave['enable_user_dashboard'] = features.enableUserDashboard;
      }
      if (features.enableCouponVerification !== undefined) {
        settingsToSave['enable_coupon_verification'] = features.enableCouponVerification;
      }
      if (features.enableAdminPanel !== undefined) {
        settingsToSave['enable_admin_panel'] = features.enableAdminPanel;
      }
      if (features.enableHomePage !== undefined) {
        settingsToSave['enable_home_page'] = features.enableHomePage;
      }
      if (features.enableLaunchingPush !== undefined) {
        settingsToSave['enable_launching_push'] = features.enableLaunchingPush;
      }
      if (features.enableSubmitResume !== undefined) {
        settingsToSave['enable_submit_resume'] = features.enableSubmitResume;
      }
      if (features.enablePublicCatalog !== undefined) {
        settingsToSave['enable_public_catalog'] = features.enablePublicCatalog;
      }
      if (features.enableSocialSharing !== undefined) {
        settingsToSave['enable_social_sharing'] = features.enableSocialSharing;
      }
      if (features.enableApiAccess !== undefined) {
        settingsToSave['enable_api_access'] = features.enableApiAccess;
      }

      await settingsService.updateSettings(settingsToSave);
      
      setSuccess(t('adminSettings.saveSuccess'));
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload settings to confirm they were saved
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(t('adminSettings.saveError') || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Subscribe to push notifications with "**" admin identifier
        const subscription = await subscribePushAdmin();
        
        if (subscription) {
          localStorage.setItem('admin_notifications_subscribed', 'true');
          setNotificationEnabled(true);
          setNotificationStatus('granted');
          setSuccess(t('adminSettings.notificationsEnabledSuccess'));
          setTimeout(() => setSuccess(''), 5000);
        }
      } else {
        setNotificationStatus(permission);
        setError(t('adminSettings.permissionDenied'));
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error);
      setError(t('adminSettings.enableNotificationsError'));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const subscribePushAdmin = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Send subscription to backend with "**" admin identifier
      const response = await fetch('/api/admin/notifications/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          admin_identifier: '**',
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to push');
      }

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Settings', path: '/admin-dashboard/settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsing={setSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        <div className="bg-white border-b border-gray-200 p-4">
          <BreadcrumbNavigation items={breadcrumbs} />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{t('adminSettings.title')}</h1>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('adminSettings.general')}
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'verification'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('adminSettings.verification')}
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'features'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('adminSettings.features')}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              {t('adminSettings.notifications')}
            </button>
          </div>

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg p-6 space-y-6 max-w-3xl">
              {/* Basic Site Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminSettings.basicInfo')}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('adminSettings.siteName')}
                  </label>
                  <input
                    type="text"
                    value={generalSettings.site_name}
                    onChange={(e) => handleGeneralChange('site_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Site Name"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('adminSettings.siteDescription')}
                  </label>
                  <textarea
                    value={generalSettings.site_description}
                    onChange={(e) => handleGeneralChange('site_description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Site description..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('adminSettings.supportEmail')}
                  </label>
                  <input
                    type="email"
                    value={generalSettings.support_email}
                    onChange={(e) => handleGeneralChange('support_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Branding */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generalSettings.site_logo_url}
                      onChange={(e) => handleGeneralChange('site_logo_url', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="/logo.png"
                    />
                  </div>
                  {generalSettings.site_logo_url && (
                    <img src={generalSettings.site_logo_url} alt="Logo preview" className="mt-2 h-12 object-contain" />
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.site_favicon_url}
                    onChange={(e) => handleGeneralChange('site_favicon_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title Prefix
                  </label>
                  <input
                    type="text"
                    value={generalSettings.seo_title_prefix}
                    onChange={(e) => handleGeneralChange('seo_title_prefix', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="CouponVerify"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used as prefix for page titles</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={generalSettings.site_keywords}
                    onChange={(e) => handleGeneralChange('site_keywords', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="coupon, verification, gift card"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    value={generalSettings.og_image_url}
                    onChange={(e) => handleGeneralChange('og_image_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/og-image.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for social media sharing</p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={generalSettings.twitter_handle}
                    onChange={(e) => handleGeneralChange('twitter_handle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              {/* Advanced SEO - Custom Head HTML */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced SEO</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add custom HTML to site head (analytics, tracking scripts, etc.)
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Head HTML
                  </label>
                  <textarea
                    value={generalSettings.custom_head_html}
                    onChange={(e) => handleGeneralChange('custom_head_html', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
                    placeholder="&lt;meta ... &gt;&#10;&lt;script ... &gt;&lt;/script&gt;"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Only paste trusted HTML. This will be injected directly into page head.
                  </p>
                </div>
              </div>

              {/* Localization */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('adminSettings.timeZone')}
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Europe/Paris</option>
                      <option>Europe/London</option>
                      <option>Europe/Berlin</option>
                      <option>America/New_York</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.language')}</label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => handleGeneralChange('language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">{t('adminSettings.english')}</option>
                      <option value="fr">{t('adminSettings.french')}</option>
                      <option value="es">{t('adminSettings.spanish')}</option>
                      <option value="de">{t('adminSettings.german')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('adminSettings.saveGeneral')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Verification Settings Tab */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-lg p-6 space-y-6 max-w-2xl">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {t('adminSettings.configureVerification')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    {t('adminSettings.autoApproval')}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('adminSettings.autoApprovalDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={verificationSettings.autoApproveEnabled}
                  onChange={(e) =>
                    handleVerificationChange('autoApproveEnabled', e.target.checked)
                  }
                  className="w-6 h-6 rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminSettings.minAmount')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={verificationSettings.minVerificationAmount}
                    onChange={(e) =>
                      handleVerificationChange('minVerificationAmount', parseFloat(e.target.value))
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-600">EUR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminSettings.maxAmount')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={verificationSettings.maxVerificationAmount}
                    onChange={(e) =>
                      handleVerificationChange('maxVerificationAmount', parseFloat(e.target.value))
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-600">EUR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('adminSettings.expirationDelay')}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={verificationSettings.verificationTimeout}
                  onChange={(e) =>
                    handleVerificationChange('verificationTimeout', parseInt(e.target.value))
                  }
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    {t('adminSettings.requireProof')}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('adminSettings.requireProofDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={verificationSettings.requireProof}
                  onChange={(e) =>
                    handleVerificationChange('requireProof', e.target.checked)
                  }
                  className="w-6 h-6 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    {t('adminSettings.notificationsEnabled')}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('adminSettings.notificationsEnabledDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={verificationSettings.enableNotifications}
                  onChange={(e) =>
                    handleVerificationChange('enableNotifications', e.target.checked)
                  }
                  className="w-6 h-6 rounded border-gray-300"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('adminSettings.saveVerification')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-lg p-6 space-y-4 max-w-2xl">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {t('adminSettings.enableDisableFeatures')}
                </p>
              </div>

              {Object.entries(features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      {key === 'enableUserDashboard' && t('adminSettings.featureUserDashboard')}
                      {key === 'enableCouponVerification' && t('adminSettings.featureCouponVerification')}
                      {key === 'enableAdminPanel' && t('adminSettings.featureAdminPanel')}
                      {key === 'enableHomePage' && t('adminSettings.featureHomePage')}
                      {key === 'enableLaunchingPush' && t('adminSettings.featureLaunchingPush')}
                      {key === 'enableSubmitResume' && t('adminSettings.featureSubmitResume')}
                      {key === 'enablePublicCatalog' && t('adminSettings.featurePublicCatalog')}
                      {key === 'enableSocialSharing' && t('adminSettings.featureSocialSharing')}
                      {key === 'enableApiAccess' && t('adminSettings.featureApiAccess')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFeatureToggle(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      value
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {value ? t('common.enabled') : t('common.disabled')}
                  </button>
                </div>
              ))}

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium mt-6 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('adminSettings.saveFeatures')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg p-6 space-y-6 max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('adminSettings.pushNotifications')}
              </h2>
              
              <p className="text-gray-600">
                {t('adminSettings.pushDescription')}
              </p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{t('adminSettings.currentStatus')}</span> {
                    notificationEnabled 
                      ? `✓ ${t('adminSettings.notificationsOn')}` 
                      : notificationStatus === 'granted'
                      ? t('adminSettings.allowedNotActivated')
                      : t('adminSettings.notConfigured')
                  }
                </p>
              </div>

              {!notificationEnabled && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('adminSettings.clickToEnable')}
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        {t('common.activating')}
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {t('adminSettings.enableNotifications')}
                      </>
                    )}
                  </button>
                </div>
              )}

              {notificationEnabled && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t('adminSettings.pushEnabledDevice')}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {t('adminSettings.pushEnabledDesc')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
