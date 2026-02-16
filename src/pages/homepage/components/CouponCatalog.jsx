import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import CouponCard from './CouponCard';
import { useTranslation } from '../../../context/I18nContext';

const CouponCatalog = ({ coupons, categories = [], variant = 'default', isCollapsed=false }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const defaultCategories = [
    { value: 'all', label: t('homepage.allCategories') },
  ];
  
  const categoryOptions = [
    ...defaultCategories,
    ...(categories?.length ? categories : [
      { value: 'prepaid', label: t('homepage.prepaidCards') },
      { value: 'gaming', label: t('homepage.gaming') },
      { value: 'mobile', label: t('homepage.mobileApps') },
      { value: 'retail', label: t('homepage.retail') }
    ])
  ];

  const sortOptions = [
    { value: 'name', label: t('homepage.sortName') },
    { value: 'popular', label: t('homepage.sortPopular') },
    { value: 'recent', label: t('homepage.sortRecent') }
  ];

  const filteredCoupons = coupons?.filter(coupon => {
      const matchesSearch = coupon?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                          coupon?.shortDescription?.toLowerCase()?.includes(searchQuery?.toLowerCase());
      
      // Normalize category values for comparison
      const couponCategoryId = String(coupon?.category || '').trim();
      const selectedCategoryId = String(selectedCategory || '').trim();
      const matchesCategory = selectedCategoryId === 'all' || couponCategoryId === selectedCategoryId;
      
      return matchesSearch && matchesCategory;
    })?.sort((a, b) => {
      if (sortBy === 'name') return a?.name?.localeCompare(b?.name);
      if (sortBy === 'popular') return b?.verificationCount - a?.verificationCount;
      if (sortBy === 'recent') return new Date(b.addedDate) - new Date(a.addedDate);
      return 0;
    });

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background" id="coupons">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3 md:mb-4">
            {t('homepage.supportedCoupons')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('homepage.supportedCouponsDesc')}
          </p>
        </div>
        
        <div className="bg-card rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid gap-4">
            <div className="md:col-span-1">
              <Input
                type="search"
                placeholder={t('homepage.searchCoupon')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Select
                placeholder={t('homepage.category')}
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
            <div className="md:col-span-1">
              <Select
                placeholder={t('homepage.sortBy')}
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <Icon name="Info" size={16} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs md:text-sm text-muted-foreground">
              {filteredCoupons?.length} coupon{filteredCoupons?.length > 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        {filteredCoupons?.length > 0 ? (
          <div className={`grid grid-cols-1 ${isCollapsed ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'} gap-4 md:gap-6`}>
            {filteredCoupons?.map((coupon) => (
              <CouponCard key={coupon?.id} coupon={coupon} variant={variant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <Icon name="SearchX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2">
              {t('homepage.noCouponsFound')}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('homepage.tryCriteria')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CouponCatalog;