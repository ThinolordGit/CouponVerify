import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/apiServices';
import { useTranslation } from 'context/I18nContext';

/**
 * PrivateRoute - Protect admin routes requiring JWT authentication
 * JWT token is the source of truth for authentication
 */
const PrivateRoute = ({ children }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // PRIMARY CHECK: Is JWT token valid?
        const isValid = adminAuthService.isAuthenticated();
        // console.log('[PRIVATE-ROUTE] JWT token valid:', isValid);

        if (!isValid) {
          // console.log('[PRIVATE-ROUTE] No valid JWT token, redirecting to login');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // JWT is valid locally, assume authenticated
        // Optionally verify with backend
        setIsAuthenticated(true);

        try {
          // console.log('[PRIVATE-ROUTE] Verifying JWT with backend...');
          // const result = await adminAuthService.check();
          // console.log('[PRIVATE-ROUTE] Backend verification result:', result);
          // Keep authenticated if JWT is valid (backend check is just for info)
        } catch (error) {
          // console.log('[PRIVATE-ROUTE] Backend verification failed (non-critical):', error.message);
          // Keep authenticated if JWT is valid
        }
      } catch (error) {
        console.error('[PRIVATE-ROUTE] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('ui.verifyingAuth')}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Authenticated - render children
  return children;
};

export default PrivateRoute;
