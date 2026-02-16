/**
 * JWT Helper - Gérer les tokens JWT
 * Utilisé pour stocker, récupérer et décoder les tokens
 */

export const jwtHelper = {
  /**
   * Sauvegarde le token JWT en localStorage
   */
  setToken: (token) => {
    if (!token) {
      // console.warn('[JWT] Tentative de sauvegarde d\'un token vide');
      return;
    }
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token_timestamp', Date.now().toString());
      // console.log('[JWT] Token sauvegardé en localStorage');
    } catch (error) {
      console.error('[JWT] Erreur sauvegarde token:', error);
    }
  },

  /**
   * Récupère le token JWT du localStorage
   */
  getToken: () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // console.log('[JWT] Token récupéré du localStorage');
      }
      return token;
    } catch (error) {
      console.error('[JWT] Erreur lecture token:', error);
      return null;
    }
  },

  /**
   * Supprime le token JWT
   */
  removeToken: () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_timestamp');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_timestamp');
      // console.log('[JWT] Token supprimé du localStorage');
    } catch (error) {
      console.error('[JWT] Erreur suppression token:', error);
    }
    finally {
      localStorage.clear();
      window.location.href = "/admin-dashboard";
    }
  },

  /**
   * Vérifie si le token existe et est valide (juste la présence, pas la signature)
   */
  hasToken: () => {
    return localStorage.getItem('auth_token') !== null;
  },

  /**
   * Décode le payload JWT SANS vérifier la signature (frontend only)
   * NOTE: Ne jamais faire confiance à user data du token côté frontend seul!
   * Toujours vérifier avec le backend
   */
  decodeToken: (token) => {
    try {
      if (!token) return null;

      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('[JWT] Token format invalide');
        return null;
      }

      // Decode payload (base64 URL safe)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      // console.log('[JWT] Token décodé:', decoded);
      return decoded;
    } catch (error) {
      console.error('[JWT] Erreur décodage token:', error);
      return null;
    }
  },

  /**
   * Vérifie si le token est expiré
   */
  isTokenExpired: (token) => {
    try {
      const decoded = jwtHelper.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      // exp est en secondes, Date.now() est en ms
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const isExpired = now >= expiryTime;

      if (isExpired) {
        // console.log('[JWT] Token expiré');
      } else {
        const remainingMs = expiryTime - now;
        const remainingMins = Math.floor(remainingMs / 1000 / 60);
        // console.log(`[JWT] Token valide pour ${remainingMins} minutes`);
      }

      return isExpired;
    } catch (error) {
      console.error('[JWT] Erreur vérification expiration:', error);
      return true;
    }
  },

  /**
   * Récupère user data du token
   */
  getUserFromToken: () => {
    const token = jwtHelper.getToken();
    if (!token) {
      // console.log('[JWT] Pas de token trouvé');
      return null;
    }

    const decoded = jwtHelper.decodeToken(token);
    if (!decoded) {
      return null;
    }

    // Supposant que le backend met user data dans le payload
    // Adapter selon ta structure de token
    return decoded.user || decoded.data || null;
  },

  /**
   * Vérifie si le token est valide (existe et pas expiré)
   */
  isTokenValid: () => {
    const token = jwtHelper.getToken();
    if (!token) {
      return false;
    }

    if (jwtHelper.isTokenExpired(token)) {
      jwtHelper.removeToken();
      return false;
    }

    return true;
  },

  /**
   * Obtient l'Authorization header prêt pour axios
   */
  getAuthHeader: () => {
    const token = jwtHelper.getToken();
    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  },
};

export default jwtHelper;
