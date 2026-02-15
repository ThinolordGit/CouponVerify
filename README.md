# 🎁 GiftCard Verification Platform

Plateforme complète de vérification de coupons-cadeaux avec notifications push multi-devices et configuration d'email personnalisée.

---

## ⚡ Quick Start - Déploiement

### Installation Initiale
```bash
# 1. Installer les dépendances
composer install

# 2. Configurer .env (database, SMTP, VAPID keys)
cp .env.example .env
# ✏️ Éditer les variables d'environnement

# 3. Créer et initialiser la base de données
php install-database.php
```

### Résultat
```
✅ Database complètement initialisée
   ✓ 10 tables créées
   ✓ Admin par défaut: admin / admin
   ✓ 9 catégories + 8 coupons pré-configurés
```

---

## 🗂️ Structure du Projet

```
giftcloud/
├── api/                          # API Backend
│   ├── admin/                    # Admin endpoints
│   │   ├── notifications.php     # Push + SMTP config
│   │   └── router.php
│   ├── push.php                  # Push subscriptions & notifications
│   ├── verifications.php         # Verification API
│   └── ...
├── app/
│   ├── Services/                 # EmailService, PushNotificationService
│   ├── Controllers/              # Business logic
│   └── ...
├── config/                       # Database config
├── public/                       # Frontend (React build)
├── src/                          # Frontend React source
│   ├── pages/admin-settings/     # Admin settings page (notifications + SMTP)
│   ├── components/
│   ├── services/
│   └── ...
├── install-database.php          # ⭐ Installation complète (USE THIS)
├── DEPLOYMENT-GUIDE.md           # Guide détaillé de déploiement
├── ADMIN-NOTIFICATIONS-SYSTEM.md # Système de notifications admin
├── INSTALLATION-SUMMARY.md       # Résumé des changements
└── README.md                     # Ce fichier
```

---

## 🎯 Fonctionnalités Principales

### 👤 Utilisateurs
- ✅ Vérification de coupons-cadeaux
- ✅ Notifications push per-device (UUID unique)
- ✅ Dashboard utilisateur avec historique

### 👨‍💼 Admin
- ✅ Dashboard avec statistiques
- ✅ Gestion des vérifications (approver/rejeter)
- ✅ Push notifications multi-devices (identifiant "**")
- ✅ Configuration SMTP personnalisée
- ✅ Gestion des coupons et catégories

### 📱 Notifications
- ✅ Push notifications Web (ServiceWorker)
- ✅ Emails transactionnels (PHP Mailer + SMTP)
- ✅ Multi-device support
- ✅ Status tracking

---

## 🏗️ Architecture des Données

### Multi-Device UUID System
- **Utilisateurs normaux:** UUID unique par device (localStorage)
- **Admins:** UUID = "**" (tous les devices reçoivent notifications)

### Tables Principales
```
users                    → 👤 Utilisateurs
admin_users              → 👨‍💼 Admins
verifications            → 📋 Demandes de vérification
push_subscriptions       → 📲 Subscriptions push (incl. multi-device)
admin_config             → ⚙️ Configuration SMTP per-admin
```

---

## 🔐 Configuration

### Variables .env Essentielles
```bash
# Database
DB_HOST=localhost
DB_NAME=giftcloud
DB_USER=root
DB_PASSWORD=

# SMTP (pour les emails)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=xxx
SMTP_PASSWORD=xxx
SMTP_FROM_EMAIL=noreply@giftcard.local

# Push Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# URLs
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4028
```

### Admin Configuration (Post-Déploiement)
1. **Dashboard Admin:** `/admin-dashboard/settings`
2. **Onglet "Notifications":** Activer push pour multi-device
3. **Onglet "SMTP":** Configurer serveur email personnalisé

---

## 📊 Database Schema

### 10 Tables Finales
```
users                    → Utilisateurs normaux
admin_users              → Administrateurs
categories               → Catégories coupons
coupons                  → Coupons plateformes
verifications            → Demandes de vérification
push_subscriptions       → Souscriptions push notifications
push_notifications       → Historique notifications push
email_notifications      → Historique emails
activity_log             → Logs d'activité système
admin_config             → Configuration admin (SMTP, etc.)
```

**Créées automatiquement par:** `php install-database.php`

---

## 🚀 Redéploiement

Pour redéployer complètement (réinitialiser la BD):

```bash
# ⚠️ Backup d'abord!
mysqldump -u root -p giftcloud > backup-$(date +%Y%m%d).sql

# Réinitialiser
php install-database.php

# Reconfigurer
- Changer password admin
- Configurer SMTP
- Activer notifications
```

---

## 🧪 Testing

### Test Admin Notifications
1. Activer notifications admin: `/admin-dashboard/settings` → "Notifications"
2. Configurer SMTP: `/admin-dashboard/settings` → "SMTP"
3. Soumettre une vérification (frontend)
4. Vérifier notification push + email

### Endpoints API

#### Utilisateurs
```
GET  /api/verifications        → Historique utilisateur
POST /api/verifications/submit → Soumettre une vérification
GET  /api/push/public-key      → Public VAPID key
POST /api/push/subscribe       → S'inscrire aux notifications
```

#### Admin
```
GET  /api/admin/notifications/config           → Charger config SMTP
POST /api/admin/notifications/config-smtp      → Sauvegarder SMTP
POST /api/admin/notifications/push-subscribe   → Souscrire push admin
```

---

## 📚 Documentation Complète

- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Guide détaillé de déploiement
- **[ADMIN-NOTIFICATIONS-SYSTEM.md](ADMIN-NOTIFICATIONS-SYSTEM.md)** - Système notifications admin
- **[INSTALLATION-SUMMARY.md](INSTALLATION-SUMMARY.md)** - Résumé des changements

---

## 🛠️ Tech Stack

### Backend
- **PHP 7.4+** - Server-side logic
- **MySQL 8.0+** - Database
- **Composer** - Dependency management
- **PHPMailer** - Email service
- **Web Push** - Push notifications

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **JavaScript ServiceWorker** - Push notifications
- **Lucide Icons** - Icons

---

## ✅ Pre-Deployment Checklist

- [ ] Dépendances installées (`composer install`)
- [ ] `.env` configuré (DB, SMTP, VAPID keys)
- [ ] Base de données initialisée (`php install-database.php`)
- [ ] Password admin changé
- [ ] SMTP testé et configuré
- [ ] Frontend build & deployed
- [ ] ServiceWorker enregistré
- [ ] Logs vérifiés
- [ ] Backup effectué

---

## 🆘 Support

### Erreurs Courantes

**"Table already exists"**
→ Normal, l'installation réinitialise les tables

**"SMTP not sending emails"**
→ Vérifier config SMTP dans admin settings

**"Push notifications not working"**
→ Vérifier VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY dans .env

**Admin login failed**
→ Réinitialiser avec: `php install-database.php`

---

## 📝 License

Propriétaire - GiftCard Verification Platform 2026

---

**Version:** 2.0 - Installation Unique  
**Last Updated:** 2026-02-12  
**Status:** ✅ Production Ready
