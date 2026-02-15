import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  dateRangeFilter,
  setDateRangeFilter,
  couponTypeFilter,
  setCouponTypeFilter,
  onExportPDF,
  resultCount
}) => {
  const { t } = useTranslation();
  const statusOptions = [
    { value: '', label: t('userDashboard.filter.allStatuses') },
    { value: 'valid', label: t('status.valid') },
    { value: 'invalid', label: t('status.invalid') },
    { value: 'pending', label: t('status.pending') },
    { value: 'blocked', label: t('status.blocked') }
  ];

  const dateRangeOptions = [
    { value: '', label: t('userDashboard.filter.allDates') },
    { value: 'today', label: t('userDashboard.filter.today') },
    { value: 'week', label: t('userDashboard.filter.lastWeek') },
    { value: 'month', label: t('userDashboard.filter.lastMonth') },
    { value: 'all', label: t('userDashboard.filter.allHistory') }
  ];

  const couponTypeOptions = [
    { value: '', label: t('homepage.allCategories') },
    { value: 'PCS Mastercard', label: 'PCS Mastercard' },
    { value: 'Transcash', label: 'Transcash' },
    { value: 'Paysafecard', label: 'Paysafecard' },
    { value: 'Steam Wallet', label: 'Steam Wallet' },
    { value: 'Google Play', label: 'Google Play' }
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateRangeFilter('');
    setCouponTypeFilter('');
  };

  const hasActiveFilters = searchQuery || statusFilter || dateRangeFilter || couponTypeFilter;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder={t('userDashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t('common.status')}
          />
        </div>

        {/* Date Range Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={dateRangeOptions}
            value={dateRangeFilter}
            onChange={setDateRangeFilter}
            placeholder={t('userDashboard.dateRange')}
          />
        </div>

        {/* Coupon Type Filter */}
        <div className="w-full lg:w-48">
          <Select
            options={couponTypeOptions}
            value={couponTypeFilter}
            onChange={setCouponTypeFilter}
            placeholder="Type"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Icon name="Filter" size={16} />
          <span>{resultCount} result{resultCount !== 1 ? 's' : ''} found</span>
        </div>
        
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              iconName="X"
              iconSize={16}
            >
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            iconName="Download"
            iconSize={16}
          >
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;