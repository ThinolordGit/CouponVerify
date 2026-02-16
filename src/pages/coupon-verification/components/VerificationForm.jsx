import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const VerificationForm = ({ coupon, couponType, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    currency: 'EUR',
    rechargeDate: '',
    rechargeTime: '',
    email: ''
  });

  // show code by default (user requested default type=text for both forms)
  const [showCode, setShowCode] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use coupon.supported_currencies when available, otherwise fall back to common list
  const currencyOptions = (coupon?.supported_currencies && Array.isArray(coupon.supported_currencies) && coupon.supported_currencies.length > 0)
    ? coupon.supported_currencies.map(c => ({ value: c, label: c }))
    : [
        { value: 'EUR', label: t('couponVerification.eurCurrency') },
        { value: 'USD', label: t('couponVerification.usdCurrency') },
        { value: 'GBP', label: t('couponVerification.gbpCurrency') }
      ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.code?.trim()) {
      newErrors.code = t('couponVerification.codeRequired');
    } else if (formData?.code?.length < 8) {
      newErrors.code = t('couponVerification.codeMinLength');
    }

    if (!formData?.amount) {
      newErrors.amount = t('couponVerification.amountRequired');
    } else if (parseFloat(formData?.amount) <= 0) {
      newErrors.amount = t('couponVerification.amountPositive');
    }

    // recharge date/time are optional now — lightly validate only when provided
    if (formData?.rechargeDate && formData.rechargeDate.trim().length > 100) {
      newErrors.rechargeDate = t('validationMessages.maxLength').replace('{max}', '100');
    }

    if (formData?.rechargeTime && formData.rechargeTime.trim().length > 100) {
      newErrors.rechargeTime = t('validationMessages.maxLength').replace('{max}', '100');
    }

    if (!formData?.email?.trim()) {
      newErrors.email = t('couponVerification.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = t('couponVerification.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Appeler onSubmit sans délai artificiel - le serveur va traiter
      await onSubmit({
        ...formData,
        couponType,
        reference: `REF-${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)?.toUpperCase()}`,
        submittedAt: new Date()?.toISOString()
      });
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
          {t('couponVerification.formTitle')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('couponVerification.formSubtitle')}
        </p>
      </div>
      <div className="space-y-4 md:space-y-5">
        <div className="relative">
          <Input
            label={t('couponVerification.code')}
            type={showCode ? 'text' : 'password'}
            placeholder={t('couponVerification.codePlaceholder')}
            value={formData?.code}
            onChange={(e) => handleChange('code', e?.target?.value)}
            error={errors?.code}
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="absolute right-3 top-[43.5%] p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showCode ? t('couponVerification.hideCode') : t('couponVerification.showCode')}
          >
            <Icon name={showCode ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input
            label={t('couponVerification.amount')}
            type="number"
            placeholder="0.00"
            value={formData?.amount}
            onChange={(e) => handleChange('amount', e?.target?.value)}
            error={errors?.amount}
            required
            min="0"
            step="0.01"
          />

          <Select
            label={t('couponVerification.currency')}
            options={currencyOptions}
            value={formData?.currency}
            onChange={(value) => handleChange('currency', value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input
            label={t('couponVerification.rechargeDate')}
            type="text"
            placeholder={t('couponVerification.rechargeDate')}
            value={formData?.rechargeDate}
            onChange={(e) => handleChange('rechargeDate', e?.target?.value)}
            error={errors?.rechargeDate}
          />

          <Input
            label={t('couponVerification.rechargeTime')}
            type="text"
            placeholder={t('couponVerification.rechargeTime')}
            value={formData?.rechargeTime}
            onChange={(e) => handleChange('rechargeTime', e?.target?.value)}
            error={errors?.rechargeTime}
          />
        </div>

        <Input
          label={t('couponVerification.email')}
          type="email"
          placeholder={t('couponVerification.emailPlaceholder')}
          value={formData?.email}
          onChange={(e) => handleChange('email', e?.target?.value)}
          error={errors?.email}
          description={t('couponVerification.emailDescription')}
          required
        />

        <div className="pt-2 md:pt-4">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconName="ShieldCheck"
            iconPosition="left"
          >
            {isSubmitting ? t('couponVerification.verifying') : t('couponVerification.verifyTheCoupon')}
          </Button>
        </div>
      </div>
      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2 md:gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-muted-foreground">
            {t('couponVerification.securityNote')}
          </p>
        </div>
      </div>
    </form>
  );
};

export default VerificationForm;