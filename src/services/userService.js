/**
 * src/services/userService.js - User Service
 * Handles all user-related API calls
 */

import apiClient from './api';
import api from './api';

const userService = {
  /**
   * Get all users (admin)
   */
  async getAllUsers(filters = {}) {
    try {
      const response = await api.get('/admin/admin-users', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get user by ID (admin)
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/admin-users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Create new user (admin)
   */
  async createUser(userData) {
    try {
      const response = await api.post('/admin/admin-users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user (admin)
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/admin-users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete user (admin)
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/admin-users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

};

export default userService;
