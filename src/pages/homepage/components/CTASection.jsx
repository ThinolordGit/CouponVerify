import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../context/I18nContext';

const CTASection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 md:mb-6">
          <Icon name="Sparkles" size={20} className="text-white" />
          <span className="text-sm md:text-base font-medium text-white">
            {t('homepage.startNow')}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white mb-4 md:mb-6">
          {t('homepage.ctaTitle')}
        </h2>

        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto">
          {t('homepage.ctaDescription')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="lg"
            iconName="Search"
            iconPosition="left"
            onClick={() => navigate('/coupon-verification')}
            className="w-full sm:w-auto bg-white text-primary hover:bg-white/90"
          >{t('homepage.startVerifying')}</Button>
          <Button
            variant="outline"
            size="lg"
            iconName="HelpCircle"
            iconPosition="left"
            className="w-full sm:w-auto border-white text-white hover:bg-white/10"
          >
            {t('homepage.needHelp')}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <Icon name="Shield" size={32} className="text-white/80 mx-auto mb-2" />
            <div className="text-xs md:text-sm text-white/90">{t('homepage.secure100')}</div>
          </div>
          <div className="text-center">
            <Icon name="Zap" size={32} className="text-white/80 mx-auto mb-2" />
            <div className="text-xs md:text-sm text-white/90">{t('homepage.instant')}</div>
          </div>
          <div className="text-center">
            <Icon name="Clock" size={32} className="text-white/80 mx-auto mb-2" />
            <div className="text-xs md:text-sm text-white/90">{t('homepage.available247')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;