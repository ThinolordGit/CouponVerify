import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import PrivateRoute from "components/PrivateRoute";
import SuperAdminRoute from "components/SuperAdminRoute";
import HomePageRoute from "components/HomePageRoute";
import AdminLogin from "pages/admin-login";
import AdminDashboard from './pages/admin-dashboard';
import AdminCouponManagement from './pages/admin-coupons';
import AdminCouponCategories from './pages/admin-coupons/categories';
import AdminVerifications from './pages/admin-verifications';
import AdminBlockedVerifications from './pages/admin-verifications/blocked';
import AdminRefunds from './pages/admin-refunds';
import AdminEmailConfig from './pages/admin-email-config';
import AdminSettings from './pages/admin-settings';
import AdminUsersManagement from './pages/admin-users';
import AuthDiagnostics from './pages/auth-diagnostics';
import CouponVerification from './pages/coupon-verification';
import RefundsPage from './pages/refunds';
import Homepage from './pages/homepage';
// import UserDashboard from './pages/user-dashboard';
import { useTranslation } from './context/I18nContext';

const Routes = () => {
  const { t } = useTranslation();
  return (
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<HomePageRoute />} />
          <Route path="/coupon-verification" element={<CouponVerification />} />
          <Route path="/verification/:slug" element={<CouponVerification />} />
          <Route path="/refunds" element={<RefundsPage />} />
          <Route path="/homepage" element={<HomePageRoute />} />
          {/* <Route path="/user-dashboard" element={<UserDashboard />} /> */}
          
          {/* Diagnostics Route */}
          <Route path="/auth-test" element={<AuthDiagnostics />} />
          
          {/* Admin Routes - Public Access (No Protection) */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Routes - Protected (Requires Authentication) */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Coupon Routes */}
          <Route
            path="/admin-dashboard/coupons"
            element={
              <PrivateRoute>
                <AdminCouponManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/coupons/add"
            element={
              <PrivateRoute>
                <AdminCouponManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/coupons/categories"
            element={
              <PrivateRoute>
                <AdminCouponCategories />
              </PrivateRoute>
            }
          />
          
          {/* Verification Routes */}
          <Route
            path="/admin-dashboard/verifications"
            element={
              <PrivateRoute>
                <AdminVerifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/verifications/pending"
            element={
              <PrivateRoute>
                <AdminVerifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/verifications/blocked"
            element={
              <PrivateRoute>
                <AdminBlockedVerifications />
              </PrivateRoute>
            }
          />

          {/* Refunds (admin) */}
          <Route
            path="/admin-dashboard/refunds"
            element={
              <PrivateRoute>
                <AdminRefunds />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/refunds/pending"
            element={
              <PrivateRoute>
                <AdminRefunds />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/refunds/blocked"
            element={
              <PrivateRoute>
                <AdminRefunds />
              </PrivateRoute>
            }
          />
          
          {/* Email & Settings Routes - Only Super Admin */}
          <Route
            path="/admin-dashboard/email-config"
            element={
              <PrivateRoute>
                <SuperAdminRoute>
                  <AdminEmailConfig />
                </SuperAdminRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard/settings"
            element={
              <PrivateRoute>
                <SuperAdminRoute>
                  <AdminSettings />
                </SuperAdminRoute>
              </PrivateRoute>
            }
          />
          
          {/* Users Route - Only Super Admin */}
          <Route
            path="/admin-dashboard/users"
            element={
              <PrivateRoute>
                <SuperAdminRoute>
                  <AdminUsersManagement />
                </SuperAdminRoute>
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
  );
};

export default Routes;
