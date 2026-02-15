import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const StatCard = ({ title, value, change, changeType, icon, iconBg, trend }) => {
  const { t } = useTranslation();
  const trendData = trend || [];
  const maxValue = Math.max(...trendData, 1);

  return (
    <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 border border-border hover-lift transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground">{value}</h3>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon name={icon} size={20} className="sm:w-6 sm:h-6" color="#FFFFFF" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 sm:gap-2 mb-3">
          <Icon 
            name={changeType === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
            size={14} 
            className="sm:w-4 sm:h-4"
            color={changeType === 'increase' ? 'var(--color-success)' : 'var(--color-error)'} 
          />
          <span className={`text-xs sm:text-sm font-medium ${changeType === 'increase' ? 'text-success' : 'text-error'}`}>
            {change}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">vs hier</span>
        </div>
      )}
      {trendData?.length > 0 && (
        <div className="flex items-end gap-0.5 sm:gap-1 h-10 sm:h-12">
          {trendData?.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-primary/20 rounded-sm transition-all hover:bg-primary/30"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;