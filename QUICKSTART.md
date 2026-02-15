# 🚀 Guide de Démarrage - Système d'Authentification Admin

## ✅ État Actuel

- ✓ **Backend**: http://localhost:8000/api - Opérationnel
- ✓ **Frontend**: http://localhost:4028 - Opérationnel
- ✓ **Utilisateur Admin**: `admin` / `admin123` - Créé
- ✓ **Base de Données**: `coupon_verify` - Configurée
- ✓ **Sessions PHP**: Fonctionnelles
- ✓ **CORS**: Activé pour développement

---

## 🧪 Tester l'Authentification

### **Option 1: Depuis le Frontend React (Recommandé)** ⭐

Cette méthode est la meilleure pour tester car elle utilise le même context que ta vraie application.

1. **Va à la page de diagnostics:**
   ```
   http://localhost:4028/auth-test
   ```

2. **Clique les boutons dans cet ordre:**
   - `Test API` → Vérifie que le backend répond
   - `Test Login` → Essaie de te connecter avec admin:admin123
   - `Vérifier Session` → Confirme que la session est persistée
   - `Afficher Cookies` → Vérifies ce qui est stocké

3. **Résultats attendus:**
   - ✓ API OK
   - ✓ Connecté: admin (super_admin)
   - ✓ Session valide: admin
   - ✓ Cookies affichés

4. **Si tous les tests passent:**
   - Clique "Aller au Login" → http://localhost:4028/admin-login
   - Entre: admin / admin123
   - Tu devrais être redirigé au dashboard

---

## 🔑 Identifiants

```
Utilisateur: admin
Mot de passe: admin123
Rôle: super_admin
```

### Créer un autre admin (optionnel)

```bash
cd c:/laragon/www/giftcloud
php -S localhost:8000  # Si pas encore lancé

# Via script SQL
mysql -u root coupon_verify
```

SQL pour ajouter un admin:
```sql
INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
VALUES (
  'newadmin',
  'newadmin@couponverify.local',
  '$2y$10$...',  -- bcrypt hash of password
  'New Administrator',
  'admin',
  1
);
```

---

## 🛠️ Architecture

### Sessions PHP Cross-Origin

Le système utilise les sessions PHP avec les cookies pour persister l'authentification:

1. **Login Request** (POST /api/admin/auth/login)
   - Frontend envoie username + password
   - Backend valide et crée une session PHP
   - Retourne le user data + Set-Cookie header

2. **Session Persistence** (credentials: include)
   - Tous les requêtes fetch incluent `credentials: 'include'`
   - Le navigateur envoie automatiquement le cookie
   - Le backend lit la session depuis le cookie

3. **Verification** (GET /api/admin/auth/check)
   - Frontend vérifie si la session est toujours valide
   - Backend lit $_SESSION pour confirmer

### CORS Configuration

```
Frontend:  http://localhost:4028
Backend:   http://localhost:8000
Séparation: Nécessite CORS + Credentials
Cookies:   Envoyés automatiquement avec credentials: include
```

---

## 🐛 Troubleshooting

### Erreur: "Erreur de connexion"

**1. Vérifier que le backend est lancé:**
```powershell
cd c:/laragon/www/giftcloud
php -S localhost:8000
```

**2. Vérifier DevTools:**
- F12 → Network → POST /api/admin/auth/login
- Regarde la réponse (200 = OK)

### Erreur: "Identifiant ou mot de passe incorrect"

**1. Réinitialiser le mot de passe:**
```powershell
cd c:/laragon/www/giftcloud
php check-admin.php
```

**2. Vérifier en base de données:**
```bash
mysql -u root coupon_verify
SELECT username, is_active FROM admin_users;
```

### Erreur: "Pas de session active"

**Causes possibles:**

1. **Cookie non accepté** → F12 → Application → Cookies
   - Tu dois voir `coupon_verify_session`

2. **Backend crash** → Vérifier les logs:
   ```bash
   tail -50 c:/laragon/www/giftcloud/logs/error.log
   ```

3. **Frontend cache** → Ctrl+Shift+Del → Clear all

### Problème en production

Les sessions PHP en cross-origin avec SameSite=Lax peuvent ne pas fonctionner. Solutions:

1. **Mettre API et Frontend sur le même domaine**
   - Ex: `giftcloud.com/api` et `giftcloud.com`

2. **Utiliser JWT au lieu de sessions PHP**
   - Plus flexible pour cross-origin

3. **Configurer SameSite=None; Secure**
   - Nécessite HTTPS

---

## 📊 Points de Contrôle

- [ ] Backend démarre sur localhost:8000
- [ ] Frontend démarre sur localhost:4028
- [ ] Page de diagnostics accessible: /auth-test
- [ ] Test API passe
- [ ] Test Login passe
- [ ] Session valide après login
- [ ] Cookies visibles dans DevTools
- [ ] Redirection vers dashboard après login
- [ ] Protection des routes privées

---

## 📚 Fichiers Importants

```
Backend:
├── /api/admin/auth/login      → Endpoint login
├── /api/admin/auth/check      → Vérifier session
├── /api/admin/auth/logout     → Déconnexion
├── /app/Controllers/AuthController.php
└── /api/cors.php              → Configuration CORS

Frontend:
├── /src/pages/auth-diagnostics  → Page de test ⭐
├── /src/pages/admin-login       → Formulaire login
├── /src/components/PrivateRoute → Protection routes
├── /src/services/apiServices.js → Appels API
└── /src/services/api.js         → Config Axios
```

---

## 🎯 Prochaines Étapes

### Phase 1: Authentification ✅
- [x] Login endpoint fonctionnel
- [x] Gestion de sessions
- [x] Protection des routes
- [x] Page de test

### Phase 2: Fonctionnalités Admin (À faire)
- [ ] Dashboard complet
- [ ] Gestion des verifications (approve/reject)
- [ ] Gestion des coupons (CRUD)
- [ ] Email notifications

### Phase 3: Production
- [ ] Déployer sur un serveur
- [ ] Configurer HTTPS (sessions sécurisées)
- [ ] Configurer domaine client
- [ ] CI/CD pipeline

---

## 💡 Tips

1. **Développement rapide:**
   - Terminal 1: `cd c:/laragon/www/giftcloud && php -S localhost:8000`
   - Terminal 2: `cd c:\mySoft\JS\GiftCard && npm run dev`

2. **Debugging:**
   - F12 → Console → voir les erreurs
   - F12 → Network → voir les requêtes
   - F12 → Application → voir les cookies/localStorage

3. **Réinitialiser base de données:**
   ```bash
   mysql -u root coupon_verify < schema.sql
   php check-admin.php  # Crée admin user
   ```

---

## 📞 Support

Si tu as des problèmes:

1. **Exécute le diagnostic:**
   ```bash
   http://localhost:4028/auth-test
   ```

2. **Vérifies les logs:**
   ```bash
   cat c:/laragon/www/giftcloud/logs/error.log
   ```

3. **Réinitialise:**
   ```bash
   php check-admin.php
   ```

---

**🎉 Tout est prêt! Commence à tester maintenant sur http://localhost:4028/auth-test**
