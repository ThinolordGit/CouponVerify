/**
 * src/pages/admin-verifications/blocked.jsx
 * Admin Blocked Verifications Management
 */

import React, { useState, useEffect } from 'react';
import { Search, Unlock, AlertCircle, Loader } from 'lucide-react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import verificationService from '../../services/verificationService';
import { useTranslation } from '../../context/I18nContext';

const AdminBlockedVerifications = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unblockConfirm, setUnblockConfirm] = useState(null);
  const [unblockLoading, setUnblockLoading] = useState(false);

  useEffect(() => {
    loadBlockedVerifications();
  }, []);

  const loadBlockedVerifications = async () => {
    try {
      setLoading(true);
      const response = await verificationService.getBlockedVerifications();
      setVerifications(response.data?.verifications || []);

      setError(null);
    } catch (err) {
      console.error('Error loading blocked verifications:', err);
      setError('Failed to load blocked verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    try {
      setUnblockLoading(true);
      // Approving a blocked verification marks it as valid
      await verificationService.approveVerification(id);
      setSuccess(t('adminVerifications.unblockSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      setUnblockConfirm(null);
      loadBlockedVerifications();
    } catch (err) {
      console.error('Error unblocking verification:', err);
      setError('Failed to unblock verification');
    } finally {
      setUnblockLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(v =>
    (v.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (v.coupon_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (v.transaction_reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (v.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Verifications', path: '/admin-dashboard/verifications' },
    { label: 'Blocked', path: '/admin-dashboard/verifications/blocked' }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsing={setSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={breadcrumbs} />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('adminVerifications.blocked')}</h1>
              <p className="text-gray-600 mt-1">{t('adminVerifications.blockedCount').replace('{count}', filteredVerifications.length)}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 pt-6 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              ✓ {success}
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
              placeholder={t('adminVerifications.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Loader className="animate-spin mx-auto mb-4 text-gray-400" size={40} />
              <p className="text-gray-600">{t('adminVerifications.loadingBlocked')}</p>
            </div>
          ) : filteredVerifications.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminVerifications.couponType')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.email')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.amount')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.reference')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminVerifications.blockReason')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.date')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVerifications.map(verification => (
                    <tr key={verification.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {verification.coupon_type}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <a href={`mailto:${verification.email}`} className="hover:text-blue-600 underline">
                          {verification.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {parseFloat(verification.amount).toFixed(2)} {verification.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {verification.reference}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {verification.blocking_reason || verification.message || 'No reason provided'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(verification.submitted_at).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setUnblockConfirm(verification)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                        >
                          <Unlock size={18} />
                          {t('adminVerifications.unblock')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">{t('adminVerifications.noBlockedVerifications')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Unblock Confirmation Modal */}
      {unblockConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('adminVerifications.unblockConfirm')}</h3>
            <div className="mb-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{t('adminVerifications.couponType')}</p>
                <p className="text-gray-900 font-medium">{unblockConfirm.coupon_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-gray-900 font-medium">{unblockConfirm.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{t('common.amount')}</p>
                <p className="text-gray-900 font-medium">{parseFloat(unblockConfirm.amount).toFixed(2)} {unblockConfirm.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{t('adminVerifications.currentReason')}</p>
                <p className="text-red-600 font-medium">{unblockConfirm.message}</p>
              </div>
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded mt-4">
                ⚠️ {t('adminVerifications.unblockWarning')}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setUnblockConfirm(null)}
                disabled={unblockLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              >{t('common.cancel')}</button>
              <button
                onClick={() => handleUnblock(unblockConfirm.id)}
                disabled={unblockLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unblockLoading && <Loader size={18} className="animate-spin" />}
                {unblockLoading ? t('common.processing') : t('adminVerifications.unblock')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlockedVerifications;
