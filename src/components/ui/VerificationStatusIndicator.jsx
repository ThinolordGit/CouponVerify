import React from 'react';
import Icon from '../AppIcon';
import { useTranslation } from '../../context/I18nContext';

const VerificationStatusIndicator = ({ status, message, timestamp, className = '' }) => {
  const { t } = useTranslation();
  const statusConfig = {
    approved: {
      icon: 'CheckCircle2',
      label: t('status.approved'),
      className: 'valid',
    },
    valid: {
      icon: 'CheckCircle2',
      label: t('status.valid'),
      className: 'valid',
    },
    rejected: {
      icon: 'XCircle',
      label: t('status.rejected'),
      className: 'invalid',
    },
    invalid: {
      icon: 'XCircle',
      label: t('status.invalid'),
      className: 'invalid',
    },
    pending: {
      icon: 'Clock',
      label: t('status.pending'),
      className: 'pending',
    },
    blocked: {
      icon: 'ShieldAlert',
      label: t('status.blocked'),
      className: 'blocked',
    },
    duplicate: {
      icon: 'AlertCircle',
      label: t('status.duplicate'),
      className: 'blocked',
    },
  };

  const config = statusConfig?.[status] || statusConfig?.pending;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })?.format(date);
  };

  return (
    <div className={`verification-status-indicator ${config?.className} ${className}`}>
      <Icon name={config?.icon} size={20} className="verification-status-indicator-icon" />
      <div className="flex flex-col gap-1">
        <span className="verification-status-indicator-text">{config?.label}</span>
        {message && (
          <span className="text-xs opacity-80">{message}</span>
        )}
        {timestamp && (
          <span className="text-xs opacity-60">{formatTimestamp(timestamp)}</span>
        )}
      </div>
    </div>
  );
};

export default VerificationStatusIndicator;