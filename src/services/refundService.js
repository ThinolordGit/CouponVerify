/**
 * src/services/refundService.js - Refund Service
 * Handles refund-related API calls (frontend-side only — backend endpoints expected at /refunds/...)
 */

import apiClient from './api';
import { getUserUUID } from '../utils/uuid';

const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

const refundService = {
  /**
   * Submit refund (supports file uploads using multipart/form-data)
   */
  async submitRefund(data) {
    try {
      const userUUID = getUserUUID();
      const form = new FormData();

      form.append('user_uuid', userUUID);
      form.append('coupon_id', data.coupon_id);
      form.append('coupon_type', data.coupon_type || '');
      form.append('code', data.code || '');
      form.append('amount', typeof data.amount !== 'undefined' ? String(data.amount) : '0');
      form.append('currency', data.currency || 'EUR');
      form.append('recharge_date', data.recharge_date || '');
      form.append('recharge_time', data.recharge_time || '');
      form.append('email', data.email || '');
      form.append('reason', data.reason || '');
      form.append('reference', data.reference || `RFD-${Date.now()}`);

      if (Array.isArray(data.evidenceFiles)) {
        data.evidenceFiles.forEach((f, idx) => {
          if (f && f.size <= MAX_EVIDENCE_FILE_BYTES) {
            form.append('evidence[]', f, f.name || `evidence-${idx}`);
          }
        });
      }

      // Let axios set multipart boundary automatically — override content-type per request
      const response = await apiClient.post('/refunds/submit', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting refund:', error);
      throw error;
    }
  },

  async getRefundByReference(reference) {
    try {
      const response = await apiClient.get(`/refunds/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching refund by reference:', error);
      throw error;
    }
  },

  // Admin endpoints
  async getAllRefunds(filters = {}) {
    try {
      const response = await apiClient.get('/admin/refunds', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching refunds (admin):', error);
      throw error;
    }
  },

  async getPendingRefunds() {
    try {
      const response = await apiClient.get('/admin/refunds', { params: { status: 'pending' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending refunds:', error);
      throw error;
    }
  },

  async approveRefund(refundId) {
    try {
      const response = await apiClient.post(`/admin/refunds/${refundId}/approve`, {});
      return response.data;
    } catch (error) {
      console.error('Error approving refund:', error);
      throw error;
    }
  },

  async rejectRefund(refundId, reason = '') {
    try {
      const response = await apiClient.post(`/admin/refunds/${refundId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw error;
    }
  },

  async blockRefund(refundId, reason = '') {
    try {
      const response = await apiClient.post(`/admin/refunds/${refundId}/block`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error blocking refund:', error);
      throw error;
    }
  }
};

export default refundService;
