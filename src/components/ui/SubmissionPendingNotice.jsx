import React from 'react';
import Icon from '../../components/AppIcon';
import Button from './Button';
import { useTranslation } from '../../context/I18nContext';

const SubmissionPendingNotice = ({ reference, email, onNew, newLabelKey }) => {
  const { t, tReplace } = useTranslation();
  const newLabel = newLabelKey ? t(newLabelKey) : t('common.submit');

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4">
        <Icon name="Clock" size={36} className="text-primary" />
      </div>

      <h3 className="text-xl md:text-2xl font-semibold mb-2">{t('submissionNotice.title')}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {email ? tReplace('submissionNotice.description', { email }) : t('submissionNotice.description')}
      </p>

      {reference && (
        <p className="text-xs text-muted-foreground mb-4">{t('common.reference')}: <span className="font-mono">{reference}</span></p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="default" size="lg" onClick={onNew}>{newLabel}</Button>
        <Button variant="outline" size="lg" onClick={() => (window.location.href = '/homepage')}>{t('couponVerification.backToHome')}</Button>
      </div>
    </div>
  );
};

export default SubmissionPendingNotice;