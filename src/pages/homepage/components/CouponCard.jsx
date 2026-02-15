import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../context/I18nContext';

const CouponCard = ({ coupon, variant = 'default' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const handleVerify = () => {
    navigate(`/verification/${coupon?.slug}`);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/verification/${coupon?.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-xl shadow-md hover:shadow-xl transition-smooth overflow-hidden group h-full flex flex-col">
      <div 
        className="relative h-32 md:h-40 lg:h-48 overflow-hidden"
        style={{ backgroundColor: coupon?.themeColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <Image
          src={coupon?.coverImage}
          alt={coupon?.coverImageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          {coupon?.isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/90 backdrop-blur-sm text-white rounded-full text-xs font-medium">
              <Icon name="CheckCircle2" size={14} />
              {t('common.active')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/90 backdrop-blur-sm text-muted-foreground rounded-full text-xs font-medium">
              <Icon name="XCircle" size={14} />
              {t('common.inactive')}
            </span>
          )}
        </div>
      </div>
      <div className="p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-background rounded-lg p-2 shadow-sm">
            <Image
              src={coupon?.logo}
              alt={coupon?.logoAlt}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-foreground mb-1 line-clamp-1">
              {coupon?.name}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
              {coupon?.shortDescription}
            </p>
          </div>
        </div>

        <div className="space-y-2 md:space-y-3 mb-4 md:mb-5 flex-1">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="Coins" size={16} className="flex-shrink-0" />
            <span className="line-clamp-1">
              {t('common.currencies')}: {coupon?.supportedCurrencies?.join(', ')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="Clock" size={16} className="flex-shrink-0" />
            <span>{t('homepage.instantVerification')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Icon name="Shield" size={16} className="flex-shrink-0" />
            <span>{t('homepage.secureVerification')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-border">
          {variant === 'admin' ? (
            <Button
              variant="default"
              size="sm"
              iconName={copied ? "Check" : "Copy"}
              iconPosition="left"
              onClick={handleCopyLink}
              disabled={!coupon?.isActive}
              className="flex-1"
            >
              {copied ? t('common.copied') : t('common.copy')}
            </Button>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                iconName="Search"
                iconPosition="left"
                onClick={handleVerify}
                disabled={!coupon?.isActive}
                className="flex-1"
              >
                {t('common.verify')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Info"
                onClick={() => navigate(`/verification/${coupon?.slug}`, { state: { coupon } })}
                disabled={!coupon?.isActive}
              >
                <Icon name="Info" size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;