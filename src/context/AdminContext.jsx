import React, { createContext, useState, useEffect, useCallback } from 'react';
import { adminAuthService } from '../services/apiServices';

/**
 * AdminContext - Provides admin user data and authentication state
 * Manages current user info, roles, and permissions
 */
export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load admin user on mount
  useEffect(() => {
    loadAdminUser();
  }, []);

  const loadAdminUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if authenticated
      const authenticated = adminAuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setAdmin(null);
        setIsLoading(false);
        return;
      }

      // Get user data from token/service
      const user = adminAuthService.getUser();
      setAdmin(user);
    } catch (err) {
      console.error('[ADMIN-CONTEXT] Error loading admin user:', err);
      setError(err);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isSuperAdmin = useCallback(() => {
    return admin && admin.role === 'super_admin';
  }, [admin]);

  const hasRole = useCallback((role) => {
    if (!admin) return false;
    if (Array.isArray(role)) {
      return role.includes(admin.role);
    }
    return admin.role === role;
  }, [admin]);

  const logout = useCallback(() => {
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    admin,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin: isSuperAdmin(),
    hasRole,
    refresh: loadAdminUser,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

/**
 * Hook to use AdminContext
 */
export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }

  return context;
};
