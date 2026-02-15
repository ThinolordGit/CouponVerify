import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from '../../../context/I18nContext';

const CouponTypeDistribution = ({ data, title }) => {
  const { t } = useTranslation();
  const COLORS = [
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-error)',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload?.[0]?.name}</p>
          <p className="text-sm text-muted-foreground">
            {payload?.[0]?.value} {t('adminDashboard.verificationsCount')} ({payload?.[0]?.payload?.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 md:p-6">
      <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3 sm:mb-4 md:mb-6">{title}</h3>
      <div className="w-full h-48 sm:h-64 md:h-80" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={window.innerWidth < 640 ? 50 : 80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name} ${percentage}%`}
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CouponTypeDistribution;