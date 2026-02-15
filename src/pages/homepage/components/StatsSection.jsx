import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const StatsSection = () => {
  const { t } = useTranslation();
  const stats = [
    {
      icon: "Users",
      value: "15,247",
      label: t('homepage.activeUsers'),
      trend: "+12%",
      trendUp: true
    },
    {
      icon: "CheckCircle2",
      value: "98.4%",
      label: t('homepage.successRate'),
      trend: "+2.1%",
      trendUp: true
    },
    {
      icon: "Clock",
      value: "< 3s",
      label: t('homepage.avgTime'),
      trend: "-0.5s",
      trendUp: true
    },
    {
      icon: "Globe",
      value: "45+",
      label: t('homepage.supportedCountries'),
      trend: "+5",
      trendUp: true
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3 md:mb-4">
            {t('homepage.statsTitle')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('homepage.statsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats?.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 md:p-7 lg:p-8 shadow-md hover:shadow-xl transition-smooth text-center group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 md:mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Icon name={stat?.icon} size={24} className="text-primary" />
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-2">
                {stat?.value}
              </div>
              <div className="text-sm md:text-base text-muted-foreground mb-3">
                {stat?.label}
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${stat?.trendUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                <Icon name={stat?.trendUp ? "TrendingUp" : "TrendingDown"} size={14} />
                {stat?.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;