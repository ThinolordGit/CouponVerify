import React from 'react';
import Button from '../../../components/ui/Button';
import VerificationStatusIndicator from '../../../components/ui/VerificationStatusIndicator';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const VerificationDetailsModal = ({ verification, onClose, onReVerify }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'medium'
    })?.format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('userDashboard.verificationDetails')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Reference */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('userDashboard.transactionRef')}</p>
              <p className="text-lg font-bold text-gray-900">{verification?.transactionReference}</p>
            </div>
            <VerificationStatusIndicator 
              status={verification?.status}
              message={verification?.statusMessage || ''}
              timestamp={verification?.submittedAt || verification?.verifiedAt || ''}
            />
          </div>

          {/* Coupon Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('userDashboard.couponInfo')}</h3>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img 
                src={verification?.brandLogo} 
                alt={verification?.brandLogoAlt}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm text-gray-600">{t('userDashboard.details.couponType')}</p>
                <p className="text-base font-semibold text-gray-900">{verification?.couponType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('common.amount')}</p>
                <p className="text-lg font-bold text-gray-900">{verification?.amount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('common.status')}</p>
                <VerificationStatusIndicator 
                  status={verification?.status}
                  message={verification?.statusMessage || ''}
                  timestamp={verification?.submittedAt || verification?.verifiedAt || ''}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('userDashboard.timeline')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-100 rounded-full p-2">
                  <Icon name="Upload" size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('userDashboard.submission')}</p>
                  <p className="text-sm text-gray-600">{formatDate(verification?.submittedAt)}</p>
                </div>
              </div>

              {verification?.verifiedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-emerald-100 rounded-full p-2">
                    <Icon name="CheckCircle2" size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('userDashboard.verificationCompleted')}</p>
                    <p className="text-sm text-gray-600">{formatDate(verification?.verifiedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {verification?.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t('userDashboard.verificationNotes')}</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-900">{verification?.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
          {(verification?.status === 'invalid' || verification?.status === 'pending') && (
            <Button
              variant="default"
              fullWidth
              onClick={() => {
                onReVerify(verification);
                onClose();
              }}
              iconName="RefreshCw"
            >
              {t('userDashboard.actions.reVerifyCoupon')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailsModal;