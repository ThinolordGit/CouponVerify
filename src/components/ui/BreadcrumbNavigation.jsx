import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useTranslation } from '../../context/I18nContext';

const BreadcrumbNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const pathSegments = location?.pathname?.split('/')?.filter(Boolean);

  const breadcrumbMap = {
    'admin-dashboard': t('navigation.dashboard'),
    'coupons': t('navigation.coupons'),
    'add': t('common.add'),
    'categories': t('navigation.categories'),
    'verifications': t('navigation.verifications'),
    'pending': t('navigation.pending'),
    'blocked': t('navigation.blocked'),
    'email-config': t('navigation.emailConfig'),
    'settings': t('common.settings'),
    'users': t('navigation.users'),
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { label: t('common.home'), path: '/admin-dashboard', isActive: false },
    ];

    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments?.length - 1;
      
      breadcrumbs?.push({
        label: breadcrumbMap?.[segment] || segment,
        path: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={`${crumb?.path}-${index}`}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="breadcrumb-separator" />
          )}
          {crumb?.isActive ? (
            <span className="breadcrumb-item active">{crumb?.label}</span>
          ) : (
            <Link to={crumb?.path} className="breadcrumb-item">
              {crumb?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;