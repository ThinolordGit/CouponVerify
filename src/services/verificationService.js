/**
 * src/services/verificationService.js - Verification Service
 * Handles all verification-related API calls
 */

import apiClient from './api';
import { getUserUUID } from '../utils/uuid';

const verificationService = {
  /**
   * Submit new verification (public)
   */
  async submitVerification(data) {
    try {
      // Add user UUID to verification data for push notification tracking
      const userUUID = getUserUUID();
      const payload = {
        ...data,
        user_uuid: userUUID
      };

      // Use longer timeout for verification submission (60s max)
      // Backend needs time to process, send emails, and push notifications
      const response = await apiClient.post('/verifications/submit', payload, {
        timeout: 60000 // 60s for this endpoint
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  },

  /**
   * Get verification by reference (public)
   */
  async getVerificationByReference(reference) {
    try {
      const response = await apiClient.get(`/verifications/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification:', error);
      throw error;
    }
  },

  /**
   * Get all verifications (admin)
   */
  async getAllVerifications(filters = {}) {
    try {
      const response = await apiClient.get('/admin/verifications', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all verifications:', error);
      throw error;
    }
  },

  /**
   * Get all pending verifications (admin)
   */
  async getPendingVerifications() {
    try {
      const response = await apiClient.get('/admin/verifications', {
        params: { status: 'pending' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }
  },

  /**
   * Get all blocked verifications (admin)
   */
  async getBlockedVerifications() {
    try {
      const response = await apiClient.get('/admin/verifications', {
        params: { status: 'blocked' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching blocked verifications:', error);
      throw error;
    }
  },

  /**
   * Approve verification (admin)
   */
  async approveVerification(verificationId) {
    try {
      const response = await apiClient.post(
        `/admin/verifications/${verificationId}/approve`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error approving verification:', error);
      throw error;
    }
  },

  /**
   * Reject verification (admin)
   */
  async rejectVerification(verificationId, reason = '') {
    try {
      const response = await apiClient.post(
        `/admin/verifications/${verificationId}/reject`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  },

  /**
   * Block verification (admin)
   */
  async blockVerification(verificationId, reason = '') {
    try {
      const response = await apiClient.post(
        `/admin/verifications/${verificationId}/block`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error('Error blocking verification:', error);
      throw error;
    }
  }
};

export default verificationService;
