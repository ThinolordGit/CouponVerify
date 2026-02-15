# ✅ JWT Implémentation Backend - COMPLÉTÉE

**Date:** 2026-02-10  
**Status:** ✅ PRÊT POUR TESTS  

---

## 📋 Fichiers Créés/Modifiés

### 1. **app/Utils/JWTHelper.php** (CRÉÉ)
Gère la génération et vérification des JWT tokens

**Méthodes principales:**
```php
JWTHelper::init($secret)                    // Initialiser avec secret
JWTHelper::generateToken($payload, $ttl)    // Générer token
JWTHelper::verifyToken($token)              // Vérifier signature + expiration
JWTHelper::decodeToken($token)              // Décoder sans vérification
JWTHelper::isTokenExpired($token)           // Vérifier expiration
JWTHelper::getUserFromToken($token)         // Extraire user data
JWTHelper::getTokenTTL($token)              // Temps restant
```

---

### 2. **app/Middleware/JWTAuth.php** (CRÉÉ)
Middleware pour vérifier JWT sur les routes protégées

**Méthodes principales:**
```php
JWTAuth::verify()                           // Vérifier sans terminer
JWTAuth::require()                          // Vérifier, 401 si invalid
JWTAuth::optional()                         // Vérifier optionnel
JWTAuth::getAuthenticatedUserId()           // Obtenir user ID
JWTAuth::getAuthenticatedUser()             // Obtenir user data
JWTAuth::hasValidToken()                    // Vérifier token exists
JWTAuth::getTokenTTL()                      // Secondes restantes
```

---

### 3. **app/Controllers/AuthController.php** (MODIFIÉ)

#### **login()** - Nouvelle logique
```php
// AVANT: Créait une session PHP
// APRÈS: Génère un JWT token

POST /api/admin/auth/login
{
  "username": "admin",
  "password": "admin123"
}

RÉPONSE:
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

#### **check()** - Nouvelle logique
```php
// AVANT: Vérifiait $_SESSION
// APRÈS: Vérifie Authorization header avec JWT

GET /api/admin/auth/check
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

RÉPONSE:
{
  "status": "success",
  "data": {
    "authenticated": true,
    "user": {...}
  }
}
```

#### **logout()** - Simplifiée
```php
// AVANT: Détruisait la session
// APRÈS: Juste un ACK (logout côté client)

POST /api/admin/auth/logout
Header: Authorization: Bearer ...

RÉPONSE:
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 4. **.env** (MODIFIÉ)
```env
JWT_SECRET=coupon_verify_jwt_secret_2026_super_secure_key_v1
```

**⚠️ Production:** Change cette valeur en production!

---

## 🔐 Protéger les Routes Admin

### Exemple: AdminController.php

```php
<?php
namespace App\Controllers;

use App\Middleware\JWTAuth;

class AdminController extends BaseController {

    // Option 1: Require JWT dans chaque méthode
    public function getDashboard() {
        $this->requireMethod('GET');
        
        // Vérifier JWT et retourner 401 si invalid
        JWTAuth::require();
        
        // Maintenant tu peux utiliser l'user
        $userId = JWTAuth::getAuthenticatedUserId();
        $user = JWTAuth::getAuthenticatedUser();
        
        // ... logique
    }

    // Option 2: Vérifier dans le constructeur (toute la classe)
    public function __construct($pdo) {
        parent::__construct($pdo);
        
        // Protéger toutes les méthodes de cette classe
        JWTAuth::require();
    }

    // Option 3: Optionnel (accès public mais JWT si présent)
    public function getPublicData() {
        $this->requireMethod('GET');
        
        // Vérifier optionnel
        $payload = JWTAuth::optional();
        
        if ($payload) {
            // User is authenticated
            $user = JWTAuth::getAuthenticatedUser();
        } else {
            // Public access
        }
    }
}
```

---

## 🧪 Tests API

### 1. Login
```bash
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Réponse attendue:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwuLi59LCJpYXQiOjE3MDc3NTM2MTAsImV4cCI6MTcwNzg0MDAx...",
    "user": {
      "id": 1,
      "username": "admin",
      ...
    }
  }
}
```

### 2. Utiliser le token
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Vérifier le token
curl -X GET http://localhost:8000/api/admin/auth/check \
  -H "Authorization: Bearer $TOKEN"

# Accéder endpoint protégé
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Token expiré
```bash
# Token expiré retourne 401
curl -X GET http://localhost:8000/api/admin/auth/check \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1Ni...EXPIRED"

# Réponse: 401 Unauthorized
```

---

## 🔄 Frontend / Backend Flow

```
1. FRONTEND LOGIN
   POST /api/admin/auth/login
   {username, password}
        ↓
   BACKEND valide credentials
        ↓
   BACKEND génère JWT token
   JWT = Header.Payload.Signature (signé avec JWT_SECRET)
        ↓
   Retourne {token, user}
        ↓
   FRONTEND stocke token en localStorage.auth_token

2. FRONTEND API CALL
   GET /api/admin/dashboard
   Header: Authorization: Bearer eyJhbGciOiJIUz...
        ↓
   BACKEND reçoit Authorization header
        ↓
   JWTAuth::verify() décide la signature
        ↓
   Si valid → Continue
   Si invalid → Return 401 Unauthorized

3. FRONTEND REFRESH
   F5 → localStorage.auth_token persiste
        ↓
   Frontend utilise token pour future appels
   
4. FRONTEND LOGOUT
   localStorage.removeItem('auth_token')
   Redirection vers /admin-login
```

---

## 🔍 Debugging

### Voir les logs
```bash
# Fichier logs du backend
tail -f logs/app.log

# Devrait montrer:
[JWT] Token generated for: admin
[JWT] Token verified successfully
[JWT] User logged in successfully
```

### Décoder un JWT (debugging only)
```php
<?php
require_once 'app/Utils/JWTHelper.php';

$token = "eyJhbGciOiJIUzI1Ni...";
$decoded = JWTHelper::decodeToken($token);
var_dump($decoded);
// Affiche: Array ( [user] => Array ( [id] => 1, [username] => admin, ...), [iat] => ..., [exp] => ... )
```

### Vérifier signature
```php
<?php
require_once 'app/Utils/JWTHelper.php';

JWTHelper::init(); // Charge JWT_SECRET depuis .env

$token = "eyJhbGciOiJIUzI1Ni...";
$payload = JWTHelper::verifyToken($token);

if ($payload) {
    echo "Token valide!";
    var_dump($payload);
} else {
    echo "Token invalid";
}
```

---

## 📊 JWT vs Sessions Comparison

| Aspect | Sessions PHP | JWT |
|--------|-------------|-----|
| **Où stocké** | Server PDO/files | Client localStorage |
| **Signature** | N/A | HMAC SHA256 |
| **Vérification** | Session lookup | Signature verify |
| **Stateless** | Non | Oui |
| **CORS** | Compliqué | Simple |
| **Mobile** | Cookies problématiques | Headers parfaits |
| **Scalabilité** | Serveur = bottleneck | Stateless = facile |

---

## ⚠️ Sécurité Production

### À Faire
- [ ] **HTTPS only** - Jamais HTTP en production
- [ ] **Signer JWT_SECRET** - Utiliser clé > 32 caractères
- [ ] **Rotation de secret** - Changer JWT_SECRET régulièrement
- [ ] **Refresh tokens** - Implémenter si long-term needed
- [ ] **Token blacklist** - Pour logout instantané (optionnel)
- [ ] **Rate limiting** - Sur /api/admin/auth/login
- [ ] **Logging** - Tous les logins/logouts

### Optionnel
- [ ] **HttpOnly cookies** - Au lieu de localStorage
- [ ] **CORS stricte** - Seulement domaines approuvés
- [ ] **Token rotation** - Expiration courte + refresh
- [ ] **2FA** - Pour extra sécurité

---

## 🚀 Checklist Implémentation

- [x] JWTHelper.php créé
- [x] JWTAuth middleware créé
- [x] AuthController.login() modifié (génère JWT)
- [x] AuthController.check() modifié (vérifie JWT)
- [x] AuthController.logout() modifié
- [x] JWT_SECRET configuré en .env
- [x] isAuthenticated() remplacé par JWT
- [ ] Tester avec frontend
- [ ] Protéger autres routes admin
- [ ] Implémenter dans AdminController, CouponController, etc

---

## 🔗 Backend Endpoints Finaux

### Auth Endpoints
```
POST   /api/admin/auth/login        → Retourne JWT token
GET    /api/admin/auth/check        → Vérifies JWT (protégé)
POST   /api/admin/auth/logout       → Logout (protégé)
```

### Protected Endpoint Example
```
GET    /api/admin/dashboard         → Require JWT
POST   /api/admin/coupons          → Require JWT
DELETE /api/admin/coupons/{id}     → Require JWT
```

---

## 📞 Support

**Frontend:** Utilise le JWT depuis localStorage.auth_token ✅
**Backend:** Vérifies Authorization header avec JWTAuth::require() ✅

**Frontend attend:**
```json
{
  "token": "...",
  "user": {...}
}
```

**Backend envoie:**
```
Success: 200 JSON
Error: 401/403/500 JSON
```

---

**Backend JWT est READY! 🚀 Teste maintenant avec le frontend!**
