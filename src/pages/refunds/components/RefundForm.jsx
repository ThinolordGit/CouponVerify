import React, { useState, useRef, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useTranslation } from '../../../context/I18nContext';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

const RefundForm = ({ coupon, couponType, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    currency: coupon?.supported_currencies?.[0] || 'EUR',
    rechargeDate: '',
    rechargeTime: '',
    email: '',
    reason: ''
  });
  // show code by default (matches verification form — unmasked initially)
  const [showCode, setShowCode] = useState(true);

  // evidenceFiles stores objects: { file, name, size, type, preview }
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencyOptions = (coupon?.supported_currencies && Array.isArray(coupon.supported_currencies) && coupon.supported_currencies.length > 0)
    ? coupon.supported_currencies.map(c => ({ value: c, label: c }))
    : [
        { value: 'EUR', label: t('couponVerification.eurCurrency') },
        { value: 'USD', label: t('couponVerification.usdCurrency') },
        { value: 'GBP', label: t('couponVerification.gbpCurrency') }
      ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFiles = (files) => {
    const arr = Array.from(files || []);
    const created = [];

    arr.forEach(f => {
      if (!f) return;
      if (f.size > MAX_FILE_BYTES) return; // skip too large

      // avoid duplicates by name+size
      const exists = evidenceFiles.some(e => e.name === f.name && e.size === f.size);
      if (exists) return;

      const preview = f.type && f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
      created.push({ file: f, name: f.name, size: f.size, type: f.type, preview });
    });

    if (created.length === 0) return;

    setEvidenceFiles(prev => {
      const merged = [...prev, ...created].slice(0, 5); // keep max 5
      return merged;
    });
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => {
      const toRemove = prev[index];
      if (toRemove && toRemove.preview) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      evidenceFiles.forEach(e => e.preview && URL.revokeObjectURL(e.preview));
    };
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.code?.trim()) newErrors.code = t('couponVerification.codeRequired');
    if (!formData.amount) newErrors.amount = t('couponVerification.amountRequired');
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = t('couponVerification.amountPositive');
    if (!formData.email?.trim()) newErrors.email = t('refunds.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('refunds.emailInvalid');
    if (!formData.currency) newErrors.currency = t('couponVerification.currencyRequired');
    // reason optional but limit length
    if (formData.reason && formData.reason.length > 1000) newErrors.reason = t('validationMessages.maxLength').replace('{max}', '1000');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // send raw File objects to parent handler
      await onSubmit({
        ...formData,
        couponType,
        coupon_id: coupon?.id,
        evidenceFiles: evidenceFiles.map(e => e.file)
      });
    } catch (err) {
      console.error('Refund submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 lg:p-8 shadow-lg">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground mb-2">
          {t('refunds.formTitle')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">{t('refunds.formSubtitle')}</p>
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="relative">
          <Input
            label={t('couponVerification.code')}
            type={showCode ? 'text' : 'password'}
            placeholder={t('couponVerification.codePlaceholder')}
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
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
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors?.amount}
            required
            min="0"
            step="0.01"
          />

          <Select
            label={t('couponVerification.currency')}
            options={currencyOptions}
            value={formData.currency}
            onChange={(value) => handleChange('currency', value)}
            error={errors?.currency}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input
            label={t('couponVerification.rechargeDate')}
            type="text"
            placeholder={t('couponVerification.rechargeDate') + ' (optional)'}
            value={formData.rechargeDate}
            onChange={(e) => handleChange('rechargeDate', e.target.value)}
            error={errors?.rechargeDate}
          />

          <Input
            label={t('couponVerification.rechargeTime')}
            type="text"
            placeholder={t('couponVerification.rechargeTime') + ' (optional)'}
            value={formData.rechargeTime}
            onChange={(e) => handleChange('rechargeTime', e.target.value)}
            error={errors?.rechargeTime}
          />
        </div>

        <Input
          label={t('couponVerification.email')}
          type="email"
          placeholder={t('couponVerification.emailPlaceholder')}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors?.email}
          required
        />

        <div>
          <label className="text-sm md:text-sm text-muted-foreground block mb-2">{t('refunds.reasonLabel')}</label>
          <textarea
            rows={4}
            placeholder={t('refunds.reasonPlaceholder')}
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors?.reason && <p className="text-xs text-red-600 mt-1">{errors.reason}</p>}
        </div>

        <div>
          <label className="text-sm md:text-sm text-muted-foreground block mb-2">{t('refunds.attachEvidence')}</label>

          {/* Hidden native input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {/* Dropzone / Clickable area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className="border-dashed border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-300 transition"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center">
                <Icon name="UploadCloud" size={18} />
              </div>
              <div className="text-left">
                <div className="font-medium">{t('refunds.dragDrop') || 'Drag & drop files here or click to select'}</div>
                <div className="text-xs text-muted-foreground">{t('refunds.evidenceHint')}</div>
              </div>
            </div>
          </div>

          {/* Previews */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {evidenceFiles.map((fObj, idx) => (
              <div key={idx} className="relative bg-white shadow-sm border rounded overflow-hidden">
                {fObj.preview ? (
                  <img src={fObj.preview} alt={fObj.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-muted/10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Icon name="File" size={24} />
                      <span className="text-xs">{(fObj.name || '').split('.').pop()?.toUpperCase()}</span>
                    </div>
                  </div>
                )}

                <div className="p-2">
                  <div className="text-xs font-mono truncate">{fObj.name}</div>
                  <div className="text-xxs text-muted-foreground">{formatBytes(fObj.size)}</div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                  title={t('common.remove')}
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 md:pt-4">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconName="DollarSign"
            iconPosition="left"
          >
            {isSubmitting ? t('refunds.submitting') : t('refunds.submitRefund')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default RefundForm;
