import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from 'services/api';

const DEFAULT_FEATURES = {
  enable_user_dashboard: true,
  enable_coupon_verification: true,
  enable_admin_panel: true,
  enable_launching_push: false,
  enable_submit_resume: false,
  enable_home_page: true,
  enable_public_catalog: true,
  enable_social_sharing: false,
  enable_api_access: false,
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [features, setFeatures] = useState(() => {
    try {
      const raw = localStorage.getItem('app_features');
      return raw ? JSON.parse(raw) : DEFAULT_FEATURES;
    } catch (e) {
      return DEFAULT_FEATURES;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // const normalize = (raw = {}) => ({
  //   enable_user_dashboard: raw.enable_user_dashboard === true || raw.enable_user_dashboard === '1' || DEFAULT_FEATURES.enable_user_dashboard,
  //   enable_coupon_verification: raw.enable_coupon_verification === true || raw.enable_coupon_verification === '1' || DEFAULT_FEATURES.enable_coupon_verification,
  //   enable_admin_panel: raw.enable_admin_panel === true || raw.enable_admin_panel === '1' || DEFAULT_FEATURES.enable_admin_panel,
  //   enable_launching_push: raw.enable_launching_push === true || raw.enable_launching_push === '1' || DEFAULT_FEATURES.enable_launching_push,
  //   enable_submit_resume: raw.enable_submit_resume === true || raw.enable_submit_resume === '1' || DEFAULT_FEATURES.enable_submit_resume,
  //   enable_home_page: raw.enable_home_page === true || raw.enable_home_page === '1' || DEFAULT_FEATURES.enable_home_page,
  //   enable_public_catalog: raw.enable_public_catalog === true || raw.enable_public_catalog === '1' || DEFAULT_FEATURES.enable_public_catalog,
  //   enable_social_sharing: raw.enable_social_sharing === true || raw.enable_social_sharing === '1' || DEFAULT_FEATURES.enable_social_sharing,
  //   enable_api_access: raw.enable_api_access === true || raw.enable_api_access === '1' || DEFAULT_FEATURES.enable_api_access,
  // });

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/settings', { params: { action: 'features' } });
      const raw = response?.data?.data?.features || response?.data?.features || {};
      // console.log(raw)
      // const normalized = normalize(raw);
      setFeatures(raw);
      try { localStorage.setItem('app_features', JSON.stringify(raw)); } catch (e) { /* ignore */ }
      setLoading(false);
      return raw;
    } catch (err) {
      console.debug('[AppContext] features endpoint failed, using cached/defaults', err?.message || err);
      // fallback to localStorage (already in state) or defaults
      setError(err);
      setLoading(false);
      return features;
    }
  }, [features]);

  useEffect(() => {
    // fetch on mount
    fetchFeatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFeatureEnabled = (key) => !!features?.[key];

  const setLocalFeature = (key, value) => {
    const next = { ...features, [key]: !!value };
    setFeatures(next);
    try { localStorage.setItem('app_features', JSON.stringify(next)); } catch (e) { /* ignore */ }
  };

  const value = {
    features,
    loading,
    error,
    refresh: fetchFeatures,
    isFeatureEnabled,
    setLocalFeature,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppSettings = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within AppProvider');
  }
  return ctx;
};

export default AppContext;