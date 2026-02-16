import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useTranslation } from '../../../context/I18nContext';

const RecentVerificationCard = ({ verification, coupons=[], onApprove, onReject, onViewDetails, isSuperAdmin=true }) => {
  const { t } = useTranslation();
  // Map backend status values to display status
  const statusMap = {
    'pending': t('status.pending'),
    'approved': t('status.approved'),
    'valid': t('status.approved'),
    'rejected': t('status.rejected'),
    'blocked': t('status.blocked'),
    'duplicate': t('status.duplicate'),
  };
  // console.log(verification?.status)
  const displayStatus = statusMap[verification?.status] || t('status.pending');

  const statusConfig = {
    [t('status.pending')]: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock' },
    [t('status.approved')]: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle2' },
    [t('status.rejected')]: { color: 'bg-error/10 text-error border-error/20', icon: 'XCircle' },
    [t('status.blocked')]: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: 'ShieldAlert' },
    [t('status.duplicate')]: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'AlertCircle' }
  };

  const config = statusConfig?.[displayStatus] || statusConfig?.[t('status.pending')];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Vérifier que la date est valide
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn('Invalid date:', dateString, error);
      return 'N/A';
    }
  };
  // console.log(`[verif type] ${verification?.coupon_type}`)
  // Use placeholder logo if not available
  // let couponLogo = 'https://via.placeholder.com/48/6366f1/ffffff?text=' + encodeURIComponent((verification?.coupon_type || 'Coupon').substring(0, 10));
  // let couponLogoAlt = verification?.coupon_type || 'Coupon';
  
  const cp = coupons?.filter((coupon) => verification?.coupon_type?.toLowerCase() === coupon.name?.toLowerCase())?.[0] ;
  // console.log(verification?.coupon_type," ",cp)
  const couponLogo = cp?.logo
  const couponLogoAlt = cp?.logo_alt
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-smooth">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Image
            src={couponLogo}
            alt={couponLogoAlt}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 bg-muted"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground truncate">{verification?.coupon_type}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{verification?.email}</p>
          </div>
        </div>
        
        <div className={`flex flex-col ${isSuperAdmin ? "" : "lg:flex-row xl:flex-row xl:items-center lg:items-center"} xs:flex-row xs:items-center gap-2 sm:gap-3 lg:gap-4`}>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{verification?.amount} {verification?.currency}</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-xs sm:text-sm font-medium ${config?.color}`}>
            <Icon name={config?.icon} size={14} className="sm:w-4 sm:h-4" />
            <span>{displayStatus}</span>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(verification?.submitted_at || verification?.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {verification?.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(verification?.id)}
                className="p-1.5 sm:p-2 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
                aria-label={t('adminDashboard.approve')}
                title={t('adminDashboard.approve')}
              >
                <Icon name="Check" size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
              <button
                onClick={() => onReject(verification?.id)}
                className="p-1.5 sm:p-2 rounded-md bg-error/10 text-error hover:bg-error/20 transition-colors"
                aria-label={t('adminDashboard.reject')}
                title={t('adminDashboard.reject')}
              >
                <Icon name="X" size={16} className="sm:w-4.5 sm:h-4.5" />
              </button>
            </>
          )}
          <button
            onClick={() => onViewDetails(verification?.id)}
            className="p-1.5 sm:p-2 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
            aria-label={t('ui.viewDetails')}
            title={t('ui.viewDetails')}
          >
            <Icon name="Eye" size={16} className="sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentVerificationCard;