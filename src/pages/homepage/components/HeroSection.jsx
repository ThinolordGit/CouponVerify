import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/I18nContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 md:mb-6">
              <Icon name="ShieldCheck" size={20} className="text-primary" />
              <span className="text-sm md:text-base font-medium text-primary">
                {t('common.appName')}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6 leading-tight">
              {t('homepage.title')}
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('homepage.heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="default"
                size="lg"
                iconName="Search"
                iconPosition="left"
                onClick={() => navigate('/coupon-verification')}
                className="w-full sm:w-auto"
              >
                {t('homepage.startVerifying')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                iconName="Info"
                iconPosition="left"
                className="w-full sm:w-auto"
              >
                {t('homepage.learnMore')}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 pt-8 border-t border-border">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-primary mb-1">
                  15K+
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {t('couponVerification.title')}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-success mb-1">
                  98%
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {t('homepage.successRate')}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-accent mb-1">
                  24/7
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {t('common.support')}
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-card rounded-3xl shadow-xl p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center hover-lift transition-smooth">
                    <Icon name="CreditCard" size={48} className="text-primary mb-3" />
                    <span className="text-sm font-medium text-foreground">PCS Mastercard</span>
                  </div>
                  <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 flex flex-col items-center justify-center hover-lift transition-smooth">
                    <Icon name="Wallet" size={48} className="text-success mb-3" />
                    <span className="text-sm font-medium text-foreground">Paysafecard</span>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 flex flex-col items-center justify-center hover-lift transition-smooth">
                    <Icon name="Smartphone" size={48} className="text-accent mb-3" />
                    <span className="text-sm font-medium text-foreground">Google Play</span>
                  </div>
                  <div className="bg-gradient-to-br from-error/10 to-error/5 rounded-2xl p-6 flex flex-col items-center justify-center hover-lift transition-smooth">
                    <Icon name="Apple" size={48} className="text-error mb-3" />
                    <span className="text-sm font-medium text-foreground">Apple Card</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;