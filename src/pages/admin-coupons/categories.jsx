/**
 * src/pages/admin-coupons/categories.jsx
 * Admin Coupon Categories Management
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import categoryService from '../../services/categoryService';
import { useTranslation } from '../../context/I18nContext';

const AdminCouponCategories = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();
      setCategories(response.data?.categories || []);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t('adminCategories.nameRequired'));
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
        setSuccess(t('adminCategories.updateSuccess'));
      } else {
        await categoryService.createCategory(formData);
        setSuccess(t('adminCategories.createSuccess'));
      }
      
      setTimeout(() => setSuccess(null), 3000);
      setFormData({ name: '', slug: '', description: '' });
      setShowForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(t('adminCategories.saveFailed'));
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setSuccess(t('adminCategories.deleteSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      setDeleteConfirm(null);
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(t('adminCategories.deleteFailed'));
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: t('navigation.coupons'), path: '/admin-dashboard/coupons' },
    { label: 'Categories', path: '/admin-dashboard/coupons/categories' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onCollapsing={setSidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={breadcrumbs} />
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminCategories.title')}</h1>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', slug: '', description: '' });
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus size={20} />
              {t('adminCategories.addCategory')}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 pt-6 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Gaming Cards"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., gaming-cards"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("adminCategories.description")}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Category description"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingCategory ? t('adminUsers.update') : t('adminUsers.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-12">Loading categories...</div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                  {category.slug && (
                    <p className="text-sm text-gray-500 mb-3">Slug: {category.slug}</p>
                  )}
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  )}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                      {t("common.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No categories found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Category?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponCategories;
