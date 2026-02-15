import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '../../../context/I18nContext';

const VerificationChart = ({ data, title }) => {
  const { t } = useTranslation();
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{payload?.[0]?.payload?.date}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry?.color }} />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <h3 className="font-heading font-semibold text-foreground mb-4 md:mb-6">{title}</h3>
      <div className="w-full h-64 md:h-80" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="circle"
            />
            <Bar dataKey="valid" fill="var(--color-success)" name={t('adminDashboard.chartLegendValid')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="invalid" fill="var(--color-error)" name={t('adminDashboard.chartLegendInvalid')} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="var(--color-warning)" name={t('adminDashboard.chartLegendPending')} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VerificationChart;