/**
 * src/services/settingsService.js
 * Service for managing site settings via API
 */

import apiClient from './api';
import api from './api';

const settingsService = {
  /**
   * Get all settings
   */
  async getAllSettings() {
    try {
      const response = await apiClient.get('/admin/settings', {
        params: { action: 'get-all' }
      });
      return response.data.data?.settings || {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  /**
   * Get single setting
   */
  async getSetting(key) {
    try {
      const response = await api.get('/admin/settings', {
        params: { action: 'get', key }
      });
      return response.data.data?.value;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  /**
   * Update multiple settings
   */
  async updateSettings(settingsObject) {
    try {
      const response = await api.post('/admin/settings?action=update', {
        settings: settingsObject
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Get SEO settings (public, for site head - no auth required)
   */
  async getSeoSettings() {
    try {
      const response = await apiClient.get('/admin/settings', {
        params: { action: 'get-seo' }
      });
      return response.data.data?.seo || {};
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      return {};
    }
  },

  /**
   * Get coupon SEO data (public endpoint)
   */
  async getCouponSeo(slug) {
    try {
      const response = await apiClient.get(`/coupons/${slug}/seo`);
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching coupon SEO:', error);
      return {};
    }
  }
};

export default settingsService;
