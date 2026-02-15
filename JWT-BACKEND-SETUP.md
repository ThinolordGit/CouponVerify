# 🔐 JWT Implementation - Backend Modifications

**Status:** Frontend modifié pour JWT ✅  
**Prochaine étape:** Modifier le backend PHP

---

## 📋 Modifications Backend Requises

Le frontend s'attend maintenant à:

```javascript
POST /api/admin/auth/login
Response:
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT token
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@couponverify.local",
      ...
    }
  }
}
```

---

## 🔑 JWT Secret Key

Tu dois avoir une **secret key** pour signer les tokens:

```php
// Dans .env ou config
JWT_SECRET=your-super-secret-key-change-this-in-production
```

**Exemple:**
```
JWT_SECRET=coupon_verify_jwt_secret_2026_super_secure
```

---

## 📝 Code Backend Requis

### 1. JWT Helper Class

Crée `app/Utils/JWTHelper.php`:

```php
<?php

namespace App\Utils;

class JWTHelper
{
    private static $secret = '';

    public static function init($secret)
    {
        self::$secret = $secret;
    }

    /**
     * Génère un JWT token
     */
    public static function generateToken($data, $expiresIn = 3600)
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload = array_merge(
            $data,
            [
                'iat' => time(), // issued at
                'exp' => time() + $expiresIn // expiration time
            ]
        );

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            self::$secret,
            true
        );
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }

    /**
     * Vérifie et décode un JWT token
     */
    public static function verifyToken($token)
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $headerEncoded = $parts[0];
        $payloadEncoded = $parts[1];
        $signatureEncoded = $parts[2];

        $signature = hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            self::$secret,
            true
        );
        $expectedSignature = self::base64UrlEncode($signature);

        // Verify signature
        if ($signatureEncoded !== $expectedSignature) {
            return false;
        }

        // Decode payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false; // Token expired
        }

        return $payload;
    }

    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
```

### 2. Modifier AuthController.php

```php
<?php

namespace App\Controllers;

use App\Utils\JWTHelper;
use App\Models\AdminUser;

class AuthController extends BaseController
{
    public function login()
    {
        // Get credentials
        $data = json_decode(file_get_contents("php://input"), true);
        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            return HTTPResponse::badRequest('Username and password required');
        }

        // Find user
        $adminUser = new AdminUser();
        $user = $adminUser->findByUsername($username);

        if (!$user) {
            return HTTPResponse::unauthorized('Invalid credentials');
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            return HTTPResponse::unauthorized('Invalid credentials');
        }

        // Check if active
        if (!$user['is_active']) {
            return HTTPResponse::forbidden('Account disabled');
        }

        // Initialize JWT
        JWTHelper::init(getenv('JWT_SECRET') ?: 'your-secret-key');

        // Generate JWT token
        $token = JWTHelper::generateToken([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ], 86400); // 24 hours

        // Update last login
        $adminUser->update($user['id'], [
            'last_login' => date('Y-m-d H:i:s')
        ]);

        return HTTPResponse::success('Logged in successfully', [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ]);
    }

    /**
     * Verify JWT token
     */
    public function check()
    {
        // Get token from Authorization header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? null;

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return HTTPResponse::unauthorized('No token provided');
        }

        $token = substr($authHeader, 7);

        // Initialize JWT
        JWTHelper::init(getenv('JWT_SECRET') ?: 'your-secret-key');

        // Verify token
        $payload = JWTHelper::verifyToken($token);

        if (!$payload) {
            return HTTPResponse::unauthorized('Invalid or expired token');
        }

        return HTTPResponse::success('Authenticated', [
            'authenticated' => true,
            'user' => $payload['user'] ?? $payload
        ]);
    }

    /**
     * Logout (JWT doesn't need server-side logout, but client clears token)
     */
    public function logout()
    {
        // With JWT, logout is client-side (clearing token)
        // You can optionally add token to blacklist here if needed
        return HTTPResponse::success('Logged out successfully');
    }
}
```

### 3. Middleware de Vérification JWT

Crée `app/Middleware/JWTAuth.php`:

```php
<?php

namespace App\Middleware;

use App\Utils\JWTHelper;

class JWTAuth
{
    public static function verify()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? null;

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }

        $token = substr($authHeader, 7);

        JWTHelper::init(getenv('JWT_SECRET') ?: 'your-secret-key');
        $payload = JWTHelper::verifyToken($token);

        if (!$payload) {
            return false;
        }

        // Store user info in $_SERVER for use in controller
        $_SERVER['AUTH_USER'] = $payload['user'] ?? $payload;

        return true;
    }
}
```

### 4. Protéger les Routes Admin

Dans ton contrôleur:

```php
<?php

// Avant chaque action admin
if (!JWTAuth::verify()) {
    return HTTPResponse::unauthorized('Authentication required');
}

// Maintenant $user = $_SERVER['AUTH_USER'];
```

---

## 🔄 Flux de Connexion JWT

```
1. Client envoie: POST /api/admin/auth/login
   Body: {username, password}

2. Backend valide credentials
   ✓ Crée JWT token (signé avec secret)
   ✓ Retourne:
     {
       "token": "eyJhbGciOiJIUzI1NiIs...",
       "user": {...}
     }

3. Client stocke token:
   localStorage.setItem('auth_token', token)

4. Client envoie requête suivante:
   GET /api/admin/dashboard
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

5. Backend vérifie token:
   ✓ Décode signature
   ✓ Vérifies expiration
   ✓ Retourne user data
```

---

## 📊 Avantages JWT vs Sessions

| Aspect | Sessions PHP | JWT |
|--------|-------------|-----|
| **Stockage** | Server-side | Client (localStorage) |
| **Stateless** | ❌ Non | ✅ Oui |
| **Scalabilité** | ❌ Difficile | ✅ Facile |
| **Cross-domain** | ❌ Cookies problématiques | ✅ Parfait |
| **Taille** | Petit cookie | Plus gros token |
| **Signature** | N/A | HMAC SHA256 |
| **Expiration** | Session timeout | `exp` claim |

---

## 🚀 Steps to Implement

### 1. Crée le JWT Helper
```
app/Utils/JWTHelper.php
```

### 2. Modifie AuthController.php
```
app/Controllers/AuthController.php
```

### 3. Crée le Middleware JWT
```
app/Middleware/JWTAuth.php
```

### 4. .env Configuration
```
JWT_SECRET=your-super-secret-key-here
```

### 5. Protège les routes admin
```php
if (!JWTAuth::verify()) {
    return HTTPResponse::unauthorized('Auth required');
}
```

### 6. Teste
```
Frontend teste la connexion → Reçoit JWT token → L'utilise pour futures requêtes
```

---

## 🧪 Test du JWT

### Via cURL

```bash
# 1. Login et reçois token
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {...}
# }

# 2. Utilise le token
TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Via Frontend Dev Console

```javascript
// Après login
console.log(localStorage.getItem('auth_token'))

// Devrait afficher:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwuLi59LGlhdCI...
```

---

## ⚠️ Sécurité JWT

### Production Changes

1. **HTTPS Only**
   ```
   Ne pas envoyer JWT en HTTP plain
   ```

2. **Secure Secret Key**
   ```
   Utilise random secret > 32 caractères
   Change en production
   ```

3. **Token Expiration**
   ```php
   86400 sec = 24 heures (peut être plus court)
   Considère refresh tokens pour long-term
   ```

4. **HttpOnly Cookies (Optional)**
   ```
   Pour extra sécurité, peux envoyer JWT via HttpOnly cookie
   Au lieu de localStorage
   ```

---

## 🔗 Frontend Dependencies

Le frontend s'attend à:

```javascript
// Login response
{
  "token": "...",  // JWT string
  "user": {        // Optional, for caching
    "id": 1,
    "username": "admin",
    ...
  }
}

// Check response
{
  "authenticated": true,
  "user": {
    "id": 1,
    ...
  }
}
```

---

## 📝 Checklist

- [ ] Créer JWTHelper.php
- [ ] Modifier AuthController.php pour générer JWT
- [ ] Créer JWTAuth middleware
- [ ] Configurer JWT_SECRET en .env
- [ ] Tester login (reçoit token)
- [ ] Tester utilisation du token (Authorization header)
- [ ] Tester expiration du token
- [ ] Protéger toutes les routes admin

---

**Une fois ces modifications faites, le frontend fonctionnera avec JWT!** 🚀
