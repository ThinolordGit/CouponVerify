import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from '../../../context/I18nContext';

const AdminVerificationDetailsModal = ({ verification, isOpen, onClose, onApprove, onReject, coupons = [] }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Move statusMap outside of early return to ensure hooks always execute in same order
  const statusMap = useMemo(() => {
    return {
      'pending': { label: t('status.pending'), color: 'bg-warning/10 text-warning', icon: 'Clock' },
      'approved': { label: t('status.approved'), color: 'bg-success/10 text-success', icon: 'CheckCircle2' },
      'rejected': { label: t('status.rejected'), color: 'bg-error/10 text-error', icon: 'XCircle' },
      'blocked': { label: t('status.blocked'), color: 'bg-destructive/10 text-destructive', icon: 'ShieldAlert' },
      'duplicate': { label: t('status.duplicate'), color: 'bg-warning/10 text-warning', icon: 'AlertCircle' }
    };
  }, [t]);

  const statusInfo = useMemo(() => {
    if (!verification?.status) return statusMap['pending'];
    return statusMap[verification.status] || statusMap['pending'];
  }, [verification?.status, statusMap]);

  // Find corresponding coupon
  const correspondingCoupon = useMemo(() => {
    if (!verification?.coupon_id || !coupons?.length) return null;
    return coupons.find(c => c.id === verification.coupon_id);
  }, [verification?.coupon_id, coupons]);

  // Early return after all hooks
  if (!isOpen || !verification) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(verification?.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await onReject(verification?.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Get coupon logo and details
  const couponLogo = correspondingCoupon?.logo || 'https://via.placeholder.com/80/6366f1/ffffff?text=Coupon';
  const couponLogoAlt = correspondingCoupon?.name || verification?.coupon_type || 'Coupon';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-xl font-heading font-bold text-foreground">{t('adminDashboard.verificationDetails')}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
              aria-label={t('ui.close')}
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Coupon Info */}
            <div className="space-y-3">
              <h3 className="font-heading font-semibold text-foreground">{t('adminDashboard.couponInfo')}</h3>
              <div className="flex items-center gap-4">
                <Image
                  src={couponLogo}
                  alt={couponLogoAlt}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{verification?.coupon_type || 'N/A'}</p>
                  {correspondingCoupon?.description && (
                    <p className="text-xs text-muted-foreground mt-1">{correspondingCoupon.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('common.status')}</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusInfo.color}`}>
                <Icon name={statusInfo.icon} size={16} />
                <span className="font-semibold">{statusInfo.label}</span>
              </div>
            </div>

            {/* Verification Reference */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('adminDashboard.reference')}</p>
                <p className="font-semibold text-foreground text-sm break-all">{verification?.reference || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Transaction Ref</p>
                <p className="font-semibold text-foreground text-sm break-all">{verification?.transaction_reference || 'N/A'}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground break-all text-sm">{verification?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">IP Address</p>
                <p className="font-semibold text-foreground text-sm">{verification?.user_ip || 'N/A'}</p>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('adminDashboard.amount')}</p>
                <p className="font-semibold text-foreground text-lg">{verification?.amount} {verification?.currency}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('adminDashboard.submittedDate')}</p>
                <p className="font-semibold text-foreground text-sm">
                  {verification?.submitted_at
                    ? new Intl.DateTimeFormat('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(new Date(verification.submitted_at))
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Recharge Details */}
            {(verification?.recharge_date || verification?.recharge_time) && (
              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('adminDashboard.rechargeDetails')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">{t('adminDashboard.date')}: </span>{verification?.recharge_date || 'N/A'}
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">{t('adminDashboard.hour')}: </span>{verification?.recharge_time || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Message/Notes */}
            {verification?.message && (
              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Message</p>
                <p className="text-foreground text-sm">{verification?.message}</p>
              </div>
            )}

            {/* Verified Info */}
            {verification?.verified_at && (
              <div className="space-y-2 bg-success/5 border border-success/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('adminDashboard.verifiedOn')}</p>
                <p className="font-semibold text-foreground text-sm">
                  {new Intl.DateTimeFormat('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }).format(new Date(verification.verified_at))}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors font-medium"
              disabled={isLoading}
            >
              {t('ui.close')}
            </button>

            {verification?.status === 'pending' && (
              <>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-md bg-error/10 hover:bg-error/20 text-error transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('adminDashboard.reject')}
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-md bg-success hover:bg-success/90 text-success-foreground transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('adminDashboard.approve')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminVerificationDetailsModal;
