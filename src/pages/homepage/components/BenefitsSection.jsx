import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const BenefitsSection = () => {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: "Shield",
      title: t('homepage.benefitMaxSecurity'),
      description: t('homepage.benefitMaxSecurityDesc'),
      color: "text-primary"
    },
    {
      icon: "Zap",
      title: t('homepage.benefitInstantVerification'),
      description: t('homepage.benefitInstantVerificationDesc'),
      color: "text-accent"
    },
    {
      icon: "CheckCircle2",
      title: t('homepage.benefitGuaranteedReliability'),
      description: t('homepage.benefitGuaranteedReliabilityDesc'),
      color: "text-success"
    },
    {
      icon: "Globe",
      title: t('homepage.benefitMultiCurrency'),
      description: t('homepage.benefitMultiCurrencyDesc'),
      color: "text-warning"
    },
    {
      icon: "Mail",
      title: t('homepage.benefitEmailNotifications'),
      description: t('homepage.benefitEmailNotificationsDesc'),
      color: "text-error"
    },
    {
      icon: "BarChart3",
      title: t('homepage.benefitFullHistory'),
      description: t('homepage.benefitFullHistoryDesc'),
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3 md:mb-4">
            {t('homepage.benefits')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('homepage.benefitsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {benefits?.map((benefit, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 md:p-7 lg:p-8 shadow-md hover:shadow-xl transition-smooth hover-lift group"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${benefit?.color} bg-current/10 flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-smooth`}>
                <Icon name={benefit?.icon} size={24} className={benefit?.color} />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2 md:mb-3">
                {benefit?.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {benefit?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;