import React, { useEffect, useState, useMemo } from 'react';
import CustomerHeader from '../../components/ui/CustomerHeader';
import CouponHeader from '../coupon-verification/components/CouponHeader';
import RefundForm from './components/RefundForm';
import CouponSelector from '../coupon-verification/components/CouponSelector';
import RefundResults from './components/RefundResults';
import couponService from '../../services/couponService';
import refundService from '../../services/refundService';
import { showLocalNotification } from '../../services/pushNotificationService';
import { useTranslation } from '../../context/I18nContext';

const RefundsPage = () => {
  const { t } = useTranslation();
  const [allCoupons, setAllCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundResult, setRefundResult] = useState(null);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await couponService.getAllCoupons(100, 0);
        const coupons = response?.data?.coupons || [];
        setAllCoupons(coupons.filter(c => c.is_active || c.isActive));
      } catch (err) {
        console.error('Failed to load coupons for refunds:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCoupons();
  }, []);

  const couponData = useMemo(() => selectedCoupon || null, [selectedCoupon]);

  const handleSelectCoupon = (c) => {
    setSelectedCoupon(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefundSubmit = async (form) => {
    try {
      const payload = {
        coupon_id: form.coupon_id,
        coupon_type: form.couponType,
        code: form.code,
        amount: parseFloat(form.amount),
        currency: form.currency,
        recharge_date: form.rechargeDate,
        recharge_time: form.rechargeTime,
        email: form.email,
        reason: form.reason,
        evidenceFiles: form.evidenceFiles,
        reference: `RFD-${Date.now().toString(36).toUpperCase().substr(2,8)}`
      };

      const response = await refundService.submitRefund(payload);
      
      setRefundResult({
        ...payload,
        ...response?.data,
        status: response?.data?.status || 'pending',
        reference: response?.data?.reference || payload.reference,
        submittedAt: response?.data?.submitted_at || new Date().toISOString()
      });

      showLocalNotification('Refund request received', {
        body: t('refunds.pendingMessage'),
        tag: 'refund-submitted',
        data: { reference: response?.data?.reference }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting refund:', err);
      alert(t('refunds.submissionError') || 'Failed to submit refund');
    }
  };

  const handleNewRequest = () => {
    setRefundResult(null);
    setSelectedCoupon(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <CouponHeader coupon={couponData} allCoupons={allCoupons} />

          {refundResult ? (
            <div className="max-w-4xl mx-auto">
              <RefundResults result={refundResult} onNewRequest={handleNewRequest} />
            </div>
          ) : couponData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8">
                <RefundForm
                  coupon={couponData}
                  couponType={couponData?.type || couponData?.name}
                  onSubmit={handleRefundSubmit}
                />
              </div>
              <div className="space-y-6 md:space-y-8">
                <div className="bg-card rounded-lg p-4"> 
                  <h3 className="font-semibold mb-2">{t('refunds.selectCouponDesc')}</h3>
                  <p className="text-sm text-muted-foreground">{t('refunds.helpDesc')}</p>
                </div>
              </div>
            </div>
          ) : (
            <CouponSelector coupons={allCoupons} selectedCoupon={couponData} onSelectCoupon={handleSelectCoupon} />
          )}
        </div>
      </main>
    </div>
  );
};

export default RefundsPage;
