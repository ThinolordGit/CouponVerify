import React, { useState } from 'react';
import CustomerHeader from '../../components/ui/CustomerHeader';
import VerificationHistoryTable from './components/VerificationHistoryTable';
import AccountSummary from './components/AccountSummary';
import SearchAndFilters from './components/SearchAndFilters';
import { useTranslation } from '../../context/I18nContext';


const UserDashboard = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [couponTypeFilter, setCouponTypeFilter] = useState('');

  // Mock verification history data
  const verificationHistory = [
  {
    id: 'TRX-2026-001',
    transactionReference: 'TRX-2026-001',
    couponType: 'PCS Mastercard',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ba80051e-1770642605879.png",
    brandLogoAlt: 'PCS Mastercard blue and white logo with shield emblem',
    status: 'valid',
    amount: '50.00 EUR',
    submittedAt: '2026-02-08T14:30:00',
    verifiedAt: '2026-02-08T14:31:00',
    notes: t('userDashboard.successVerification')
  },
  {
    id: 'TRX-2026-002',
    transactionReference: 'TRX-2026-002',
    couponType: 'Transcash',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1b4d955a7-1770642609083.png",
    brandLogoAlt: 'Transcash logo with blue and white design',
    status: 'pending',
    amount: '100.00 EUR',
    submittedAt: '2026-02-09T10:15:00',
    verifiedAt: null,
    notes: t('userDashboard.manualVerification')
  },
  {
    id: 'TRX-2026-003',
    transactionReference: 'TRX-2026-003',
    couponType: 'Paysafecard',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1223eeff7-1770642603913.png",
    brandLogoAlt: 'Paysafecard logo with green and white colors',
    status: 'invalid',
    amount: '25.00 EUR',
    submittedAt: '2026-02-07T16:45:00',
    verifiedAt: '2026-02-07T16:46:00',
    notes: t('userDashboard.invalidCode')
  },
  {
    id: 'TRX-2026-004',
    transactionReference: 'TRX-2026-004',
    couponType: 'Steam Wallet',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1238a1985-1765163830076.png",
    brandLogoAlt: 'Steam logo with dark blue background',
    status: 'valid',
    amount: '20.00 EUR',
    submittedAt: '2026-02-06T09:20:00',
    verifiedAt: '2026-02-06T09:21:00',
    notes: t('userDashboard.successVerification')
  },
  {
    id: 'TRX-2026-005',
    transactionReference: 'TRX-2026-005',
    couponType: 'Google Play',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ff1f5f54-1769080969276.png",
    brandLogoAlt: 'Google Play logo with colorful triangle icon',
    status: 'blocked',
    amount: '15.00 EUR',
    submittedAt: '2026-02-05T13:10:00',
    verifiedAt: '2026-02-05T13:12:00',
    notes: t('userDashboard.blockedSuspicious')
  },
  {
    id: 'TRX-2026-006',
    transactionReference: 'TRX-2026-006',
    couponType: 'PCS Mastercard',
    brandLogo: "https://img.rocket.new/generatedImages/rocket_gen_img_171896d90-1770642605770.png",
    brandLogoAlt: 'PCS Mastercard blue and white logo',
    status: 'valid',
    amount: '75.00 EUR',
    submittedAt: '2026-02-04T11:30:00',
    verifiedAt: '2026-02-04T11:31:00',
    notes: t('userDashboard.successVerification')
  }];


  // Calculate account statistics
  const totalVerifications = verificationHistory?.length;
  const validVerifications = verificationHistory?.filter((v) => v?.status === 'valid')?.length;
  const successRate = totalVerifications > 0 ? (validVerifications / totalVerifications * 100)?.toFixed(1) : 0;
  const recentActivity = verificationHistory?.filter((v) => {
    const submittedDate = new Date(v?.submittedAt);
    const daysDiff = (new Date() - submittedDate) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  })?.length;

  // Filter verification history
  const filteredHistory = verificationHistory?.filter((verification) => {
    const matchesSearch = !searchQuery ||
    verification?.transactionReference?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    verification?.couponType?.toLowerCase()?.includes(searchQuery?.toLowerCase());

    const matchesStatus = !statusFilter || verification?.status === statusFilter;

    const matchesCouponType = !couponTypeFilter || verification?.couponType === couponTypeFilter;

    const matchesDateRange = !dateRangeFilter || (() => {
      const submittedDate = new Date(verification?.submittedAt);
      const now = new Date();
      const daysDiff = (now - submittedDate) / (1000 * 60 * 60 * 24);

      switch (dateRangeFilter) {
        case 'today':
          return daysDiff < 1;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        case 'all':
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesCouponType && matchesDateRange;
  });

  const handleExportPDF = () => {
    // PDF export functionality would be implemented here
    alert(t('userDashboard.actions.exportPDFComingSoon'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('userDashboard.title')}</h1>
          <p className="text-gray-600">{t('userDashboard.subtitle')}</p>
        </div>

        {/* Account Summary */}
        <AccountSummary
          totalVerifications={totalVerifications}
          successRate={successRate}
          recentActivity={recentActivity} />
        

        {/* Search and Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          couponTypeFilter={couponTypeFilter}
          setCouponTypeFilter={setCouponTypeFilter}
          onExportPDF={handleExportPDF}
          resultCount={filteredHistory?.length} />
        

        {/* Verification History Table */}
        <VerificationHistoryTable verifications={filteredHistory} />
      </div>
    </div>);

};

export default UserDashboard;