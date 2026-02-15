import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const ActivityFeed = ({ activities, title }) => {
  const { t } = useTranslation();
  const activityIcons = {
    'verification': 'CheckCircle2',
    'approval': 'ThumbsUp',
    'rejection': 'ThumbsDown',
    'coupon_added': 'Plus',
    'coupon_updated': 'Edit',
    'email_sent': 'Mail',
    'config_changed': 'Settings'
  };

  const activityColors = {
    'verification': 'text-primary',
    'approval': 'text-success',
    'rejection': 'text-error',
    'coupon_added': 'text-accent',
    'coupon_updated': 'text-warning',
    'email_sent': 'text-primary',
    'config_changed': 'text-muted-foreground'
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t('common.loading');
      if (diffMins < 60) return `${diffMins} ${t('common.time')} ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      console.warn('Invalid timestamp:', dateString, error);
      return 'N/A';
    }
  };

  const getActivityDescription = (activity) => {
    const actionKey = `adminDashboard.${activity?.action}`;
    const actionLabel = t(actionKey);
    return `Verification ${activity?.reference} ${actionLabel} for ${activity?.coupon} (${activity?.amount} ${activity?.currency})`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 md:p-6">
      <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3 sm:mb-4 md:mb-6">{title}</h3>
      <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-border last:border-0 last:pb-0">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${activityColors?.[activity?.type]}`}>
              <Icon name={activityIcons?.[activity?.type] || 'Activity'} size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground line-clamp-2">{getActivityDescription(activity)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(activity?.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;