import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const CouponHeader = ({ coupon, allCoupons }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carrousel automatique
  useEffect(() => {
    if (!coupon && allCoupons && allCoupons.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allCoupons.length);
      }, 4000); // Change de coupon toutes les 4 secondes
      return () => clearInterval(interval);
    }
  }, [coupon, allCoupons]);

  const displayCoupon = coupon || (allCoupons?.[currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (allCoupons?.length || 1)) % (allCoupons?.length || 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (allCoupons?.length || 1));
  };

  if (!displayCoupon) {
    return null;
  }

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-xl mb-6 lg:mb-8 group">
      <Image
        src={displayCoupon?.cover_image}
        alt={displayCoupon?.cover_image_alt}
        className="w-full h-full object-cover transition-opacity duration-500"
        onError={(e) => {
          e.target.style.backgroundColor = displayCoupon?.theme_color || '#3B82F6';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
          <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white rounded-lg md:rounded-xl p-2 md:p-3 flex items-center justify-center flex-shrink-0">
            <Image
              src={displayCoupon?.logo}
              alt={displayCoupon?.logo_alt}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white">
              {displayCoupon?.name}
            </h1>
            <p className="text-sm md:text-base text-white/90 mt-1">
              {t('couponVerification.title')}
            </p>
          </div>
        </div>
      </div>

      {/* Carrousel controls - visibles seulement quand pas de coupon spécifique */}
      {!coupon && allCoupons && allCoupons.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label={t('couponVerification.previousCoupon')}
          >
            <Icon name="ChevronLeft" size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label={t('couponVerification.nextCoupon')}
          >
            <Icon name="ChevronRight" size={20} />
          </button>

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allCoupons.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`${t('couponVerification.goToCoupon')} ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CouponHeader;