import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import couponService from 'services/couponService';
import verificationService from 'services/verificationService';
import { useTranslation } from '../../context/I18nContext';
import { useAdmin } from '../../context/AdminContext';

const AdminSidebar = ({ isCollapsed = false, onCollapsing=() => {  } }) => {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAdmin();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const location = useLocation();
  
  // Format count for display (e.g., 1200 -> '1.2k')
  const formatCount = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num ? num?.toString() : "0";
  };
  

  const [coupons, setCoupons] = useState([]);
  const [verifications, setVerifications] = useState([]);
  
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
        { label: t('navigation.allCoupons'), path: '/admin-dashboard/coupons', icon: 'Ticket', badge: formatCount(coupons?.length) },
        { label: t('navigation.addCoupon'), path: '/admin-dashboard/coupons/add', icon: 'Plus' },
        { label: t('navigation.categories'), path: '/admin-dashboard/coupons/categories', icon: 'FolderTree' },
      ],
    },
    {
      title: t('navigation.verifications'),
      items: [
        { label: t('navigation.history'), path: '/admin-dashboard/verifications', icon: 'History', badge: formatCount(verifications?.length) },
        { label: t('navigation.pending'), path: '/admin-dashboard/verifications/pending', icon: 'Clock', badge: formatCount(verifications?.filter(v => v.status === 'pending')?.length) },
        { label: t('navigation.blocked'), path: '/admin-dashboard/verifications/blocked', icon: 'ShieldAlert', badge: formatCount(verifications?.filter(v => v.status === 'blocked')?.length) },
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
            <span className="admin-sidebar-logo-text">CouponVerify</span>
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
          {navigationSections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="admin-sidebar-nav-section">
              <div className="admin-sidebar-nav-section-title">{section?.title}</div>
              {section?.items?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`admin-sidebar-nav-item ${isActivePath(item?.path) ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  <Icon name={item?.icon} size={20} className="admin-sidebar-nav-item-icon" />
                  <span className="admin-sidebar-nav-item-text">{item?.label}</span>
                  {item?.badge && (
                    <span className="admin-sidebar-nav-item-badge">{item?.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;