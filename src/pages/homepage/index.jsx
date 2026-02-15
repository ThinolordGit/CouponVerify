import React from 'react';
import CustomerHeader from '../../components/ui/CustomerHeader';
import HeroSection from './components/HeroSection';
import CouponCatalog from './components/CouponCatalog';
import BenefitsSection from './components/BenefitsSection';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';
import FooterSection from './components/FooterSection';
import { useTranslation } from '../../context/I18nContext';

const Homepage = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Map backend coupon fields to component-friendly props
  const transformCoupon = (c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    shortDescription: c.short_description || c.shortDescription || '',
    logo: c.logo || c.logo_url || '',
    logoAlt: c.logo_alt || c.logoAlt || '',
    coverImage: c.cover_image || c.coverImage || c.coverImageUrl || '',
    coverImageAlt: c.cover_image_alt || c.coverImageAlt || '',
    themeColor: c.theme_color || c.themeColor || c.themeColorHex || '#3B82F6',
    supportedCurrencies: c.supported_currencies || c.supportedCurrencies || [],
    category: c.category || c.category_id || '',
    isActive: c.is_active !== undefined ? !!c.is_active : (c.isActive !== undefined ? !!c.isActive : true),
    verificationCount: c.verification_count || c.verificationCount || 0,
    addedDate: c.added_date || c.addedDate || c.created_at || ''
  });

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catsRes, couponsRes] = await Promise.all([
          (await import('../../services/categoryService')).default.getAllCategories(),
          (await import('../../services/couponService')).default.getAllCoupons(50, 0)
        ]);

        const cats = catsRes.data?.categories || [];
        const cpps = couponsRes.data?.coupons || [];

        // Build categories options and mapping
        const catsMap = {};
        cats.forEach(cat => {
          catsMap[String(cat.id)] = cat;
          catsMap[cat.name] = cat; // allow name lookup too
          catsMap[cat.slug] = cat; // allow slug lookup
        });

        setCategories(cats.map(cat => ({ value: String(cat.id), label: cat.name })));
        
        // Transform coupons and attach category label if possible
        const transformed = cpps.map(c => {
          const t = transformCoupon(c);
          const catKey = String(c.category || c.category_id || '');
          const cat = catsMap[catKey] || null;
          t.category = cat ? String(cat.id) : (c.category || c.category_id || '');
          t.categoryLabel = cat ? cat.name : (c.category || '');
          return t;
        });

        setCoupons(transformed);
        setError(null);
      } catch (err) {
        console.error('Error loading homepage data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      
      <main className="pt-16">
        <HeroSection />
        {loading ? (
          <div className="py-12 text-center">{t('homepage.loadingCoupons')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : (
          <CouponCatalog coupons={coupons} categories={categories} />
        )}
        <BenefitsSection />
        <StatsSection />
        <CTASection />
      </main>

      <FooterSection />
    </div>
  );
};

export default Homepage;