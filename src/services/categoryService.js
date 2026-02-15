/**
 * src/services/categoryService.js - Category Service
 * Handles all category-related API calls
 */

import apiClient from './api';

const categoryService = {
  /**
   * Get all categories
   */
  async getAllCategories() {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    try {
      const response = await apiClient.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  /**
   * Create new category (admin)
   */
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update category (admin)
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await apiClient.put(
        `/admin/categories/${categoryId}`,
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete category (admin)
   */
  async deleteCategory(categoryId) {
    try {
      const response = await apiClient.delete(
        `/admin/categories/${categoryId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default categoryService;
