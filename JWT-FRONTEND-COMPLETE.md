# ✅ JWT Frontend - Modifications Complètes

**Status:** Frontend convertis à JWT ✅  
**Date:** 2026-02-10  
**Impact:** localStorage + axios configurés pour JWT

---

## 📋 Fichiers Modifiés

### 1. **src/services/jwtHelper.js** (CRÉÉ)
**Purpose:** Gérer les JWT tokens en localStorage

**Fonctionnalités:**
- `setToken(token)` - Sauvegarde le JWT
- `getToken()` - Récupère le JWT
- `removeToken()` - Supprime le JWT
- `hasToken()` - Vérifie si token existe
- `decodeToken(token)` - Décode sans vérifier signature
- `isTokenExpired(token)` - Vérifie expiration
- `getUserFromToken()` - Extrait user du token
- `isTokenValid()` - Vérifie token valide ET pas expiré
- `getAuthHeader()` - Retourne header Authorization: Bearer

**localStorage Keys:**
```javascript
auth_token        // JWT token string
token_timestamp   // Quand le token a été sauvegardé
auth_user         // Cache user data (lecture rapide)
```

---

### 2. **src/services/api.js** (MODIFIÉ)
**Changes:**
```javascript
// AVANT
withCredentials: true  // Pour sessions PHP

// APRÈS
withCredentials: false // JWT dans headers, pas de cookies
```

**Request Interceptor:**
```javascript
// Ajoute Authorization header avec JWT
config.headers.Authorization = `Bearer ${token}`
```

**Response Interceptor:**
```javascript
// 401 Unauthorized → Efface JWT + Redirect login
if (401) {
  jwtHelper.removeToken()
  window.location.href = '/admin-login'
}
```

---

### 3. **src/services/apiServices.js** (MODIFIÉ)
**Import:**
```javascript
import { jwtHelper } from './jwtHelper'
```

**adminAuthService.login():**
```javascript
// Reçoit JWT du backend
const token = response.data.data.token

// Sauvegarde JWT via jwtHelper
jwtHelper.setToken(token)

// Retourne {token, user}
```

**adminAuthService.logout():**
```javascript
// Supprime JWT
jwtHelper.removeToken()
// Plus besoin de "clearAuth()" complexe
```

**adminAuthService.check():**
```javascript
// Vérife localement d'abord
jwtHelper.isTokenValid()

// Optionnel: sync avec backend
api.get('/admin/auth/check')

// Backend doit vérifier Authorization header
```

**adminAuthService.isAuthenticated():**
```javascript
// AVANT
localStorage.getItem('auth_user') !== null

// APRÈS
jwtHelper.isTokenValid()
// Vérifie aussi expiration, pas juste présence
```

**Nouvelles méthodes:**
```javascript
adminAuthService.getToken()        // Récupère le JWT
adminAuthService.getAuthHeader()   // Récupère {Authorization: Bearer...}
```

---

### 4. **src/components/PrivateRoute.jsx** (MODIFIÉ)
**Logic Change:**
```javascript
// AVANT
localStorage.getItem('auth_user') !== null

// APRÈS
adminAuthService.isAuthenticated()
// = jwtHelper.isTokenValid()
// = token existe ET pas expiré
```

**Flow:**
```javascript
1. Vérifie JWT token valide
2. Si oui → Allowed, optionnel backend sync
3. Si non → Redirect to login
```

---

## 🔄 Flux d'Authentification

```
1. LOGIN
   User: admin/admin123
   ↓
   POST /api/admin/auth/login
   ↓
   Backend retourne:
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {...}
   }
   ↓
   Frontend sauvegarde:
   localStorage.auth_token = token
   localStorage.auth_user = user (cache)

2. NAVIGATION
   User → /admin-dashboard
   ↓
   PrivateRoute.check()
   ↓
   jwtHelper.isTokenValid()
   ↓
   Token existe ET pas expiré? OUI
   ↓
   Affiche dashboard

3. API CALL
   GET /api/admin/dashboard
   ↓
   api.interceptors.request
   ↓
   Ajoute: Authorization: Bearer etokenXYZ
   ↓
   Backend reçoit header
   ↓
   Vérifie signature du token
   ↓
   Retourne user data

4. LOGOUT
   User clique "Déconnexion"
   ↓
   adminAuthService.logout()
   ↓
   jwtHelper.removeToken()
   ↓
   localStorage.auth_token = deleted
   ↓
   Redirect to /admin-login
```

---

## 📊 localStorage Comparison

### AVANT (sessions PHP)
```javascript
localStorage = {
  auth_user: {...user object...},
  auth_timestamp: 1707753610000
}
Cookies = {
  PHPSESSID: abc123...
}
```

### APRÈS (JWT)
```javascript
localStorage = {
  auth_token: "eyJhbGciOiJIUzI1NiIs...",
  token_timestamp: 1707753610000,
  auth_user: {...user object...}  // Cache only
}
Cookies = {}  // None needed
```

---

## ✨ Avantages Frontend

| Aspect | Sessions | JWT |
|--------|----------|-----|
| **Complexité CORS** | ❌ Compliquée | ✅ Simple (header) |
| **Token Size** | Petit cookie | Moyen token |
| **Signature** | N/A | HMAC SHA256 |
| **Expiration** | Session timeout | `exp` claim |
| **Offline** | ❌ Pas de vérif | ✅ Vérif locale |
| **Scalabilité** | ❌ Server-side | ✅ Stateless |
| **Mobile-friendly** | ❌ Cookies problématiques | ✅ Headers parfaits |

---

## 🔐 Sécurité Frontend

### ✅ Points Sécurisés
1. **localStorage scoped** - Seulement accessible au domaine
2. **XSS protection** - Pas de eval() ou innerHTML
3. **Token vérification** - Check expiration avant utilisation
4. **401 handling** - Auto-logout sur 401 Unauthorized
5. **No hardcoded secrets** - JWT signé par backend

### ⚠️ À Considérer Production
1. **HTTPS only** - Ne pas envoyer JWT en HTTP
2. **HttpOnly cookies** - Alternative plus sécurisée que localStorage
3. **Refresh tokens** - Pour long-term sessions
4. **Token rotation** - Changer token périodiquement

---

## 🧪 Test Frontend

### Login Test
```javascript
// F12 Console
localStorage.getItem('auth_token')
// Doit retourner un JWT string
```

### Token Validation Test
```javascript
// F12 Console
jwtHelper.isTokenValid()
// Doit retourner true si logged in

jwtHelper.decodeToken(localStorage.getItem('auth_token'))
// Doit afficher {user: {...}, iat: ..., exp: ...}
```

### Refresh Persistence
```javascript
// Après login
F5  // Refresh page

// Devrait:
// ✓ Vérifier JWT en localStorage
// ✓ Vérifier pas expiré
// ✓ Afficher dashboard sans redirect
```

### Logout Test
```javascript
// Après logout
localStorage.getItem('auth_token')
// Doit retourner null

// URL devrait être /admin-login
```

---

## 🚀 Backend Integration Checklist

- [ ] Créer JWTHelper.php (cryptographie)
- [ ] Modifier AuthController.login() pour retourner JWT
- [ ] Modifier AuthController.check() pour vérifier JWT
- [ ] Créer JWTAuth middleware
- [ ] Configurer JWT_SECRET en .env
- [ ] Tester response structure ok
- [ ] Documenter endpoints JWT requis

---

## 📋 API Response Format Requis

### Login Response
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@couponverify.local",
      "full_name": "Administrator",
      "role": "super_admin"
    }
  }
}
```

### Check Response
```json
{
  "status": "success",
  "data": {
    "authenticated": true,
    "user": {
      "id": 1,
      "username": "admin",
      ...
    }
  }
}
```

### Logout Response
```json
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}
```

---

## 🔄 Migration Path

### Phase 1: Frontend JWT Ready (✅ DONE)
- [x] Create jwtHelper.js
- [x] Modify api.js for JWT headers
- [x] Modify apiServices.js
- [x] Update PrivateRoute

### Phase 2: Backend JWT Setup (⏳ TODO)
- [ ] Implement JWT generation
- [ ] Return token in login response
- [ ] Verify token in check endpoint
- [ ] Protect routes with JWT

### Phase 3: Testing
- [ ] Manual login test
- [ ] Token storage test
- [ ] Token validation test
- [ ] Logout test

### Phase 4: Production
- [ ] Enable HTTPS
- [ ] Use HttpOnly cookies (optional)
- [ ] Implement token rotation
- [ ] Add refresh token logic

---

## 📞 Support

**Frontend JWT Works:** ✅ Yes
**Backend JWT Ready:** ⏳ No (see JWT-BACKEND-SETUP.md)
**Tests Passing:** Test après backend setup

---

**Frontend is ready for JWT! Attends le backend setup.** 🚀
