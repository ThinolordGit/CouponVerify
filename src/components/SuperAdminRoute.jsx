import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'context/I18nContext';
import { useAdmin } from '../context/AdminContext';
import Icon from 'components/AppIcon';

/**
 * SuperAdminRoute - Protect routes requiring super_admin role
 * Only users with role 'super_admin' can access these routes
 * Uses AdminContext to get user data and authorization
 */
const SuperAdminRoute = ({ children }) => {
  const { t } = useTranslation();
  const { isLoading, isAuthenticated, isSuperAdmin, admin } = useAdmin();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin-login" replace />;
  }

  // Authenticated but not super_admin - show error
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-card rounded-lg border border-border p-8 shadow-lg">
          <div className="mb-4">
            <Icon name="AlertTriangle" size={48} className="mx-auto text-destructive" />
          </div>
          <h1 className="text-xl font-heading font-semibold text-foreground mb-2">
            {t('errors.unauthorized') || 'Unauthorized'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('errors.forbiddenRole') || 'This section is reserved for super administrators only'}. {t('common.yourRole')}: <strong>{admin.role}</strong>
          </p>
          <button
            onClick={() => window.location.href = '/admin-dashboard'}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('adminDashboard.dashboardTitle') || 'Back to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  // Super admin - render children
  return children;
};

export default SuperAdminRoute;
