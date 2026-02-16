import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import { CheckCircle, X, Ban, Eye, EyeOff, Search } from 'lucide-react';
import refundService from '../../services/refundService';
import AdminTable from '../../components/ui/AdminTable';
import { useTranslation } from '../../context/I18nContext';

const AdminRefunds = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allRefunds, setAllRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState({});

  useEffect(() => { loadRefunds(); }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const pending = await refundService.getPendingRefunds();
      const all = (await refundService.getAllRefunds())?.data?.refunds || [];

      const merged = [ ...(pending?.data?.refunds || []), ...all ].map(r => {
        // console.log(r)
        return {
          id: r.id,
          couponType: r.coupon_type || r.coupon_name,
          couponLogo: r.coupon_logo || r.logo || null,
          code: r.code_encrypted || r.code,
          email: r.email,
          amount: r.amount,
          currency: r.currency,
          status: r.status,
          reference: r.reference,
          date: r.submitted_at || r.created_at,
          rechargeDate: r.recharge_date || r.submitted_at,
          rechargeTime: r.recharge_time || r.submitted_at,
        }
      });

      setAllRefunds(merged);
      setError(null);
    } catch (err) {
      console.error('Failed to load refunds:', err);
      setError(t('adminRefunds.loadingError') || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeVisibility = (id) => setVisibleCodes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleApprove = (id) => { setSelected(allRefunds.find(r => r.id === id)); setModalAction('approve'); setShowActionModal(true); };
  const handleReject = (id) => { setSelected(allRefunds.find(r => r.id === id)); setModalAction('reject'); setShowActionModal(true); };
  const handleBlock  = (id) => { setSelected(allRefunds.find(r => r.id === id)); setModalAction('block'); setShowActionModal(true); };

  const submitAction = async () => {
    if (!selected || !modalAction) return;
    try {
      setActionLoading(true);

      switch (modalAction) {
        case 'approve':
          await refundService.approveRefund(selected.id);
          setSuccess(t('adminRefunds.approveSuccess'));
          break;
        case 'reject':
          await refundService.rejectRefund(selected.id, notes || '');
          setSuccess(t('adminRefunds.rejectSuccess'));
          break;
        case 'block':
          await refundService.blockRefund(selected.id, notes || '');
          setSuccess(t('adminRefunds.blockSuccess'));
          break;
      }

      setTimeout(() => setSuccess(null), 3000);
      setShowActionModal(false);
      setNotes('');
      setSelected(null);

      // reload
      loadRefunds();
    } catch (err) {
      console.error('Admin action failed:', err);
      setError(t('adminRefunds.actionError').replace('{action}', modalAction));
    } finally {
      setActionLoading(false);
    }
  };

  // counts + helpers (align with verifications page)
  const getFilterCounts = () => ({
    all: allRefunds.length,
    pending: allRefunds.filter(r => r.status === 'pending').length,
    approved: allRefunds.filter(r => r.status === 'approved' || r.status === 'valid').length,
    rejected: allRefunds.filter(r => r.status === 'rejected' || r.status === 'invalid').length
  });

  const counts = getFilterCounts();
  
  // Map backend status to display text
  const displayStatus = (status) => {
    const map = {
      'pending': t('adminRefunds.statusPending'),
      'valid': t('adminRefunds.statusValid'),
      'invalid': t('adminRefunds.statusInvalid'),
      'blocked': t('adminRefunds.statusBlocked')
    };
    return map[status] || status;
  };

  const filtered = allRefunds.filter(r => {
    // status filter
    if (filter === 'pending' && r.status !== 'pending') return false;
    if (filter === 'approved' && !(r.status === 'approved' || r.status === 'valid')) return false;
    if (filter === 'rejected' && !(r.status === 'rejected' || r.status === 'invalid')) return false;

    // search filter (email, coupon type, code, reference)
    if (!searchTerm || searchTerm.trim() === '') return true;
    const q = searchTerm.toLowerCase();
    return (r.email || '').toLowerCase().includes(q) ||
           (r.couponType || '').toLowerCase().includes(q) ||
           (r.reference || '').toLowerCase().includes(q) ||
           (r.code || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={sidebarCollapsed} onCollapsing={setSidebarCollapsed} />
      <div className={`${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'} transition-all duration-300`}>
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={[{ label: 'Dashboard', path: '/admin-dashboard' }, { label: t('navigation.refunds'), path: '/admin-dashboard/refunds' }]} />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{t('adminRefunds.title')}</h1>
        </div>

        {/* Messages */}
        <div className="px-6 pt-6 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Filters & Search */}
          <div className="mb-6 flex gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('adminVerifications.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminRefunds.filterAll')} ({counts.all})
              </button>

              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminRefunds.filterPending')} ({counts.pending})
              </button>

              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminRefunds.filterApproved')} ({counts.approved})
              </button>

              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminRefunds.filterRejected')} ({counts.rejected})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center">{t('adminRefunds.loadingRefunds')}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">{t('adminRefunds.noRefunds')}</div>
          ) : (
            <AdminTable
              columns={[
                { label: t('common.coupon') },
                { label: t('common.code') },
                { label: t('common.email') },
                { label: t('common.amount') },
                { label: t('common.reference') },
                { label: t('common.status') },
                { label: t('common.date') },
                { label: t('common.time') },
                { label: t('common.actions') }
              ]}
            >
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition border-b">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {r.couponLogo && (
                        <img
                          src={r.couponLogo}
                          alt={r.couponType}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span className="font-medium text-gray-900 min-w-max">{r.couponType}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {visibleCodes[r.id] ? (r.code || '••••') : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleCodeVisibility(r.id)}
                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                        title={visibleCodes[r.id] ? 'Hide code' : 'Show code'}
                      >
                        {visibleCodes[r.id] ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a href={`mailto:${r.email}`} className="hover:text-blue-600 underline text-sm">{r.email}</a>
                  </td>

                  <td className="px-4 py-3 text-gray-600 text-sm">{parseFloat(r.amount).toFixed(2)} {r.currency}</td>

                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">{r.reference}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${r.status==='pending'? 'bg-yellow-100 text-yellow-800' : r.status==='approved'? 'bg-green-100 text-green-800' : r.status==='rejected'? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {displayStatus(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.rechargeDate}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.rechargeTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={actionLoading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title={t('adminRefunds.approve') || t('adminVerifications.approve')}
                        >
                          <CheckCircle size={18} />
                        </button>

                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title={t('adminRefunds.reject') || t('adminVerifications.reject')}
                        >
                          <X size={18} />
                        </button>

                        <button
                          onClick={() => handleBlock(r.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-900 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title={t('adminRefunds.block') || t('adminVerifications.block')}
                        >
                          <Ban size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </AdminTable>
          )}
        </div>
      </div>

      {/* Simple modal for admin actions (approve/reject/block) */}
      {showActionModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'approve' && t('adminRefunds.approveConfirm')}
              {modalAction === 'reject' && t('adminRefunds.rejectConfirm')}
              {modalAction === 'block' && t('adminRefunds.blockConfirm')}
            </h2>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>{t('common.coupon')}:</strong> {selected.couponType}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.email')}:</strong> {selected.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.amount')}:</strong> {parseFloat(selected.amount).toFixed(2)} {selected.currency}
              </p>
              <p className="text-sm text-gray-600">
                <strong>{t('common.reference')}:</strong> {selected.reference}
              </p>
            </div>
            
            {(modalAction === 'reject' || modalAction === 'block') && (
              <>
                <textarea
                  placeholder={modalAction === 'reject' ? t('adminRefunds.rejectionReasonPlaceholder') : t('adminRefunds.blockReasonPlaceholder')}
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
                  modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? t('common.processing') : (
                  modalAction === 'approve' ? t('adminRefunds.approve') : modalAction === 'reject' ? t('adminRefunds.reject') : t('adminRefunds.block')
                )}
              </button>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setNotes('');
                  setSelected(null);
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

export default AdminRefunds;
