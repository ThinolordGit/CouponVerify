import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import verificationService from '../../services/verificationService';
import CustomerHeader from '../../components/ui/CustomerHeader';
import CouponHeader from './components/CouponHeader';
import VerificationForm from './components/VerificationForm';
import CouponSelector from './components/CouponSelector';
import InstructionsSection from './components/InstructionsSection';
import FAQSection from './components/FAQSection';
import VerificationResults from './components/VerificationResults';
import couponService from 'services/couponService';
import settingsService from '../../services/settingsService';
import { showLocalNotification } from '../../services/pushNotificationService';
import { useTranslation } from '../../context/I18nContext';
import { useAppSettings } from 'context/AppContext';
import SubmissionPendingNotice from '../../components/ui/SubmissionPendingNotice';

const CouponVerification = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const location = useLocation();
  const { isFeatureEnabled } = useAppSettings();
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [allCoupons, setAllCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Charger tous les coupons actifs au montage
  useEffect(() => {
    const load = async () => {
      try {
        const response = await couponService.getAllCoupons(100, 0);
        const coupons = response?.data?.coupons || [];
        
        // Filtrer les coupons actifs
        const activeCoupons = coupons.filter(c => c.is_active || c.isActive);
        setAllCoupons(activeCoupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Charger et appliquer les SEO du coupon
  useEffect(() => {
    if (slug) {
      const loadCouponSeo = async () => {
        try {
          // Charger les SEO du site
          const siteSeo = await settingsService.getSeoSettings();
          
          // Charger les SEO du coupon
          const couponSeo = await settingsService.getCouponSeo(slug);
          
          // Fusionner: SEO du coupon override celui du site
          const mergedSeo = {
            title: couponSeo.title || siteSeo?.seo_title_prefix || 'CouponVerify',
            description: couponSeo.description || siteSeo?.site_description || '',
            keywords: couponSeo.keywords || siteSeo?.site_keywords || '',
            ogImage: couponSeo.ogImage || siteSeo?.og_image_url || '',
            customHead: couponSeo.customHead || siteSeo?.custom_head_html || ''
          };
          
          // Appliquer les SEO
          document.title = mergedSeo.title;
          
          // Mettre à jour la meta description
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = mergedSeo.description;
          
          // Mettre à jour les keywords
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = mergedSeo.keywords;
          
          // Ajouter le custom HTML si présent
          if (mergedSeo.customHead) {
            const container = document.createElement('div');
            container.innerHTML = mergedSeo.customHead;
            document.head.appendChild(container);
          }
        } catch (error) {
          console.error('Error loading coupon SEO:', error);
        }
      };
      
      loadCouponSeo();
    }
  }, [slug]);

  // Récupérer les données du coupon soit du state navigué, soit du slug
  const couponData = useMemo(() => {
    if (selectedCoupon) {
      return selectedCoupon;
    }

    if (location.state?.coupon) {
      return location.state.coupon;
    }

    if (slug && allCoupons.length > 0) {
      const foundCoupon = allCoupons.find(c => c.slug === slug);
      if (foundCoupon) {
        return foundCoupon;
      }
    }
    
    return null;
  }, [selectedCoupon, location.state?.coupon, slug, allCoupons]);

  const instructions = [
  {
    title: t('couponVerification.instruction1Title'),
    description: t('couponVerification.instruction1Desc')
  },
  {
    title: t('couponVerification.instruction2Title'),
    description: t('couponVerification.instruction2Desc')
  },
  {
    title: t('couponVerification.instruction3Title'),
    description: t('couponVerification.instruction3Desc')
  },
  {
    title: t('couponVerification.instruction4Title'),
    description: t('couponVerification.instruction4Desc')
  }];


  const faqs = [
  {
    question: t('couponVerification.faq1Question'),
    answer: t('couponVerification.faq1Answer')
  },
  {
    question: t('couponVerification.faq2Question'),
    answer: t('couponVerification.faq2Answer')
  },
  {
    question: t('couponVerification.faq3Question'),
    answer: t('couponVerification.faq3Answer')
  },
  {
    question: t('couponVerification.faq4Question'),
    answer: t('couponVerification.faq4Answer')
  },
  {
    question: t('couponVerification.faq5Question'),
    answer: t('couponVerification.faq5Answer')
  },
  {
    question: t('couponVerification.faq6Question'),
    answer: t('couponVerification.faq6Answer')
  }];


  const handleVerificationSubmit = async (formData) => {
    try {
      // Préparer les données pour l'API
      const verificationData = {
        coupon_id: couponData?.id,
        coupon_type: formData?.couponType,
        code: formData?.code,
        amount: parseFloat(formData?.amount),
        currency: formData?.currency,
        recharge_date: formData?.rechargeDate,
        recharge_time: formData?.rechargeTime,
        email: formData?.email
      };

      // Soumettre la vérification
      const response = await verificationService.submitVerification(verificationData);

      // La réponse du serveur contient les vraies données incluant le statut
      setVerificationResult({
        ...formData,
        ...response?.data, // Inclure les données réelles du serveur (status, reference, etc.)
        status: response?.data?.status || 'pending', // Utiliser le statut réel de la BD
        reference: response?.data?.reference || formData?.reference,
        submittedAt: response?.data?.submitted_at || formData?.submittedAt
      });
      
      if (isFeatureEnabled("enable_launching_push")) {
        // Envoyer une notification locale au client
        showLocalNotification('Your request has been received!', {
          body: 'We have received your information. You will be informed as soon as possible.',
          tag: 'verification-submitted',
          image: couponData?.logo || couponData?.cover_image || '/logo.png',
          requireInteraction: false,
          data: {
            url: window.location.href,
            verificationId: response?.data?.id
          }
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting verification:', error);
      // En cas d'erreur, afficher un message d'erreur
      alert(t('couponVerification.submissionError'));
    }
  };

  const handleNewVerification = () => {
    setVerificationResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <CouponHeader coupon={couponData} allCoupons={allCoupons} />

          {verificationResult ? (
            isFeatureEnabled('enable_submit_resume') ? (
              <div className="max-w-4xl mx-auto">
                <VerificationResults
                  result={verificationResult}
                  onNewVerification={handleNewVerification}
                />
              </div>
            ) : (
              <SubmissionPendingNotice
                reference={verificationResult?.reference}
                email={verificationResult?.email}
                onNew={handleNewVerification}
                newLabelKey="couponVerification.newVerificationBtn"
              />
            )
          ) : couponData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6 md:space-y-8">
                <VerificationForm
                  coupon={couponData}
                  couponType={couponData?.type || couponData?.name}
                  onSubmit={handleVerificationSubmit}
                />
              </div>

              <div className="space-y-6 md:space-y-8">
                <InstructionsSection instructions={instructions} />
                <FAQSection faqs={faqs} />
              </div>
            </div>
          ) : (
            <CouponSelector
              coupons={allCoupons}
              selectedCoupon={couponData}
              onSelectCoupon={handleSelectCoupon}
            />
          )}
        </div>
      </main>
      <footer className="bg-card border-t border-border mt-12 md:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center text-sm md:text-base text-muted-foreground">
            <p>&copy; {new Date()?.getFullYear()} CouponVerify. {t('common.allRightsReserved')}.</p>
            <p className="mt-2">
              {t('homepage.secureServiceDesc')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CouponVerification;