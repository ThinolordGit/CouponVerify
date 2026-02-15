import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import VerificationStatusIndicator from '../../../components/ui/VerificationStatusIndicator';
import { useTranslation } from '../../../context/I18nContext';

const VerificationResults = ({ result, onNewVerification }) => {
  const { t } = useTranslation();
  const statusMessages = {
    approved: t('couponVerification.successMessage'),
    valid: t('couponVerification.successMessage'),
    rejected: t('couponVerification.rejectedMessage'),
    invalid: t('couponVerification.rejectedMessage'),
    pending: t('couponVerification.pendingMessage'),
    blocked: t('couponVerification.blockedMessage'),
    duplicate: t('couponVerification.duplicateMessage')
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeStyle: 'short'
    })?.format(date);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-4">
          <Icon name="ShieldCheck" size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
          {t('couponVerification.verificationResult')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('common.reference')}: <span className="font-data font-semibold text-foreground">{result?.reference}</span>
        </p>
      </div>
      <div className="flex justify-center mb-6 md:mb-8">
        <VerificationStatusIndicator
          status={result?.status}
          message={statusMessages?.[result?.status]}
          timestamp={result?.submittedAt}
        />
      </div>
      <div className="space-y-4 md:space-y-5 mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Ticket" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.couponType')}</span>
            </div>
            <p className="text-base md:text-lg font-semibold text-foreground">{result?.couponType}</p>
          </div>

          <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Coins" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.amount')}</span>
            </div>
            <p className="text-base md:text-lg font-semibold text-foreground">
              {formatCurrency(result?.amount, result?.currency)}
            </p>
          </div>

          <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Calendar" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.rechargeDate')}</span>
            </div>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })?.format(new Date(result.rechargeDate))}
            </p>
          </div>

          <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Clock" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.rechargeTime')}</span>
            </div>
            <p className="text-sm md:text-base font-semibold text-foreground">{result?.rechargeTime}</p>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Mail" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.notificationEmail')}</span>
          </div>
          <p className="text-sm md:text-base font-semibold text-foreground">{result?.email}</p>
        </div>

        <div className="p-4 md:p-5 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CalendarClock" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">{t('couponVerification.verificationDate')}</span>
          </div>
          <p className="text-sm md:text-base font-semibold text-foreground">
            {formatDate(result?.submittedAt)}
          </p>
        </div>
      </div>
      <div className="p-4 md:p-5 bg-primary/5 border border-primary/20 rounded-lg mb-6 md:mb-8">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">
              {t('couponVerification.nextSteps')}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('couponVerification.nextStepsDesc')}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button
          variant="default"
          size="lg"
          fullWidth
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onNewVerification}
        >
          {t('couponVerification.newVerificationBtn')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          iconName="Home"
          iconPosition="left"
          onClick={() => window.location.href = '/homepage'}
        >
          {t('couponVerification.backToHome')}
        </Button>
      </div>
    </div>
  );
};

export default VerificationResults;