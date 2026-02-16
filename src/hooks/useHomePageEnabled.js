/**
 * src/hooks/useHomePageEnabled.js
 * Hook to check if homepage is enabled from settings
 * Always fetches from API to ensure latest value, uses localStorage as fallback only
 */

import { useState, useEffect } from 'react';
import apiClient from 'services/api';

export const useHomePageEnabled = () => {
  const [isEnabled, setIsEnabled] = useState(true); // Default true
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchHomePageSetting();
  }, []);
  
  const fetchHomePageSetting = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first (always get latest from DB)
      try {
        const response = await apiClient.get('/api/settings',{
            params: { 'action': 'features' }
        });
        // console.log(response?.statusText)
        // if (response?.statusText === 'OK') {
          // Handle both response formats: { data: { features: {...} } } and { features: {...} }
          const features = response?.data?.data?.features || response?.data?.features;
          const enabled = features?.enable_home_page === true || 
                         features?.enable_home_page === '1';
          setIsEnabled(enabled);
          // Update localStorage with latest value from API
          localStorage.setItem('enable_home_page', enabled ? '1' : '0');
          return;
        // }
      } catch (apiError) {
        console.debug('Public features endpoint error, falling back to localStorage:', apiError.message);
      }

      // Fallback to localStorage if API is not available
      const cachedSetting = localStorage.getItem('enable_home_page');
      if (cachedSetting !== null) {
        const enabled = cachedSetting === '1' || cachedSetting === 'true';
        setIsEnabled(enabled);
      } else {
        // Default to true if neither API nor cache available
        setIsEnabled(true);
      }
    } catch (err) {
      console.error('Error fetching homepage setting:', err);
      setError(err);
      setIsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  return { isEnabled, loading, error, refresh: fetchHomePageSetting };
};

export default useHomePageEnabled;
