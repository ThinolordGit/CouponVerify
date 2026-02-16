import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import couponService from 'services/couponService';
import verificationService from 'services/verificationService';
import refundService from 'services/refundService';
import { useTranslation } from '../../context/I18nContext';
import { useAdmin } from '../../context/AdminContext';

const AdminSidebar = ({ isCollapsed = false, onCollapsing=() => {  } }) => {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAdmin();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const location = useLocation();
  const navigate = useNavigate();

  // Keep internal collapsed state in sync when parent changes the prop
  useEffect(() => {
    setCollapsed(isCollapsed);
  }, [isCollapsed]);
  
  // Format count for display (e.g., 1200 -> '1.2k')
  const formatCount = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num ? num?.toString() : "0";
  };
  
  
  const [coupons, setCoupons] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [refunds, setRefunds] = useState([]);
  
  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const couponsResponse = await couponService.getAllCouponsAdmin();
      setCoupons(couponsResponse.data?.coupons || []);
      
      const allVers = (await verificationService.getAllVerifications())?.data?.verifications;
      // console.log(allVers)
      setVerifications(allVers);

      // pending refunds for sidebar badge
      const pendingRefunds = (await refundService.getAllRefunds())?.data?.refunds || [];
      setRefunds(pendingRefunds);
    } catch (err) {
      console.warn('Failed to load counts:', err);
    }
  };
  
  const navigationSections = [
    {
      title: t('navigation.dashboard'),
      items: [
        { label: t('navigation.overview'), path: '/admin-dashboard', icon: 'LayoutDashboard' },
      ],
    },
    {
      title: t('navigation.couponManagement'),
      items: [
        { label: t('navigation.allCoupons'), path: isSuperAdmin ? '/admin-dashboard/coupons' : '/admin-dashboard#coupons', icon: 'Ticket', badge: formatCount(coupons?.length) },
        { ignore: !isSuperAdmin, label: t('navigation.addCoupon'), path: '/admin-dashboard/coupons/add', icon: 'Plus' },
        { ignore: !isSuperAdmin, label: t('navigation.categories'), path: '/admin-dashboard/coupons/categories', icon: 'FolderTree' },
      ],
    },
    {
      title: t('navigation.verifications'),
      items: [
        { label: t('navigation.history'), path: '/admin-dashboard/verifications', icon: 'History', badge: formatCount(verifications?.length) },
        { label: t('navigation.pending'), path: '/admin-dashboard/verifications/pending', icon: 'Clock', badge: formatCount(verifications?.filter(v => v.status === 'pending')?.length) },
        { label: t('navigation.blocked'), path: '/admin-dashboard/verifications/blocked', icon: 'ShieldAlert', badge: formatCount(verifications?.filter(v => v.status === 'blocked')?.length) },
        { label: t('navigation.refunds'), path: '/admin-dashboard/refunds', icon: 'DollarSign', badge: formatCount(refunds?.length) }
      ],
    },
    ...(isSuperAdmin ? [{
      title: t('navigation.system'),
      items: [
        { label: t('navigation.emailConfig'), path: '/admin-dashboard/email-config', icon: 'Mail' },
        { label: t('common.settings'), path: '/admin-dashboard/settings', icon: 'Settings' },
        { label: t('navigation.users'), path: '/admin-dashboard/users', icon: 'Users' },
      ],
    }] : [])
  ];

  const isActivePath = (path) => location?.pathname === path;

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapsing(!collapsed);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <button
        className={`admin-sidebar-mobile-toggle ${isMobileOpen ? 'sidebar-open' : ''}`}
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>
      <div
        className={`admin-sidebar-overlay ${!isMobileOpen ? 'hidden' : ''}`}
        onClick={closeMobileSidebar}
      />
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin-dashboard" className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-icon">
              <Icon name="ShieldCheck" size={24} color="#FFFFFF" />
            </div>
            {!collapsed && <span className="admin-sidebar-logo-text">CouponVerify</span>}
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar collapse"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav scrollbar-thin">
          {navigationSections?.filter(section => !section?.ignore).map((section, sectionIndex) => (
            <div key={sectionIndex} className="admin-sidebar-nav-section">
              {!collapsed && <div className="admin-sidebar-nav-section-title">{section?.title}</div>}
              {section?.items?.filter(item => !item?.ignore).map((item) => (
                <div
                  key={item?.path}
                  className={`admin-sidebar-nav-item ${isActivePath(item?.path) ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                  onClick={ () => { navigate(item?.path); item?.path?.includes("#") && setTimeout(() => { window.location.href = item?.path }, 100); closeMobileSidebar(); } }
                  title={collapsed ? item?.label : undefined}
                >
                  <Icon name={item?.icon} size={20} className="admin-sidebar-nav-item-icon" />
                  {!collapsed && <span className="admin-sidebar-nav-item-text">{item?.label}</span>}
                  {!collapsed && item?.badge && (
                    <span className="admin-sidebar-nav-item-badge">{item?.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      
      {collapsed && !isMobileOpen && (
        <button
          onClick={() => { setCollapsed(false); onCollapsing(false); }}
          aria-label="Expand sidebar"
          className="admin-sidebar-expand-button bg-primary text-primary-foreground rounded-full p-2 shadow-md"
          style={{ position: 'fixed', left: 10, top: 14, zIndex: 60 }}
        >
          <Icon name="ChevronRight" size={18} />
        </button>
      )}
    </>
  );
};

export default AdminSidebar;