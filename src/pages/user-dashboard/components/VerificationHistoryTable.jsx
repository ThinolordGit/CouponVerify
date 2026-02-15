import React, { useState } from 'react';
import VerificationStatusIndicator from '../../../components/ui/VerificationStatusIndicator';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';
import VerificationDetailsModal from './VerificationDetailsModal';
import { useTranslation } from '../../../context/I18nContext';

const VerificationHistoryTable = ({ verifications }) => {
  const { t } = useTranslation();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })?.format(date);
  };

  const handleReVerify = (verification) => {
    // Navigate to coupon verification page with pre-filled data
    navigate('/coupon-verification', { 
      state: { 
        reVerification: true,
        transactionReference: verification?.transactionReference,
        couponType: verification?.couponType
      } 
    });
  };

  const toggleRowExpansion = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const openDetailsModal = (verification) => {
    setSelectedVerification(verification);
  };

  const closeDetailsModal = () => {
    setSelectedVerification(null);
  };

  if (!verifications || verifications?.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Icon name="FileX" size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('userDashboard.noVerifications')}</h3>
        <p className="text-gray-600 mb-6">{t('userDashboard.noVerificationsHint')}</p>
        <Button onClick={() => navigate('/coupon-verification')} iconName="Plus">{t('homepage.startVerifying')}</Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('common.reference')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('userDashboard.details.couponType')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('common.amount')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('userDashboard.details.submissionDate')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('userDashboard.details.verificationDate')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifications?.map((verification) => (
                <React.Fragment key={verification?.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRowExpansion(verification?.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Icon 
                            name={expandedRow === verification?.id ? 'ChevronDown' : 'ChevronRight'} 
                            size={16} 
                          />
                        </button>
                        <span className="text-sm font-medium text-gray-900">{verification?.transactionReference}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={verification?.brandLogo} 
                          alt={verification?.brandLogoAlt}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="text-sm text-gray-900">{verification?.couponType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <VerificationStatusIndicator 
                        status={verification?.status}
                        message={verification?.message || ''}
                        timestamp={verification?.verifiedAt || verification?.submittedAt}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {verification?.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(verification?.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(verification?.verifiedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(verification)}
                          iconName="Eye"
                          iconSize={16}
                        >
                          {t('common.details')}
                        </Button>
                        {(verification?.status === 'invalid' || verification?.status === 'pending') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReVerify(verification)}
                            iconName="RefreshCw"
                            iconSize={16}
                          >
                            {t('userDashboard.actions.reVerify')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === verification?.id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('userDashboard.transactionDetails')}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">{t('common.reference')}:</span>
                              <span className="ml-2 font-medium text-gray-900">{verification?.transactionReference}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{t('common.type')}:</span>
                              <span className="ml-2 font-medium text-gray-900">{verification?.couponType}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{t('common.amount')}:</span>
                              <span className="ml-2 font-medium text-gray-900">{verification?.amount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{t('common.status')}:</span>
                              <span className="ml-2">
                                <VerificationStatusIndicator 
                                  status={verification?.status}
                                  message={verification?.message || ''}
                                  timestamp={verification?.verifiedAt || verification?.submittedAt}
                                />
                              </span>
                            </div>
                          </div>
                          {verification?.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-gray-600 text-sm">{t('common.notes')}:</span>
                              <p className="mt-1 text-sm text-gray-900">{verification?.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {verifications?.map((verification) => (
          <div key={verification?.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={verification?.brandLogo} 
                    alt={verification?.brandLogoAlt}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{verification?.transactionReference}</p>
                    <p className="text-xs text-gray-600">{verification?.couponType}</p>
                  </div>
                </div>
                <VerificationStatusIndicator 
                  status={verification?.status}
                  message={verification?.message || ''}
                  timestamp={verification?.verifiedAt || verification?.submittedAt}
                />
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('common.amount')}:</span>
                  <span className="font-medium text-gray-900">{verification?.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('userDashboard.submittedOn')}</span>
                  <span className="text-gray-900">{formatDate(verification?.submittedAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('userDashboard.verifiedOn')}</span>
                  <span className="text-gray-900">{formatDate(verification?.verifiedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => openDetailsModal(verification)}
                  iconName="Eye"
                  iconSize={16}
                >
                  {t('common.details')}
                </Button>
                {(verification?.status === 'invalid' || verification?.status === 'pending') && (
                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    onClick={() => handleReVerify(verification)}
                    iconName="RefreshCw"
                    iconSize={16}
                  >
                    {t('userDashboard.actions.reVerify')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Details Modal */}
      {selectedVerification && (
        <VerificationDetailsModal
          verification={selectedVerification}
          onClose={closeDetailsModal}
          onReVerify={handleReVerify}
        />
      )}
    </>
  );
};

export default VerificationHistoryTable;