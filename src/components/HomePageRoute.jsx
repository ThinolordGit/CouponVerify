/**
 * src/components/HomePageRoute.jsx
 * Wrapper component for homepage with redirect logic
 * Admins always have access to homepage regardless of feature flag
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Homepage from '../pages/homepage';
import useHomePageEnabled from '../hooks/useHomePageEnabled';
import { isAdmin } from '../utils/uuid';

const HomePageRoute = () => {
  const navigate = useNavigate();
  const { isEnabled, loading } = useHomePageEnabled();
  const adminAccess = isAdmin();
  
  useEffect(() => {
    // Allow access if: enabled OR user is admin
    // Redirect only if: disabled AND not admin
    if (!isEnabled && !adminAccess) {
      navigate('/coupon-verification', { replace: true });
    }
  }, [isEnabled, adminAccess, loading, navigate]);

  // If loading, show nothing (quick loading)
  // If disabled and not admin, redirect will happen above
  // If enabled or admin, show homepage
  if (loading) {
    return null;
  }

  if (!isEnabled && !adminAccess) {
    return null;
  }

  return <Homepage />;
};

export default HomePageRoute;
