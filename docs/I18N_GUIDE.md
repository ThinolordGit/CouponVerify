# Guide d'Internationalisation (i18n)

## 🌍 Langues Disponibles

Votre plateforme GiftCard Verify supporte maintenant **18 langues européennes** :

| Code | Langue | Drapeau | Fichier |
|------|--------|---------|---------|
| `en` | English | 🇬🇧 | en.json |
| `fr` | Français | 🇫🇷 | fr.json |
| `de` | Deutsch | 🇩🇪 | de.json |
| `es` | Español | 🇪🇸 | es.json |
| `it` | Italiano | 🇮🇹 | it.json |
| `pt` | Português | 🇵🇹 | pt.json |
| `nl` | Nederlands | 🇳🇱 | nl.json |
| `pl` | Polski | 🇵🇱 | pl.json |
| `sv` | Svenska | 🇸🇪 | sv.json |
| `da` | Dansk | 🇩🇰 | da.json |
| `el` | Ελληνικά | 🇬🇷 | el.json |
| `cs` | Čeština | 🇨🇿 | cs.json |
| `ro` | Română | 🇷🇴 | ro.json |
| `no` | Norsk | 🇳🇴 | no.json |
| `fi` | Suomi | 🇫🇮 | fi.json |
| `hu` | Magyar | 🇭🇺 | hu.json |
| `bg` | Български | 🇧🇬 | bg.json |
| `sk` | Slovenčina | 🇸🇰 | sk.json |

## 🚀 Ajouter une Nouvelle Langue

### Étape 1 : Créer le fichier de traduction

1. Créez un nouveau fichier dans `src/locales/` avec le code ISO de la langue (ex: `hr.json` pour le croate)
2. Copiez la structure de `en.json` comme base
3. Traduisez tous les textes dans la nouvelle langue

```json
{
  "common": {
    "appName": "GiftCard Verify",
    "loading": "Traduction...",
    "error": "Traduction...",
    ...
  },
  "navigation": { ... },
  "homepage": { ... }
}
```

### Étape 2 : Mettre à jour i18n.js

Ajoutez votre nouvelle langue dans `src/services/i18n.js` :

```javascript
// 1. Ajoutez l'import
import hr from '../locales/hr.json';

// 2. Ajoutez l'entrée dans AVAILABLE_LANGUAGES
const AVAILABLE_LANGUAGES = {
  ...
  hr: { name: 'Hrvatski', flag: '🇭🇷', data: hr },
};
```

### Étape 3 : Compiler et tester

```bash
npm run build
```

## 📝 Structure des Traductions

Chaque fichier de langue contient les sections suivantes :

- **common** : Éléments UI communs (boutons, labels, messages)
- **navigation** : Éléments de navigation
- **homepage** : Contenu de la page d'accueil
- **couponVerification** : Formulaire de vérification
- **adminDashboard** : Interface administrateur
- **adminUsers** : Gestion des utilisateurs
- **adminCoupons** : Gestion des coupons
- **adminCategories** : Gestion des catégories
- **errors** : Messages d'erreur
- **notifications** : Notifications système
- **status** : États et statuts

## 💡 Utilisation dans le Code

### Dans un composant React

```javascript
import { useTranslation } from '../../context/I18nContext';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('homepage.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### Avec des variables

```javascript
// Dans le fichier de langue
{
  "adminUsers": {
    "confirmDeleteMsg": "Are you sure you want to delete {name}?"
  }
}

// Dans le code
const message = t('adminUsers.confirmDeleteMsg').replace('{name}', userName);
```

## 🔄 Détection Automatique de la Langue

Le système détecte automatiquement la langue préférée de l'utilisateur :

1. **localStorage** : Vérifie si l'utilisateur a déjà choisi une langue
2. **Navigateur** : Utilise la langue du navigateur
3. **Par défaut** : Anglais si aucune correspondance

## 📊 Statistiques

- **18 langues** supportées
- **Couverture** : Plus de 500 millions d'européens
- **Sections** : 15+ sections traduites
- **Clés** : 200+ clés de traduction par langue

## 🌐 Langues Prioritaires pour Expansion

Si vous souhaitez ajouter plus de langues européennes :

- `hr` - Croate 🇭🇷
- `lt` - Lituanien 🇱🇹
- `lv` - Letton 🇱🇻
- `et` - Estonien 🇪🇪
- `sl` - Slovène 🇸🇮
- `mt` - Maltais 🇲🇹
- `ga` - Irlandais 🇮🇪
- `cy` - Gallois 🏴󠁧󠁢󠁷󠁬󠁳󠁿

## 🔧 Maintenance

Pour ajouter une nouvelle clé de traduction à toutes les langues :

1. Ajoutez la clé dans `en.json` (langue de référence)
2. Utilisez un service de traduction pour les autres langues
3. Mettez à jour tous les fichiers JSON correspondants
4. Testez dans au moins 3 langues différentes

## 📚 Ressources

- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [Unicode Flags](https://emojipedia.org/flags/)
- [React i18n Best Practices](https://react.i18next.com/)

---

**Note** : Les traductions actuelles sont des traductions de base. Pour une application en production, il est recommandé de faire vérifier les traductions par des locuteurs natifs.
