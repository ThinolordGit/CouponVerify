import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useTranslation } from '../../../context/I18nContext';

const RefundResults = ({ result, onNewRequest }) => {
  const { t } = useTranslation();

  const formatDate = (s) => s ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(s)) : '-';

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-4">
          <Icon name="DollarSign" size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">{t('refunds.title')}</h2>
        <p className="text-sm md:text-base text-muted-foreground">{t('refunds.pendingMessage')}</p>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">{t('common.reference')}: <span className="font-mono">{result?.reference}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6">
        <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">{t('couponVerification.couponType')}</div>
          <div className="font-semibold text-foreground mt-1">{result?.coupon_type}</div>
        </div>
        <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">{t('couponVerification.amount')}</div>
          <div className="font-semibold text-foreground mt-1">{parseFloat(result?.amount || 0).toFixed(2)} {result?.currency}</div>
        </div>
      </div>

      <div className="p-4 md:p-5 bg-primary/5 border border-primary/20 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{t('refunds.nextStepsTitle')}</h4>
            <p className="text-xs md:text-sm text-muted-foreground">{t('refunds.nextStepsDesc')}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 md:gap-4">
        <Button variant="default" size="lg" onClick={onNewRequest}>{t('refunds.newRequest')}</Button>
        <Button variant="outline" size="lg" onClick={() => window.location.href = '/homepage'}>{t('couponVerification.backToHome')}</Button>
      </div>
    </div>
  );
};

export default RefundResults;
