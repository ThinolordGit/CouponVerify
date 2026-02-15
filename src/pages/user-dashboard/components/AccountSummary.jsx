import React from 'react';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const AccountSummary = ({ totalVerifications, successRate, recentActivity }) => {
  const { t } = useTranslation();
  const summaryCards = [
    {
      title: t('adminDashboard.totalVerifications'),
      value: totalVerifications,
      icon: 'FileCheck',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: t('homepage.successRate'),
      value: `${successRate}%`,
      icon: 'TrendingUp',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600'
    },
    {
      title: t('adminDashboard.recentActivity'),
      value: recentActivity,
      icon: 'Activity',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryCards?.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card?.title}</p>
              <p className={`text-3xl font-bold ${card?.textColor}`}>{card?.value}</p>
            </div>
            <div className={`${card?.iconBg} rounded-lg p-3 shadow-lg`}>
              <Icon name={card?.icon} size={24} color="#FFFFFF" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountSummary;