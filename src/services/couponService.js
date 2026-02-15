/**
 * src/services/couponService.js - Coupon Service
 * Handles all coupon-related API calls
 */

import apiClient from './api';

const couponService = {
  /**
   * Get all active coupons (public)
   */
  async getAllCoupons(limit = 50, offset = 0) {
    try {
      const response = await apiClient.get('/coupons', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  /**
   * Get coupon by slug (public)
   */
  async getCouponBySlug(slug) {
    try {
      const response = await apiClient.get(`/coupons/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  },

  /**
   * Get all coupons (admin - with filters)
   */
  async getAllCouponsAdmin(filters = {}) {
    try {
      const response = await apiClient.get('/admin/coupons', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin coupons:', error);
      throw error;
    }
  },

  /**
   * Create new coupon (admin)
   */
  async createCoupon(couponData) {
    try {
      const response = await apiClient.post('/admin/coupons', couponData);
      return response.data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  /**
   * Update coupon (admin)
   */
  async updateCoupon(id, couponData) {
    try {
      const response = await apiClient.put(`/admin/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  /**
   * Delete coupon (admin)
   */
  async deleteCoupon(id) {
    try {
      const response = await apiClient.delete(`/admin/coupons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }
};

export default couponService;
