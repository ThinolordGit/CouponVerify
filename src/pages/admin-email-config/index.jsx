/**
 * src/pages/admin-email-config/index.jsx
 * Admin Email Configuration - SMTP and templates setup
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import api from '../../services/api';

const AdminEmailConfig = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('smtp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [configLoading, setConfigLoading] = useState(true);

  // SMTP Configuration State - Using backend key names
  const [smtpConfig, setSmtpConfig] = useState({
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASSWORD: '',
    SMTP_FROM_EMAIL: '',
    SMTP_SECURE: "TLS"  // TLS/SSL
  });

  // Load SMTP configuration from backend
  useEffect(() => {
    const loadSmtpConfig = async () => {
      setConfigLoading(true);
      setError('');
      try {
        const response = await api.get('/api/admin/notifications/config');
        if (response.data && response.data.config) {
          setSmtpConfig(response.data.config);
        }
      } catch (err) {
        console.error('Error loading SMTP config:', err);
        setError(t('errors.networkError'));
      } finally {
        setConfigLoading(false);
      }
    };
    loadSmtpConfig();
  }, []);

  // Load email templates from backend
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await api.get('/api/admin/email-templates/all');
        if (response.data && response.data.templates) {
          setTemplates(response.data.templates);
          if (response.data.templates.length > 0) {
            setSelectedTemplate(response.data.templates[0]);
          }
        }
      } catch (err) {
        console.error('Error loading email templates:', err);
        setError(t('errors.networkError'));
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Load coupons for preview
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await api.get('/api/coupons', { params: { limit: 10 } });
        if (response.data && response.data.coupons) {
          setPreviewCoupons(response.data.coupons);
          if (response.data.coupons.length > 0) {
            generatePreviewData(response.data.coupons[0]);
          }
        }
      } catch (err) {
        console.error('Error loading coupons:', err);
        // Fallback to mock data
        const mockCoupon = {
          id: 1,
          name: 'Sample Coupon',
          logo: 'https://via.placeholder.com/100',
          logo_alt: 'Coupon Logo',
          cover_image: 'https://via.placeholder.com/500x200',
          cover_image_alt: 'Coupon image'
        };
        setPreviewCoupons([mockCoupon]);
        generatePreviewData(mockCoupon);
      }
    };
    loadCoupons();
  }, []);

  // Generate preview data with coupon information
  const generatePreviewData = (coupon) => {
    setSelectedPreviewCoupon(coupon);
    setPreviewData({
      customer_name: 'John Doe',
      customer_email: 'user@example.com',
      reference: 'REF-2025-001234',
      coupon_title: coupon.name,
      coupon_logo: coupon.logo || '',
      coupon_logo_alt: coupon.logo_alt || coupon.name,
      coupon_cover: coupon.cover_image || '',
      coupon_cover_alt: coupon.cover_image_alt || coupon.name,
      amount: '150',
      currency: 'EUR',
      submission_date: '02/13/2025 at 2:30 PM',
      approval_date: '02/13/2025 at 3:45 PM',
      block_date: '02/13/2025 at 4:00 PM',
      rejection_reason: 'Blurry photo or expired coupon',
      detailed_reason: 'The provided document does not meet the required quality criteria.',
      block_reason: 'Terms of service violation',
      block_details: 'Following several suspicious verification attempts.',
      dashboard_url: window.location.origin + '/user-dashboard',
      contact_url: window.location.origin + '/contact',
      appeal_url: window.location.origin + '/appeal'
    });
  };

  // Email Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [previewCoupons, setPreviewCoupons] = useState([]);
  const [selectedPreviewCoupon, setSelectedPreviewCoupon] = useState(null);

  const handleSmtpChange = (field, value) => {
    setSmtpConfig(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Render template HTML with actual preview data
   */
  const renderPreviewHtml = (html) => {
    if (!previewData) return html;

    let rendered = html;

    // Handle conditional blocks like {{#coupon_logo}}...{{/coupon_logo}}
    const conditionalPattern = /\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs;
    rendered = rendered.replace(conditionalPattern, (match, varName, content) => {
      if (previewData[varName] && previewData[varName].toString().trim() !== '') {
        // Recursively replace variables in the conditional block
        return content.replace(/\{\{(\w+)\}\}/g, (m, v) => previewData[v] || '');
      }
      return ''; // Remove block if variable is empty
    });

    // Replace simple variables
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return previewData[variable] !== undefined ? previewData[variable] : '';
    });

    return rendered;
  };

  const handleSaveSMTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/admin/notifications/config-smtp', smtpConfig);
      if (response.data && response.data.status === 'success') {
        setSuccess(t('adminEmailConfig.saveSMTPSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error saving SMTP config:', err);
      setError(t('adminEmailConfig.saveSMTPError'));
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/admin/notifications/test-email', {
        email: smtpConfig.SMTP_FROM_EMAIL || 'test@example.com'
      });
      if (response.data && response.data.status === 'success') {
        setSuccess(t('adminEmailConfig.testEmailSuccess'));
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(t('adminEmailConfig.testEmailError') + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/admin/email-templates/all', {
        template_key: selectedTemplate.template_key,
        name: selectedTemplate.name,
        subject: selectedTemplate.subject,
        html_body: selectedTemplate.html_body,
        text_body: selectedTemplate.text_body,
        variables: selectedTemplate.variables
      });
      
      if (response.data && response.data.status === 'success') {
        // Update template in local state
        const updatedTemplates = templates.map(t =>
          t.template_key === selectedTemplate.template_key ? selectedTemplate : t
        );
        setTemplates(updatedTemplates);
        setEditingTemplate(false);
        setSuccess(t('adminEmailConfig.templates.saveSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(t('adminEmailConfig.templates.saveError'));
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };
  
  
  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Email Configuration', path: '/admin-dashboard/email-config' }
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
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{t('navigation.emailConfig')}</h1>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('smtp')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'smtp'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('adminEmailConfig.smtp')}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('adminEmailConfig.templates.title')}
            </button>
          </div>

          {/* SMTP Configuration Tab */}
          {activeTab === 'smtp' && (
            <div className="bg-white rounded-lg p-6 space-y-6 max-w-2xl">
              {configLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">{t('adminEmailConfig.loadingConfig')}</div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('adminEmailConfig.smtpHost')}
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={smtpConfig.SMTP_HOST}
                      onChange={(e) => handleSmtpChange('SMTP_HOST', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('adminEmailConfig.smtpPort')}
                      </label>
                      <input
                        type="number"
                        value={smtpConfig.SMTP_PORT}
                        onChange={(e) => handleSmtpChange('SMTP_PORT', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('adminEmailConfig.encryption')}
                      </label>
                      <select
                        value={smtpConfig.SMTP_SECURE}
                        onChange={(e) => handleSmtpChange('SMTP_SECURE', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TLS">TLS (Port 587)</option>
                        <option value="SSL">SSL (Port 465)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">{t('adminEmailConfig.encryptionHint')}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('adminEmailConfig.smtpUser')}
                    </label>
                    <input
                      type="email"
                      placeholder="votre-email@gmail.com"
                      value={smtpConfig.SMTP_USER}
                      onChange={(e) => handleSmtpChange('SMTP_USER', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('adminEmailConfig.smtpPassword')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={smtpConfig.SMTP_PASSWORD}
                      onChange={(e) => handleSmtpChange('SMTP_PASSWORD', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('adminEmailConfig.smtpPasswordHint')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('adminEmailConfig.fromEmail')}
                    </label>
                    <input
                      type="email"
                      placeholder="noreply@giftcard.com"
                      value={smtpConfig.SMTP_FROM_EMAIL}
                      onChange={(e) => handleSmtpChange('SMTP_FROM_EMAIL', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSaveSMTP}
                      disabled={loading || configLoading}
                      className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {loading ? t('common.saving') : t('adminEmailConfig.saveConfig')}
                    </button>
                    <button
                      onClick={handleTestEmail}
                      disabled={loading || configLoading || !smtpConfig.SMTP_HOST || !smtpConfig.SMTP_USER}
                      className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      title={!smtpConfig.SMTP_HOST ? t('adminEmailConfig.configureHostFirst') : !smtpConfig.SMTP_USER ? t('adminEmailConfig.configureUserFirst') : t('adminEmailConfig.sendTestEmail')}
                    >
                      {loading ? t('common.sending') : t('adminEmailConfig.sendTestEmail')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-lg p-6">
              {templatesLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">{t('adminEmailConfig.templates.loadingTemplates')}</div>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('adminEmailConfig.templates.noTemplates')}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Templates List - Responsive Grid */}
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Templates</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.template_key}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setEditingTemplate(false);
                          }}
                          className={`text-left px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition text-xs sm:text-sm ${
                            selectedTemplate?.template_key === template.template_key
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-medium truncate text-xs sm:text-sm">{template.name}</div>
                          <div className="text-xs opacity-75 mt-0.5 sm:mt-1 truncate">{template.subject}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Editor - Full Width */}
                  <div className="border-t border-gray-200 pt-6 sm:pt-8">
                    {selectedTemplate && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h2>
                          <p className="text-gray-600 text-sm">{t('adminEmailConfig.templates.key')} <code className="bg-gray-100 px-2 py-1 rounded">{selectedTemplate.template_key}</code></p>
                        </div>

                        {/* Subject Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('adminEmailConfig.templates.subject')}
                          </label>
                          {editingTemplate ? (
                            <input
                              type="text"
                              value={selectedTemplate.subject}
                              onChange={(e) =>
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  subject: e.target.value
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedTemplate.subject}</p>
                          )}
                        </div>

                        {/* HTML Body Editor */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {t('adminEmailConfig.templates.htmlContent')}
                            </label>
                            {editingTemplate && (
                              <span className="text-xs text-gray-500">{t('adminEmailConfig.templates.editHtmlDirectly')}</span>
                            )}
                          </div>
                          {editingTemplate ? (
                            <textarea
                              value={selectedTemplate.html_body}
                              onChange={(e) =>
                                setSelectedTemplate({
                                  ...selectedTemplate,
                                  html_body: e.target.value
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-96 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder={t('adminEmailConfig.templates.htmlPlaceholder')}
                            />
                          ) : (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                <span className="text-xs text-gray-600 font-medium">{t('adminEmailConfig.templates.previewWithImages')}</span>
                                {previewCoupons.length > 1 && (
                                  <select
                                    value={selectedPreviewCoupon?.id || ''}
                                    onChange={(e) => {
                                      const coupon = previewCoupons.find(c => c.id.toString() === e.target.value);
                                      if (coupon) generatePreviewData(coupon);
                                    }}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                                  >
                                    {previewCoupons.map(coupon => (
                                      <option key={coupon.id} value={coupon.id}>
                                        {coupon.name}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                              <iframe
                                srcDoc={renderPreviewHtml(selectedTemplate.html_body)}
                                className="w-full h-96 border-0"
                                title="Email Preview"
                                sandbox="allow-same-origin"
                              />
                            </div>
                          )}
                        </div>

                        {/* Variables Info */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="font-medium text-blue-900 mb-2">📋 {t('adminEmailConfig.templates.variablesTitle')}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                            {selectedTemplate.variables && Array.isArray(selectedTemplate.variables) && 
                              selectedTemplate.variables.map((variable, idx) => (
                                <code key={idx} className="bg-white px-2 py-1 rounded border border-blue-200">
                                  &#123;&#123;{variable}&#125;&#125;
                                </code>
                              ))
                            }
                          </div>
                        </div>

                        {/* Edit/Save Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          {editingTemplate ? (
                            <>
                              <button
                                onClick={handleUpdateTemplate}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                              >
                                {loading ? t('common.saving') : t('adminEmailConfig.templates.saveChanges')}
                              </button>
                              <button
                                onClick={() => setEditingTemplate(false)}
                                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-medium"
                              >{t('common.cancel')}</button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingTemplate(true)}
                              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                            >
                              {t('adminEmailConfig.templates.editThisTemplate')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmailConfig;
