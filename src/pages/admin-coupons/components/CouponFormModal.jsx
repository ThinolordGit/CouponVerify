/**
 * src/pages/admin-coupons/components/CouponFormModal.jsx
 * Modal form for creating/editing coupons with comprehensive fields
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

const CouponFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = []
}) => {
  const { t } = useTranslation();
  // Available currencies for multi-select
  const availableCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN'];
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    category: '',
    supported_currencies: ['USD'],
    is_active: true,
    theme_color: '#3B82F6',
    logo: '',
    logo_alt: '',
    cover_image: '',
    cover_image_alt: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image_url: '',
    custom_head_html: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && isOpen) {
      // Normalize the data - convert null/undefined to appropriate empty values
      const normalized = {};
      Object.keys(formData).forEach(key => {
        const value = initialData[key];
        if (value === null || value === undefined) {
          // Convert null/undefined to default value based on type
          if (typeof formData[key] === 'number') {
            normalized[key] = 0;
          } else if (typeof formData[key] === 'boolean') {
            normalized[key] = false;
          } else if (Array.isArray(formData[key])) {
            // Handle arrays - default to first element or empty array
            normalized[key] = formData[key].length > 0 ? [formData[key][0]] : ['USD'];
          } else {
            normalized[key] = '';
          }
        } else {
          // Handle arrays - ensure they're arrays not strings
          if (Array.isArray(formData[key]) && typeof value === 'string') {
            try {
              // Try to parse if it's JSON string
              normalized[key] = JSON.parse(value);
            } catch {
              // Otherwise wrap in array
              normalized[key] = [value];
            }
          } else {
            normalized[key] = value;
          }
        }
      });
      setFormData(normalized);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCurrencyChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          supported_currencies: [...prev.supported_currencies, value]
        };
      } else {
        return {
          ...prev,
          supported_currencies: prev.supported_currencies.filter(c => c !== value)
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.slug || !formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.short_description || !formData.short_description.trim()) {
      newErrors.short_description = 'Short description is required';
    }
    // Only require category for new coupons
    if (!initialData && !formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.supported_currencies || formData.supported_currencies.length === 0) {
      newErrors.supported_currencies = 'At least one currency must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    // Prepare data to send to backend - only include backend-supported fields
    const submitData = {
      name: formData.name,
      slug: formData.slug,
      short_description: formData.short_description,
      category: formData.category,
      supported_currencies: formData.supported_currencies,
      is_active: formData.is_active,
      theme_color: formData.theme_color,
      logo: formData.logo,
      logo_alt: formData.logo_alt,
      cover_image: formData.cover_image,
      cover_image_alt: formData.cover_image_alt,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      seo_keywords: formData.seo_keywords,
      og_image_url: formData.og_image_url,
      custom_head_html: formData.custom_head_html
    };

    setLoading(true);
    try {
      await onSubmit(submitData);
      setFormData({
        name: '',
        slug: '',
        short_description: '',
        category: '',
        supported_currencies: ['USD'],
        is_active: true,
        theme_color: '#3B82F6',
        logo: '',
        logo_alt: '',
        cover_image: '',
        cover_image_alt: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        og_image_url: '',
        custom_head_html: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {initialData ? t('adminCoupons.editCoupon') : t('adminCoupons.addCoupon')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {errors.submit}
            </div>
          )}
          {Object.keys(errors).length > 0 && !errors.submit && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
              <p className="font-medium mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, message]) =>
                  field !== 'submit' && <li key={field}>{field}: {message}</li>
                )}
              </ul>
            </div>
          )}

          {/* Basic Information */}
          <fieldset className="space-y-4 pb-6 border-b">
            <legend className="text-lg font-semibold text-gray-900 mb-4">{t('adminCoupons.basicInfo')}</legend>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('adminCoupons.namePlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.slug')} *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder={t('adminCoupons.slugPlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.shortDescription')} *
              </label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                placeholder={t('adminCoupons.description')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.short_description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.category')} *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{t('adminCoupons.selectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name} >{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.isActive')}
                </label>
                <select
                  name="is_active"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    is_active: e.target.value === 'true'
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">{t('common.active')}</option>
                  <option value="false">{t('common.inactive')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('adminCoupons.currencies')} * 
                {errors.supported_currencies && <span className="text-red-500 text-xs ml-2">{errors.supported_currencies}</span>}
              </label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                {availableCurrencies.map(currency => (
                  <label key={currency} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.supported_currencies.includes(currency)}
                      onChange={handleCurrencyChange}
                      value={currency}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{currency}</span>
                  </label>
                ))}
              </div>
              {formData.supported_currencies.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">Selected: {formData.supported_currencies.join(', ')}</p>
              )}
            </div>
          </fieldset>

          {/* Branding & Media */}
          <fieldset className="space-y-4 pb-6 border-b">
            <legend className="text-lg font-semibold text-gray-900 mb-4">{t('adminCoupons.brandingMedia')}</legend>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.themeColor')}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  name="theme_color"
                  value={formData.theme_color}
                  onChange={handleChange}
                  className="w-20 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">{formData.theme_color}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.logoUrl')}
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.logoAlt')}
                </label>
                <input
                  type="text"
                  name="logo_alt"
                  value={formData.logo_alt}
                  onChange={handleChange}
                  placeholder="Alt text for logo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.coverImageUrl')}
                </label>
                <input
                  type="url"
                  name="cover_image"
                  value={formData.cover_image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('adminCoupons.coverImageAlt')}
                </label>
                <input
                  type="text"
                  name="cover_image_alt"
                  value={formData.cover_image_alt}
                  onChange={handleChange}
                  placeholder="Alt text for cover image"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </fieldset>

          {/* SEO Settings */}
          <fieldset className="space-y-4 pb-6 border-b">
            <legend className="text-lg font-semibold text-gray-900 mb-4">{t('adminCoupons.seoSettings')}</legend>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.seoTitle')}
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                placeholder={t('adminCoupons.seoTitlePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used as page title in search results</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.seoDescription')}
              </label>
              <textarea
                name="seo_description"
                value={formData.seo_description}
                onChange={handleChange}
                placeholder={t('adminCoupons.seoDescriptionPlaceholder')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Meta description for search engines (160 characters recommended)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.seoKeywords')}
              </label>
              <input
                type="text"
                name="seo_keywords"
                value={formData.seo_keywords}
                onChange={handleChange}
                placeholder={t('adminCoupons.seoKeywordsPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords for SEO</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.ogImage')}
              </label>
              <input
                type="url"
                name="og_image_url"
                value={formData.og_image_url}
                onChange={handleChange}
                placeholder={t('adminCoupons.ogImagePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Image for social media sharing (Open Graph)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adminCoupons.customHeadHtml')}
              </label>
              <textarea
                name="custom_head_html"
                value={formData.custom_head_html}
                onChange={handleChange}
                placeholder={t('adminCoupons.customHeadHtmlPlaceholder')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{t('adminCoupons.customHeadHtmlHelp')}</p>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {t('adminCoupons.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? t('adminCoupons.saving') : t('adminCoupons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;
