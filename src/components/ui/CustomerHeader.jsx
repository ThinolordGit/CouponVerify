import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../../context/I18nContext';
import useHomePageEnabled from '../../hooks/useHomePageEnabled';
import { isAdmin } from '../../utils/uuid';

const CustomerHeader = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState('');
  const [siteName, setSiteName] = useState('CouponVerify');
  const location = useLocation();
  const { isEnabled: isHomePageEnabled } = useHomePageEnabled();
  const adminAccess = isAdmin();

  useEffect(() => {
    // Load site settings from localStorage
    const logoUrl = localStorage.getItem('site_logo_url');
    const nameFromSettings = localStorage.getItem('seo_title_prefix');
    
    if (logoUrl) setSiteLogo(logoUrl);
    if (nameFromSettings) setSiteName(nameFromSettings);
  }, []);

  const allNavigationItems = [
    { label: t('common.home'), path: '/homepage' },
    { label: t('homepage.startVerifying'), path: '/coupon-verification' },
  ];

  // Filter out home item if homepage is disabled AND user is not admin
  // Admins always see the home link
  const navigationItems = (isHomePageEnabled || adminAccess) 
    ? allNavigationItems 
    : allNavigationItems.filter(item => item.path !== '/homepage');

  const isActivePath = (path) => location?.pathname === path;

  // Logo link: if homepage enabled OR admin, go to /homepage; else go to verification
  const logoPath = (isHomePageEnabled || adminAccess) ? '/homepage' : '/coupon-verification';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="customer-header">
        <div className="customer-header-container">
          <Link to={logoPath} className="customer-header-logo">
            <div className="customer-header-logo-icon">
              {siteLogo ? (
                <img src={siteLogo} alt="Site logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Icon name="ShieldCheck" size={24} color="#FFFFFF" />
              )}
            </div>
            <span className="customer-header-logo-text">{siteName}</span>
          </Link>

          <nav className="customer-header-nav">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`customer-header-nav-link ${isActivePath(item?.path) ? 'active' : ''}`}
              >
                {item?.label}
              </Link>
            ))}
          </nav>

          <LanguageSwitcher />

          <button
            className="customer-header-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>
      </header>
      <div className={`customer-header-mobile-menu ${!isMobileMenuOpen ? 'closed' : ''}`}>
        <div className="customer-header-mobile-menu-header">
          <Link to={logoPath} className="customer-header-logo" onClick={closeMobileMenu}>
            <div className="customer-header-logo-icon">
              {siteLogo ? (
                <img src={siteLogo} alt="Site logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Icon name="ShieldCheck" size={24} color="#FFFFFF" />
              )}
            </div>
            <span className="customer-header-logo-text">{siteName}</span>
          </Link>
          <button
            className="customer-header-mobile-toggle"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <nav className="customer-header-mobile-menu-nav">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`customer-header-mobile-menu-link ${isActivePath(item?.path) ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              {item?.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default CustomerHeader;