# 📦 Guide d'Installation & Déploiement

## Vue d'ensemble

Le système de base de données **GiftCard Verification** a été restructuré pour un déploiement complet et propre.

Au lieu de multiples scripts de migration patchés, il y a maintenant **UN seul script d'installation** qui crée toutes les tables et données de base en une seule exécution.

---

## 🚀 Installation Initiale

### Prérequis
- PHP 7.4+
- MySQL 8.0+
- PDO MySQL extension
- Composer (pour les dépendances)

### Étapes d'Installation

#### 1. **Installation des Dépendances**
```bash
cd /chemin/vers/giftcloud
composer install
```

#### 2. **Configuration Environnement**
Copier et configurer `.env`:
```bash
# Database
DB_HOST=localhost
DB_NAME=giftcloud
DB_USER=root
DB_PASSWORD=password

# SMTP
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_email@mailtrap.io
SMTP_PASSWORD=votre_password
SMTP_FROM_EMAIL=noreply@giftcard.local

# Push Notifications
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4028
```

#### 3. **Installation de la Base de Données**
```bash
php install-database.php
```

**Output attendu:**
```
╔════════════════════════════════════════════════════════════════╗
║         Installation Complète de la Base de Données            ║
║                    GiftCard Verification                       ║
╚════════════════════════════════════════════════════════════════╝

✅ Installation terminée avec succès!

═══════════════════════════════════════════════════════════════
📋 Résumé:
   ✓ 10 tables créées
   ✓ 1 administrateur par défaut: admin / admin
   ✓ 9 catégories ajoutées
   ✓ 8 coupons par défaut ajoutés
═══════════════════════════════════════════════════════════════
```

---

## 📊 Schéma de la Base de Données

### Tables Créées

1. **users** - Utilisateurs normaux
2. **admin_users** - Utilisateurs administrateurs
3. **categories** - Catégories de coupons
4. **coupons** - Coupons de plateforme
5. **verifications** - Demandes de vérification
6. **push_subscriptions** - Souscriptions push notifications
7. **push_notifications** - Historique push notifications
8. **email_notifications** - Historique email notifications
9. **activity_log** - Logs d'activité système
10. **admin_config** - Configuration admin (SMTP personnalisé)

### Migrations Intégrées

✅ **Non plus de migrations séparées!** Tout est dans `install-database.php`:

- UUID multi-device support (user_uuid)
- Admin identifier "**" pour multi-devices
- SMTP configuration personnalisée par admin
- Toutes les colonnes nécessaires
- Tous les indexes pour performance
- Toutes les clés étrangères

---

## 👤 Données par Défaut

### Admin User
- **Username:** `admin`
- **Password:** `admin` (À CHANGER IMMÉDIATEMENT!)
- **Email:** `admin@giftcard.local`
- **Role:** `super_admin`

### Catégories (9)
- iTunes
- Google Play
- Amazon
- PlayStation
- Xbox
- Netflix
- Spotify
- Steam
- Other

### Coupons Pré-créés (8)
Un coupon pour chaque plateforme principale avec:
- Nom et slug
- Couleur thème
- Devises supportées (USD, EUR, GBP)
- Tous configurés et actifs

---

## 🔧 Redéploiement Complet

Si vous avez besoin de **réinitialiser la base de données** complètement:

```bash
php install-database.php
```

⚠️ **ATTENTION:** Ceci supprimera TOUTES les données existantes et recrée les tables à zéro.

Si vous avez des données de production à conserver:
1. **Backup d'abord:**
   ```bash
   mysqldump -u root -p giftcloud > backup-$(date +%Y%m%d).sql
   ```

2. **Réexécuter l'installation:**
   ```bash
   php install-database.php
   ```

---

## 🔐 Configuration Post-Installation

### 1. Changer le Mot de Passe Admin
```bash
# Via interface admin à /admin-dashboard
# OU directement en PHP
php -r "
require 'config/database.php';
\$password = password_hash('votre_nouveau_password', PASSWORD_BCRYPT);
\$pdo->exec(\"UPDATE admin_users SET password_hash = '\$password' WHERE id = 1\");
echo 'Password changed!';
"
```

### 2. Configurer SMTP
Dans l'interface admin:
1. Aller à `/admin-dashboard/settings`
2. Onglet "Configuration SMTP"
3. Entrer vos paramètres SMTP
4. Sauvegarder

### 3. Ajouter Logos & Images
1. Uploader les images dans `/public/images/coupons/`
2. Mettre à jour les coupons avec les chemins d'images

### 4. Activer Push Notifications (Admin)
1. Aller à `/admin-dashboard/settings`
2. Onglet "Notifications"
3. Cliquer "Activer les notifications"
4. Autoriser dans le navigateur

---

## 📋 Fichiers Importants

### Installation
- **`install-database.php`** - ✅ Script d'installation (À CONSERVER)

### Nettoyage
- `cleanup-temp-files.sh` - Script bash (Linux/Mac)
- `cleanup-temp-files.bat` - Script batch (Windows)
- `cleanup-temp-files.ps1` - Script PowerShell (Windows)

**Ces scripts ne sont que pour le développement et peuvent être supprimés après déploiement.**

---

## 🗑️ Fichiers Supprimés (Ancien Système)

Les fichiers suivants ont été **SUPPRIMÉS** car remplacés par `install-database.php`:

### Anciennes Migrations
- ❌ migrate-admin-config.php
- ❌ migrate-push-subscriptions-uuid.php
- ❌ migrate-push-subscriptions.php
- ❌ migrate-verification-uuid.php

### Anciens Scripts de Test
- ❌ 30+ fichiers de test et debug

**Raison:** Système de migration unique et complet au lieu de patchs multiples.

---

## 🆘 Troubleshooting

### Erreur: "Table already exists"
```
Solution: C'est normal si vous réexécutez l'installation.
Le script supprime les tables avant de les recréer.
Si vous voulez garder les données, faites d'abord un backup.
```

### Admin credentials not working
```
Solution: Rétablir par défaut:
php -r "
require 'config/database.php';
\$hash = password_hash('admin', PASSWORD_BCRYPT);
UPDATE admin_users SET password_hash = '\$hash' WHERE id = 1";
"
```

### Push Notifications not working
```
Solution: Vérifier VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans .env
Générer nouvelles clés si nécessaire:
https://web-push-codelab.glitch.me/
```

### SMTP emails not sending
```
Solution:
1. Vérifier configuration SMTP dans admin settings
2. Tester connexion SMTP
3. Vérifier firewall port (par défaut 2525)
4. Vérifier credentials SMTP
```

---

## ✅ Checklist de Déploiement

- [ ] Database installée: `php install-database.php`
- [ ] Mot de passe admin changé (pas `admin`)
- [ ] Variables `.env` configurées
- [ ] SMTP testé et configuré
- [ ] Clés VAPID générées et stockées
- [ ] Frontend & backend déployés
- [ ] ServiceWorker enregistré et actif
- [ ] Tests de notification effectués
- [ ] Logs d'erreur vérifiés
- [ ] Backup base de données fait

---

## 📞 Support

Pour des problèmes lors du déploiement:
1. Vérifier les logs: `tail -f /path/to/giftcloud/logs/`
2. Tester la connexion DB
3. Vérifier permissions des fichiers
4. Consulter la documentation technique

---

**Version:** 2.0 - Système Installation Unique
**Dernière mise à jour:** 2026-02-12
