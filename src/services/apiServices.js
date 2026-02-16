import api from './api';
import { jwtHelper } from './jwtHelper';
import refundService from './refundService';

// Coupon Services
export const couponService = {
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data.data;
  },
  
  getBySlug: async (slug) => {
    const response = await api.get(`/coupons/${slug}`);
    return response.data.data;
  },
};

// Verification Services
export const verificationService = {
  submit: async (data) => {
    const response = await api.post('/verifications/submit', data);
    return response.data.data;
  },

  getByReference: async (reference) => {
    const response = await api.get(`/verifications/${reference}`);
    return response.data.data;
  },
};

// Admin Auth Services - JWT Based
export const adminAuthService = {
  /**
   * Login avec username/password
   * Backend retourne un JWT token
   */
  login: async (username, password) => {
    try {
      // console.log('[AUTH] Login attempt for:', username);
      const response = await api.post('/admin/auth/login', { username, password });
      // console.log('[AUTH] Login response:', response.data);

      // Backend devrait retourner un JWT token
      if (response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        // console.log('[AUTH] JWT token reçu du backend');

        // Sauvegarde le JWT
        jwtHelper.setToken(token);

        // Optionnel: extraire user data du token
        const user = jwtHelper.getUserFromToken();
        // console.log('[AUTH] User data du token:', user);

        // Sauvegarde aussi user data pour l'UI (lecture rapide sans décoder)
        if (response.data.data.user) {
          localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
        }
        
        return { token, user: response.data.data.user };
      } else {
        console.error('[AUTH] Pas de token dans la réponse:', response.data);
        throw new Error('No JWT token in response');
      }
    } catch (error) {
      console.error('[AUTH] Login error:', error.message);
      throw error;
    }
  },

  /**
   * Logout - supprime le token
   */
  logout: async () => {
    try {
      // Notifie le backend (optionnel avec JWT)
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('[AUTH] Logout API error:', error.message);
      // Même si backend fail, clear local
    } finally {
      // console.log('[AUTH] Clearing local auth');
      jwtHelper.removeToken();
      // localStorage.clear()
    }
  },

  /**
   * Vérifie l'authentification
   */
  check: async () => {
    try {
      // Vérifier localement d'abord
      if (!jwtHelper.isTokenValid()) {
        // console.log('[AUTH] JWT token not valid locally');
        return { authenticated: false };
      }

      // console.log('[AUTH] JWT token valid, checking with backend...');
      const response = await api.get('/admin/auth/check');

      if (response.data.data.authenticated) {
        // console.log('[AUTH] Backend confirms authenticated');
        return { authenticated: true, user: response.data.data.user };
      } else {
        // console.log('[AUTH] Backend says not authenticated');
        jwtHelper.removeToken();
        return { authenticated: false };
      }
    } catch (error) {
      console.warn('[AUTH] Backend check failed:', error.message);
      // Vérifier localement au moins
      if (jwtHelper.isTokenValid()) {
        // console.log('[AUTH] Backend unreachable, but JWT valid locally');
        return { authenticated: true };
      }
      throw error;
    }
  },

  /**
   * Récupère user data depuis localStorage (cache rapide)
   */
  getUser: () => {
    const cached = localStorage.getItem('auth_user');
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback: extraire du token JWT
    return jwtHelper.getUserFromToken();
  },

  /**
   * Vérifie si authentifié
   */
  isAuthenticated: () => {
    return jwtHelper.isTokenValid();
  },

  /**
   * Récupère le JWT token
   */
  getToken: () => {
    return jwtHelper.getToken();
  },

  /**
   * Récupère l'Authorization header
   */
  getAuthHeader: () => {
    return jwtHelper.getAuthHeader();
  },

  /**
   * Nettoie l'authentification
   */
  clearAuth: () => {
    jwtHelper.removeToken();
  },
};

// Admin Dashboard Services
export const adminDashboardService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },
};

export default {
  couponService,
  verificationService,
  refundService,
  adminAuthService,
  adminDashboardService,
};
