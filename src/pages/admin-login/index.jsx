import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../../services/apiServices';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTranslation } from '../../context/I18nContext';

/**
 * Admin Login Page
 * Protected route - redirects to dashboard if already authenticated
 */
const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    const initAuth = async () => {
      // Try to verify session with backend first
      try {
        const result = await adminAuthService.check();
        if (result.authenticated) {
          navigate('/admin-dashboard', { replace: true });
        }
      } catch (error) {
        // console.log('Session check skipped (backend unavailable)');
        // If backend is down but we have local auth, still redirect
        if (adminAuthService.isAuthenticated()) {
          navigate('/admin-dashboard', { replace: true });
        }
      }
    };

    initAuth();
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!formData.username.trim() || !formData.password.trim()) {
        setError(t('adminLogin.enterCredentials'));
        setLoading(false);
        return;
      }

      setSuccess(t('adminLogin.loggingIn'));

      // Call login API
      const result = await adminAuthService.login(
        formData.username.trim(),
        formData.password.trim()
      );

      // console.log('[LOGIN] Login result:', result);
      // console.log('[LOGIN] localStorage after login:', localStorage.getItem('auth_user'));

      // Login successful, user data is now in localStorage
      setSuccess(t('adminLogin.loginSuccess'));

      // Redirect to dashboard immediately
      // localStorage is already set, so PrivateRoute will see it
      setTimeout(() => {
        // console.log('[LOGIN] Redirecting to dashboard, localStorage:', localStorage.getItem('auth_user'));
        navigate('/admin-dashboard', { replace: true });
      }, 300);

    } catch (err) {
      console.error('Login error:', err);

      // Handle different error types
      if (err.response?.status === 401) {
        setError(t('adminLogin.loginError'));
      } else if (err.response?.status === 403) {
        setError(t('adminLogin.accountInactive'));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError(t('adminLogin.connectionError'));
      } else {
        setError(t('adminLogin.connectionErrorRetry'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">CouponVerify</h1>
            <p className="text-primary-foreground/80 text-sm">{t('adminLogin.adminSpace')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-600 px-4 py-3 rounded-md text-sm">
                ✓ {success}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('adminLogin.username')}
              </label>
              <Input
                type="text"
                name="username"
                placeholder={t('adminLogin.usernamePlaceholder')}
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('adminLogin.password')}
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-md transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground/50"></span>
                  {t('adminLogin.loggingIn')}
                </span>
              ) : (
                t('adminLogin.signIn')
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-center text-xs text-muted-foreground mb-2">
                {t('adminLogin.demoAccount')}
              </p>
              <div className="bg-muted/50 rounded p-3 space-y-1 text-center font-mono text-xs">
                <p>
                  <span className="text-muted-foreground">{t('adminLogin.demoUser')}</span> <span className="text-foreground font-semibold">admin</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{t('adminLogin.demoPassword')}</span> <span className="text-foreground font-semibold">admin123</span>
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-muted/20 px-6 py-4 text-center border-t border-border">
            <p className="text-xs text-muted-foreground">
              {t('adminLogin.platformDesc')}<br />
              {t('adminLogin.copyright')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
