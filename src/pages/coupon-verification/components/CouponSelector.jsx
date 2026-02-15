import React from 'react';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const CouponSelector = ({ coupons, selectedCoupon, onSelectCoupon }) => {
  const { t } = useTranslation();
  if (!coupons || coupons.length === 0) {
    return null;
  }

  if (selectedCoupon) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
          {t('couponVerification.selectCoupon')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('couponVerification.selectCouponDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {coupons.map((coupon) => (
          <button
            key={coupon.id}
            onClick={() => onSelectCoupon(coupon)}
            className="relative group bg-background border-2 border-border hover:border-primary rounded-lg p-3 md:p-4 transition-all hover:shadow-lg text-left"
          >
            <div className="flex items-center gap-3">
              {/* Logo ou Couleur de thème */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-lg p-2 flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: coupon?.theme_color || '#3B82F6' }}
              >
                {coupon?.logo ? (
                  <Image
                    src={coupon.logo}
                    alt={coupon.logoAlt || coupon.logo_alt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon
                    name="Wallet"
                    size={24}
                    className="text-white"
                  />
                )}
              </div>

              {/* Informations du coupon */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {coupon.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-1">
                  {coupon.shortDescription || coupon.short_description}
                </p>
                {coupon.supported_currencies && coupon.supported_currencies.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {coupon.supported_currencies.slice(0, 3).map((curr) => (
                      <span
                        key={curr}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium"
                      >
                        {curr}
                      </span>
                    ))}
                    {coupon.supported_currencies.length > 3 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                        +{coupon.supported_currencies.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Icône de sélection */}
              <Icon
                name="ArrowRight"
                size={20}
                className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CouponSelector;
