import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import { Search, Link as LinkIcon, CheckCircle, X, Ban, Eye, EyeOff } from 'lucide-react';
import verificationService from '../../services/verificationService';
import AdminTable from '../../components/ui/AdminTable';
import { useTranslation } from '../../context/I18nContext';

const AdminVerifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allVerifications, setAllVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve', 'reject', 'block'
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState({});  // Track visible coupon codes

  // Transform backend data to frontend format
  const transformVerification = (v) => ({
    id: v.id,
    couponType: v.coupon_type,
    couponLogo: v.coupon_logo || v.logo,  // Add coupon logo
    code: v.code_encrypted || v.code,     // Add coupon code
    email: v.email,
    amount: v.amount,
    currency: v.currency,
    status: mapStatus(v.status),
    statusValue: v.status,
    date: v.submitted_at || v.created_at,
    reference: v.reference,
    transactionReference: v.transaction_reference,
    message: v.message,
    rechargeDate: v.recharge_date,
    rechargeTime: v.recharge_time
  });

  // Map backend status to display text
  const mapStatus = (status) => {
    const map = {
      'pending': t('adminVerifications.statusPending'),
      'valid': t('adminVerifications.statusValid'),
      'invalid': t('adminVerifications.statusInvalid'),
      'blocked': t('adminVerifications.statusBlocked')
    };
    return map[status] || status;
  };
  
  // Reverse map for filtering
  const reverseMapStatus = (displayStatus) => {
    const map = {
      'pending': 'pending',
      'approved': 'valid',
      'rejected': 'invalid',
      'blocked': 'blocked'
    };
    return map[displayStatus] || displayStatus;
  };

  // Load verifications from API
  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      // Load ALL verifications without status filter
      const pending = await verificationService.getAllVerifications({ status: 'pending' });
      const valid = await verificationService.getAllVerifications({ status: 'valid' });
      const invalid = await verificationService.getAllVerifications({ status: 'invalid' });
      const blocked = await verificationService.getAllVerifications({ status: 'blocked' });
      
      const allVers = [
        ...(pending.data?.verifications || []),
        ...(valid.data?.verifications || []),
        ...(invalid.data?.verifications || []),
        ...(blocked.data?.verifications || [])
      ].map(transformVerification);
      
      setAllVerifications(allVers);
      setError(null);
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  // Filter verifications based on status and search
  const getFilteredVerifications = () => {
    let filtered = allVerifications;
    
    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(v => v.statusValue === 'pending');
    } else if (filter === 'approved') {
      filtered = filtered.filter(v => v.statusValue === 'valid');
    } else if (filter === 'rejected') {
      filtered = filtered.filter(v => v.statusValue === 'invalid');
    }
    // 'all' shows everything
    
    // Apply search filter
    filtered = filtered.filter(v =>
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.couponType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered;
  };
  
  const filteredVerifications = getFilteredVerifications();

  // Handle approve action
  const handleApproveClick = (id) => {
    setSelectedVerification(allVerifications.find(v => v.id === id));
    setModalAction('approve');
    setShowActionModal(true);
  };
  
  // Handle reject action
  const handleRejectClick = (id) => {
    setSelectedVerification(allVerifications.find(v => v.id === id));
    setModalAction('reject');
    setShowActionModal(true);
  };

  // Handle block action
  const handleBlockClick = (id) => {
    setSelectedVerification(allVerifications.find(v => v.id === id));
    setModalAction('block');
    setShowActionModal(true);
  };

  // Submit action to API
  const submitAction = async () => {
    if (!selectedVerification || !modalAction) return;

    try {
      setActionLoading(true);
      switch (modalAction) {
        case 'approve':
          await verificationService.approveVerification(selectedVerification.id);
          setSuccess(t('adminVerifications.approveSuccess'));
          break;
        case 'reject':
          await verificationService.rejectVerification(selectedVerification.id, notes);
          setSuccess(t('adminVerifications.rejectSuccess'));
          break;
        case 'block':
          await verificationService.blockVerification(selectedVerification.id, notes);
          setSuccess(t('adminVerifications.blockSuccess'));
          break;
      }
      
      setTimeout(() => setSuccess(null), 3000);
      setShowActionModal(false);
      setNotes('');
      setSelectedVerification(null);
      setModalAction(null);
      
      // Reload verifications
      loadVerifications();
    } catch (err) {
      console.error(`Error performing ${modalAction} action:`, err);
      setError(t('adminVerifications.actionError').replace('{action}', modalAction));
    } finally {
      setActionLoading(false);
    }
  };
  
  // Toggle coupon code visibility
  const toggleCodeVisibility = (verificationId) => {
    setVisibleCodes(prev => ({
      ...prev,
      [verificationId]: !prev[verificationId]
    }));
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: t('navigation.verifications'), path: '/admin-dashboard/verifications' }
  ];

  const getFilterCounts = () => {
    return {
      all: allVerifications.length,
      pending: allVerifications.filter(v => v.statusValue === 'pending').length,
      approved: allVerifications.filter(v => v.statusValue === 'valid').length,
      rejected: allVerifications.filter(v => v.statusValue === 'invalid').length
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onCollapsing={setSidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={breadcrumbs} />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{t('adminVerifications.title')}</h1>
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
                placeholder={t('adminVerifications.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminVerifications.filterAll')} ({counts.all})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminVerifications.filterPending')} ({counts.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminVerifications.filterApproved')} ({counts.approved})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminVerifications.filterRejected')} ({counts.rejected})
              </button>
            </div>
          </div>
          
          {/* Verifications Table */}
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600">{t('adminVerifications.loadingVerifications')}</p>
            </div>
          ) : filteredVerifications.length > 0 ? (
            <AdminTable
              columns={[
                { label: t('common.coupon') },
                { label: t('common.code') },
                { label: t('common.email') },
                { label: t('common.amount') },
                { label: t('common.reference') },
                { label: t('common.status') },
                { label: t('common.date') },
                { label: t('common.actions') }
              ]}
            >
              {filteredVerifications.map(verification => (
                <tr key={verification.id} className="hover:bg-gray-50 transition border-b">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {verification.couponLogo && (
                        <img 
                          src={verification.couponLogo}
                          alt={verification.couponType}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span className="font-medium text-gray-900 min-w-max">{verification.couponType}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {visibleCodes[verification.id] ? (
                          verification.code || '••••'
                        ) : (
                          '••••••••'
                        )}
                      </span>
                      <button
                        onClick={() => toggleCodeVisibility(verification.id)}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                        title={visibleCodes[verification.id] ? 'Hide code' : 'Show code'}
                      >
                        {visibleCodes[verification.id] ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    <a href={`mailto:${verification.email}`} className="hover:text-blue-600 underline text-sm">
                      {verification.email}
                    </a>
                  </td>

                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {parseFloat(verification.amount).toFixed(2)} {verification.currency}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                    {verification.reference}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      verification.statusValue === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      verification.statusValue === 'valid' ? 'bg-green-100 text-green-800' :
                      verification.statusValue === 'invalid' ? 'bg-red-100 text-red-800' :
                      verification.statusValue === 'blocked' ? 'bg-red-200 text-red-900' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {verification.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(verification.date).toLocaleDateString('en-US')}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {verification.statusValue === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveClick(verification.id)}
                          disabled={actionLoading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title={t('adminVerifications.approve')}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleRejectClick(verification.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title={t('adminVerifications.reject')}
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleBlockClick(verification.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-900 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title={t('adminVerifications.block')}
                        >
                          <Ban size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </AdminTable>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600">{t('adminVerifications.noVerifications')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'approve' && t('adminVerifications.approveConfirm')}
              {modalAction === 'reject' && t('adminVerifications.rejectConfirm')}
              {modalAction === 'block' && t('adminVerifications.blockConfirm')}
            </h2>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>{t('common.coupon')}:</strong> {selectedVerification.couponType}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.email')}:</strong> {selectedVerification.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.amount')}:</strong> {parseFloat(selectedVerification.amount).toFixed(2)} {selectedVerification.currency}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.reference')}:</strong> {selectedVerification.reference}
              </p>
            </div>

            {(modalAction === 'reject' || modalAction === 'block') && (
              <>
                <textarea
                  placeholder={modalAction === 'reject' ? t('adminVerifications.rejectionReasonPlaceholder') : t('adminVerifications.blockReasonPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={submitAction}
                disabled={actionLoading}
                className={`flex-1 text-white px-4 py-2 rounded-lg font-medium transition ${
                  modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? t('common.processing') : (
                  modalAction === 'approve' ? t('adminVerifications.approve') :
                  modalAction === 'reject' ? t('adminVerifications.reject') :
                  t('adminVerifications.block')
                )}
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setNotes('');
                  setSelectedVerification(null);
                  setModalAction(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-medium disabled:opacity-50 transition"
              >{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
