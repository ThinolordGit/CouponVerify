import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../../services/apiServices';
import couponService from '../../services/couponService';
import verificationService from '../../services/verificationService';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import StatCard from './components/StatCard';
import RecentVerificationCard from './components/RecentVerificationCard';
import QuickActionCard from './components/QuickActionCard';
import VerificationChart from './components/VerificationChart';
import CouponTypeDistribution from './components/CouponTypeDistribution';
import ActivityFeed from './components/ActivityFeed';
import AdminVerificationDetailsModal from './components/AdminVerificationDetailsModal';
import CouponCatalog from '../homepage/components/CouponCatalog';
import Icon from '../../components/AppIcon';
import { useTranslation } from '../../context/I18nContext';
import categoryService from '../../services/categoryService';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [verificationChartData, setVerificationChartData] = useState([]);
  const [couponDistributionData, setCouponDistributionData] = useState([]);
  const [recentVerificationsData, setRecentVerificationsData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  
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

  // Get current user
  const currentUser = adminAuthService.getUser();
  // console.log('[DASHBOARD] Current user:', currentUser);
  // console.log('[DASHBOARD] localStorage auth_user:', localStorage.getItem('auth_user'));
  
  const handleLogout = async () => {
    try {
      await adminAuthService.logout();
      navigate('/admin-login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin-login', { replace: true });
    }
  };

  // Load all dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fallback/mock data for when API is unavailable
  const getFallbackVerifications = () => [
    {
      id: 'VER-001',
      couponType: 'PCS Mastercard',
      couponLogo: 'https://images.unsplash.com/photo-1613243555978-636c48dc653c',
      couponLogoAlt: 'PCS card',
      email: 'user1@email.com',
      amount: '50',
      currency: 'EUR',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      id: 'VER-002',
      couponType: 'Transcash',
      couponLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_132ab109d-1770642124258.png',
      couponLogoAlt: 'Transcash',
      email: 'user2@email.com',
      amount: '100',
      currency: 'EUR',
      status: 'valid',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 'VER-003',
      couponType: 'Steam Wallet',
      couponLogo: 'https://img.rocket.new/generatedImages/rocket_gen_img_19641777d-1767780306693.png',
      couponLogoAlt: 'Steam',
      email: 'user3@email.com',
      amount: '25',
      currency: 'EUR',
      status: 'invalid',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString()
    }
  ];
  
  const getFallbackCoupons = () => [
    { id: 1, type: 'PCS', name: 'PCS Mastercard' },
    { id: 2, type: 'Transcash', name: 'Transcash' },
    { id: 3, type: 'Steam', name: 'Steam Wallet' }
  ];

  const loadDashboardData = async () => {
    try {
      // Load coupons
      const couponsRes = await couponService.getAllCouponsAdmin();
      const couponsList = couponsRes?.data?.coupons || getFallbackCoupons();
      const catsRes = await categoryService.getAllCategories();
  
      const cats = catsRes.data?.categories || [];

      // Build categories options - Array of { value, label } for Select component
      const catsMap = {};
      cats.forEach(cat => {
        catsMap[String(cat.id)] = cat;
        catsMap[cat.name] = cat; // allow name lookup too
        catsMap[cat.slug] = cat; // allow slug lookup
      });
      
      setCategories(cats.map(cat => ({ value: String(cat.id), label: cat.name })));
      
      // Transform coupons and attach category label if possible
      const transformed = couponsList.map(c => {
        const t = transformCoupon(c);
        const catKey = String(c.category || c.category_id || '');
        const cat = catsMap[catKey] || null;
        t.category = cat ? String(cat.id) : (c.category || c.category_id || '');
        t.categoryLabel = cat ? cat.name : (c.category || '');
        return t;
      });
      
      setCoupons(transformed);
      // setCoupons(couponsList);
      
      // Load all verifications
      const verificationsRes = await verificationService.getAllVerifications();
      const verificationsList = verificationsRes?.data?.verifications || getFallbackVerifications();
      setVerifications(verificationsList);

      // Generate coupon distribution
      const distribution = generateCouponDistribution(couponsList);
      setCouponDistributionData(distribution);

      // Generate verification chart data (last 7 days)
      const chartData = generateVerificationChart(verificationsList);
      setVerificationChartData(chartData);

      // Get recent verifications (last 4)
      const recent = verificationsList.slice(0, 4);
      setRecentVerificationsData(recent);

      // Generate activities from verifications
      const activityFeed = generateActivities(verificationsList.slice(0, 6));
      setActivities(activityFeed);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data, using fallback:', err);
      
      // Use fallback data when API fails
      const fallbackCoupons = getFallbackCoupons();
      const fallbackVerifications = getFallbackVerifications();
      
      setCoupons(fallbackCoupons);
      setVerifications(fallbackVerifications);
      
      const distribution = generateCouponDistribution(fallbackCoupons);
      setCouponDistributionData(distribution);
      
      const chartData = generateVerificationChart(fallbackVerifications);
      setVerificationChartData(chartData);
      
      const recent = fallbackVerifications.slice(0, 4);
      setRecentVerificationsData(recent);
      
      const activityFeed = generateActivities(fallbackVerifications.slice(0, 6));
      setActivities(activityFeed);
      
      setLoading(false);
    }
  };
  

  // Helper functions for date handling
  const getDateString = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getDayName = (dateString) => {
    const d = new Date(dateString + 'T00:00:00');
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  };

  // Generate coupon distribution from backend data
  const generateCouponDistribution = (couponsList) => {
    if (!couponsList || couponsList.length === 0) return [];
    
    // Count coupons by type
    const distribution = {};
    couponsList.forEach(coupon => {
      const type = coupon.name || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    // Convert to array and calculate percentages
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6
  };

  // Generate verification chart from REAL backend data (last 7 days)
  const generateVerificationChart = (verificationsList) => {
    if (!verificationsList || verificationsList.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        valid: 0,
        invalid: 0,
        pending: 0
      }));
    }

    // Build last 7 days structure
    const last7Days = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      last7Days[dateStr] = { 
        valid: 0, 
        invalid: 0, 
        pending: 0, 
        date: getDayName(dateStr) 
      };
    }

    // Count verifications by date and status
    verificationsList.forEach(ver => {
      const dateStr = getDateString(ver.created_at || ver.submitted_at);
      if (dateStr && last7Days[dateStr]) {
        if (ver.status === 'approved') last7Days[dateStr].valid += 1;
        else if (ver.status === 'rejected' || ver.status === 'blocked' || ver.status === 'duplicate') 
          last7Days[dateStr].invalid += 1;
        else if (ver.status === 'pending') last7Days[dateStr].pending += 1;
      }
    });

    return Object.values(last7Days);
  };

  // Generate activities from recent verifications
  const generateActivities = (verificationsList) => {
    return verificationsList.slice(0, 6).map((ver, index) => {
      // Map BD statuses - keep keys simple, translation happens in component
      const statuses = {
        approved: { type: 'approval', action: 'activityApproved' },
        rejected: { type: 'rejection', action: 'activityRejected' },
        pending: { type: 'verification', action: 'activityReceived' },
        blocked: { type: 'rejection', action: 'activityBlocked' },
        duplicate: { type: 'rejection', action: 'activityDuplicate' }
      };

      const statusInfo = statuses[ver.status] || { type: 'verification', action: 'activityProcessed' };

      return {
        id: index + 1,
        type: statusInfo.type,
        action: statusInfo.action,
        reference: ver.reference || ver.transaction_reference || 'N/A',
        coupon: ver.coupon_type || 'coupon',
        amount: ver.amount || 'N/A',
        currency: ver.currency || 'EUR',
        timestamp: ver.submitted_at || new Date().toISOString()
      };
    });
  };

  // Calculate stats dynamically with real comparisons
  const calculateStats = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = getDateString(today);
    const yesterdayStr = getDateString(yesterday);

    // Today's verifications
    const todayVerifications = verifications.filter(v => {
      const dateStr = getDateString(v.created_at || v.submitted_at);
      return dateStr === todayStr;
    });
    
    // Yesterday's verifications
    const yesterdayVerifications = verifications.filter(v => {
      const dateStr = getDateString(v.created_at || v.submitted_at);
      return dateStr === yesterdayStr;
    });

    // Count by status
    const todayValid = todayVerifications.filter(v => v.status === 'approved').length;
    const todayPending = todayVerifications.filter(v => v.status === 'pending').length;
    const todayValidationRate = todayVerifications.length > 0 
      ? ((todayValid / todayVerifications.length) * 100).toFixed(1)
      : 0;

    const yesterdayValid = yesterdayVerifications.filter(v => v.status === 'approved').length;
    const yesterdayPending = yesterdayVerifications.filter(v => v.status === 'pending').length;
    const yesterdayValidationRate = yesterdayVerifications.length > 0 
      ? ((yesterdayValid / yesterdayVerifications.length) * 100).toFixed(1)
      : 0;

    // Calculate changes
    const verificationsChange = todayVerifications.length - yesterdayVerifications.length;
    const validationRateChange = parseFloat(todayValidationRate) - parseFloat(yesterdayValidationRate);
    const pendingChange = todayPending - yesterdayPending;
    const couponsChange = coupons.length > 0 ? 0 : 0; // Coupons don't change daily usually

    // Helper to format change value
    const formatChange = (num) => {
      if (num === 0) return '+0';
      if (num > 0) return `+${num}`;
      return num.toString();
    };

    // Helper to determine change type
    const getChangeType = (num) => {
      if (num > 0) return 'increase';
      if (num < 0) return 'decrease';
      return 'neutral';
    };

    // Generate trend data from last 7 days
    const last7DaysTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      const dayVerifications = verifications.filter(v => 
        getDateString(v.created_at || v.submitted_at) === dateStr
      );
      last7DaysTrend.push(dayVerifications.length);
    }

    const validationRateTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      const dayVerifications = verifications.filter(v => 
        getDateString(v.created_at || v.submitted_at) === dateStr
      );
      const dayValid = dayVerifications.filter(v => v.status === 'approved').length;
      const rate = dayVerifications.length > 0 
        ? Math.round((dayValid / dayVerifications.length) * 100)
        : 0;
      validationRateTrend.push(rate);
    }

    const pendingTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      const dayPending = verifications.filter(v => 
        getDateString(v.created_at || v.submitted_at) === dateStr && v.status === 'pending'
      ).length;
      pendingTrend.push(dayPending);
    }

    return [
      {
        title: t('adminDashboard.verificationsToday'),
        value: todayVerifications.length.toString(),
        change: formatChange(verificationsChange),
        changeType: getChangeType(verificationsChange),
        icon: "CheckCircle2",
        iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
        trend: last7DaysTrend
      },
      {
        title: t('adminDashboard.validationRate'),
        value: `${todayValidationRate}%`,
        change: formatChange(Math.round(validationRateChange * 10) / 10),
        changeType: getChangeType(validationRateChange),
        icon: "TrendingUp",
        iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        trend: validationRateTrend
      },
      {
        title: t('adminDashboard.pendingStat'),
        value: todayPending.toString(),
        change: formatChange(pendingChange),
        changeType: getChangeType(pendingChange),
        icon: "Clock",
        iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
        trend: pendingTrend
      },
      {
        title: t('adminDashboard.activeCoupons'),
        value: coupons.length.toString(),
        change: formatChange(couponsChange),
        changeType: getChangeType(couponsChange),
        icon: "Ticket",
        iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
        trend: Array(7).fill(coupons.length)
      }
    ];
  };

  const stats = calculateStats();

  // Quick actions (static but with dynamic link to pending)
  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const quickActions = [
  {
    title: t('adminDashboard.manageCoupons'),
    description: t('adminDashboard.manageCouponsDesc'),
    icon: "Ticket",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    link: "/admin-dashboard/coupons"
  },
  {
    title: t('adminDashboard.pendingVerifications'),
    description: t('adminDashboard.verificationsNeedAttention').replace('{count}', pendingCount),
    icon: "Clock",
    iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    link: "/admin-dashboard/verifications/pending"
  },
  {
    title: t('navigation.emailConfig'),
    description: t('adminDashboard.manageTemplatesSMTP'),
    icon: "Mail",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    link: "/admin-dashboard/email-config"
  },
  {
    title: t('adminDashboard.siteSettings'),
    description: t('adminDashboard.customizeAppearance'),
    icon: "Settings",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    link: "/admin-dashboard/settings"
  }];

  
  // Mock activity feed
  // Activities are generated from real verification data

  const handleViewDetails = (verificationId) => {
    const verification = verifications.find(v => v.id === verificationId);
    if (verification) {
      setSelectedVerification(verification);
      setShowDetailsModal(true);
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      // console.log('Approving verification:', verificationId);
      await verificationService.approveVerification(verificationId);
      
      // Reload dashboard data
      await loadDashboardData();
      setShowDetailsModal(false);
      alert(t('adminDashboard.approvedSuccess'));
    } catch (error) {
      console.error('Error approving verification:', error);
      alert(t('adminDashboard.approveError'));
    }
  };

  const handleReject = async (verificationId) => {
    try {
      // console.log('Rejecting verification:', verificationId);
      const reason = prompt(t('adminDashboard.rejectionReason'));
      await verificationService.rejectVerification(verificationId, reason || '');
      
      // Reload dashboard data
      await loadDashboardData();
      setShowDetailsModal(false);
      alert(t('adminDashboard.rejectedSuccess'));
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert(t('adminDashboard.rejectError'));
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedVerification(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadDashboardData();
      alert(t('adminDashboard.refreshSuccess'));
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert(t('adminDashboard.refreshError'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        totalCoupons: coupons.length,
        totalVerifications: verifications.length,
        verifications: verifications,
        coupons: coupons
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(t('adminDashboard.exportSuccess'));
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(t('adminDashboard.exportError'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsing={setSidebarCollapsed}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
          <BreadcrumbNavigation />
          
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                  {t('adminDashboard.dashboardTitle')}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('adminDashboard.platformOverview')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <Icon name="Download" size={18} />
                  <span className="hidden sm:inline">{t('common.export')}</span>
                </button>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <Icon name={loading ? "Loader" : "RefreshCw"} size={18} className={loading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">{loading ? t('common.loading') : t('adminDashboard.refresh')}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors flex items-center gap-2"
                  title={`${t('common.logout')} - ${currentUser?.username || 'Admin'}`}
                >
                  <Icon name="LogOut" size={18} />
                  <span className="hidden sm:inline">{t('common.logout')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats?.map((stat, index) =>
            <StatCard key={index} {...stat} />
            )}
          </div>

          {/* Charts Section */}
          {false && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
              <VerificationChart
                data={verificationChartData}
                title={t('adminDashboard.last7Days')} />
              
            </div>
            <div>
              <CouponTypeDistribution
                data={couponDistributionData}
                title={t('adminDashboard.distributionByType')} />
              
            </div>
          </div>}

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-4">
              {t('adminDashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions?.map((action, index) =>
              <QuickActionCard key={index} {...action} />
              )}
            </div>
          </div>

          {/* Recent Verifications and Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                    {t('adminDashboard.recentVerifications')}
                  </h2>
                  <button 
                    onClick={() => navigate('/admin-dashboard/verifications')}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {t('adminDashboard.viewAll')}
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentVerificationsData && recentVerificationsData.length > 0 ? (
                    recentVerificationsData.map((verification) =>
                    <RecentVerificationCard
                      key={verification?.id}
                      coupons={coupons}
                      verification={verification}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails} />
                    )
                  ) : (
                    <p className="text-muted-foreground text-center py-8">{t('adminDashboard.noRecentVerifications')}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <ActivityFeed
                activities={activities}
                title={t('adminDashboard.recentActivityTitle')} />
              
            </div>
          </div>

          {/* Coupons Catalog Section */}
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
              {t('homepage.supportedCoupons')}
            </h2>
            <CouponCatalog coupons={coupons} categories={categories} variant="admin" />
          </div>
        </div>
      </div>

      {/* Verification Details Modal */}
      <AdminVerificationDetailsModal
        verification={selectedVerification}
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        coupons={coupons}
      />
    </div>);

};

export default AdminDashboard;