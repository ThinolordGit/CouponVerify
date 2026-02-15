/**
 * src/pages/admin-coupons/index.jsx
 * Admin Coupon Management - Full CRUD with modal forms
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import couponService from '../../services/couponService';
import categoryService from '../../services/categoryService';
import CouponFormModal from './components/CouponFormModal';
import { useTranslation } from '../../context/I18nContext';

const AdminCouponManagement = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load coupons
      const couponsResponse = await couponService.getAllCouponsAdmin({
        active: filter === 'active' ? 'true' : filter === 'inactive' ? 'false' : undefined
      });
      setCoupons(couponsResponse.data?.coupons || []);

      // Load categories
      try {
        const categoriesResponse = await categoryService.getAllCategories();
        setCategories(categoriesResponse.data?.categories || []);
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (formData) => {
    try {
      await couponService.createCoupon(formData);
      setSuccess(t('adminCoupons.createSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      loadData();
    } catch (err) {
      console.error('Error creating coupon:', err);
      throw new Error('Failed to create coupon');
    }
  };

  const handleUpdateCoupon = async (formData) => {
    try {
      await couponService.updateCoupon(editingCoupon.id, formData);
      setSuccess(t('adminCoupons.updateSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      setEditingCoupon(null);
      loadData();
    } catch (err) {
      console.error('Error updating coupon:', err);
      setError('Failed to update coupon. Please try again.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      setSuccess(t('adminCoupons.deleteSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon');
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: t('navigation.coupons'), path: '/admin-dashboard/coupons' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsing={setSidebarCollapsed}
        couponCount={coupons.length}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={breadcrumbs} />
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminCoupons.title')}</h1>
            <button
              onClick={() => {
                setEditingCoupon(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus size={20} />
              {t('adminCoupons.addCoupon')}
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
          {/* Filters & Search */}
          <div className="mb-6 flex gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('adminCoupons.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminCoupons.filterAll')} ({coupons.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminCoupons.filterActive')}
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminCoupons.filterInactive')}
              </button>
            </div>
          </div>

          {/* Coupons Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.name')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.category')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.amount')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.currencies')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.status')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.uses')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminCoupons.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCoupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{coupon.name}</p>
                          <p className="text-sm text-gray-500">{coupon.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.category}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.value ? `${coupon.value}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.currency || 'EUR'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          coupon.active || coupon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.active || coupon.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.current_uses || 0} / {coupon.max_uses || '∞'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title={t('common.edit')}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(coupon)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title={t('common.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">{t('adminCoupons.noCoupons')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Coupon Form Modal */}
      <CouponFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCoupon(null);
        }}
        onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
        initialData={editingCoupon}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('adminCoupons.deleteCoupon')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('adminCoupons.deleteCouponConfirm')} "{deleteConfirm.name}"? {t('common.back')}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDeleteCoupon(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponManagement;
