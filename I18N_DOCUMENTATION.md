# 🌐 GiftCard Verify - Internationalization (i18n) System

## Overview

This system provides multilingual support with automatic language detection and Google Translate integration for seamless translations.

## System Architecture

```
src/
  ├── locales/
  │   ├── en.json          # English translations (master file)
  │   ├── fr.json          # French (auto-generated)
  │   ├── es.json          # Spanish (auto-generated)
  │   ├── de.json          # German (auto-generated)
  │   └── ... (other languages)
  │
  ├── services/
  │   └── i18n.js          # Core i18n service
  │
  ├── context/
  │   └── I18nContext.jsx   # React context & hook
  │
  ├── components/ui/
  │   └── LanguageSwitcher.jsx  # Language selector UI
  │
  └── ... (app components using translations)

scripts/
  └── translate.js         # Auto-translation script
```

## Key Features

✅ **Automatic Language Detection** - Detects user's browser language
✅ **Language Persistence** - Saves language preference to localStorage
✅ **React Context Integration** - Easy access via useTranslation hook
✅ **Nested Translation Keys** - Support for hierarchy (e.g., "homepage.title")
✅ **Variable Substitution** - Replace variables in translations
✅ **Extensible** - Easy to add new languages
✅ **Free Translation API** - Uses MyMemory (no API key required)

## Setup Instructions

### 1. Installation

The system is already integrated into the project. No additional packages needed for basic functionality.

For advanced automatic translation:
```bash
# Optional: Install for enhanced translation quality
npm install @vitalets/google-translate-api
```

### 2. Usage in Components

```javascript
import { useTranslation } from '../context/I18nContext';

function MyComponent() {
  const { t, tReplace, setLanguage, getAvailableLanguages } = useTranslation();

  return (
    <div>
      {/* Simple translation */}
      <h1>{t('homepage.title')}</h1>
      
      {/* Translation with variables */}
      <p>{tReplace('validationMessages.minLength', { min: 5 })}</p>
      
      {/* Language switcher */}
      <select onChange={(e) => setLanguage(e.target.value)}>
        {getAvailableLanguages().map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### 3. Translation File Structure (en.json)

```json
{
  "common": {
    "appName": "GiftCard Verify",
    "loading": "Loading..."
  },
  "homepage": {
    "title": "Welcome to GiftCard Verify",
    "subtitle": "Verify your gift cards"
  },
  "validationMessages": {
    "minLength": "This field must be at least {min} characters"
  }
}
```

## Adding New Languages

### Option 1: Manual Translation

1. Copy `src/locales/en.json` to `src/locales/XX.json` (where XX is language code)
2. Translate all values to target language
3. Update `src/services/i18n.js`:

```javascript
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

const AVAILABLE_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸', data: en },
  fr: { name: 'Français', flag: '🇫🇷', data: fr },
  es: { name: 'Español', flag: '🇪🇸', data: es },
};
```

### Option 2: Auto-Translation (Free)

```bash
# Translate to French, Spanish, German, Italian, Portuguese
node scripts/translate.js --lang fr,es,de,it,pt

# Or use default languages
node scripts/translate.js
```

This uses MyMemory API (free, no auth required) to automatically translate.

## Translation Keys Reference

### Common Keys
- `common.appName` - Application name
- `common.loading` - Loading indicator
- `common.error` - Error message
- `common.success` - Success indicator

### Navigation
- `navigation.dashboard` - Dashboard page
- `navigation.coupons` - Coupons management
- `navigation.verifications` - Verifications page

### Homepage
- `homepage.title` - Main title
- `homepage.heroDescription` - Hero section description
- `homepage.benefits` - Benefits section header
- ...

See `src/locales/en.json` for complete list.

## API Integration

### Translation Service Methods

```javascript
import i18nService from '../services/i18n';

// Get translation
i18nService.t('homepage.title');

// Replace variables
i18nService.tReplace('validation.minLength', { min: 5 });

// Get current language
i18nService.getCurrentLanguage(); // 'en'

// Set language
i18nService.setLanguage('fr');

// Get available languages
i18nService.getAvailableLanguages();

// Subscribe to language changes
const unsubscribe = i18nService.subscribe((newLang) => {
  console.log('Language changed to:', newLang);
});

// You can clean up with unsubscribe()
```

### React Hook

```javascript
const { 
  t,                          // Translate key
  tReplace,                   // Translate with variables
  language,                   // Current language code
  setLanguage,                // Change language
  getAvailableLanguages,      // Get all languages
  getCurrentLanguageName      // Get current language name
} = useTranslation();
```

## Best Practices

### 1. Keep Translations Organized
```json
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

### 2. Use Consistent Key Naming
- Use camelCase for keys
- Group related strings together
- Use descriptive names

### 3. Handle Missing Translations
```javascript
// Fallback to key name if translation missing
t('nonexistent.key') // Returns: 'nonexistent.key'

// Or provide default
t('nonexistent.key', 'Default text')
```

### 4. Translate Dynamic Content
```javascript
// ❌ Wrong: Hardcoded string
const message = `Hello ${userName}`;

// ✅ Right: Use translation with variables
const message = tReplace('greetings.hello', { name: userName });

// In en.json:
// "greetings": { "hello": "Hello {name}" }
```

## Language Detection Logic

1. **First Check**: localStorage.language (user's previous selection)
2. **Second Check**: navigator.language (browser language)
3. **Fallback**: English ('en')

Example:
```javascript
// Browser language: de-DE
// If German translation exists → Use German
// If only English exists → Use English
// User can switch anytime via language selector
```

## AutomaticTranslation API Options

### Current Implementation (MyMemory - Free)
- ✅ No API key required
- ✅ Free for all
- ⚠️ Limited to 100 requests/hour
- ⚠️ Basic translation quality

### Alternative: Google Translate API
- 💰 $20/month after 500k free characters
- 🎯 High quality translations
- 📊 Real-time API

To use Google Translate API:
```bash
npm install @vitalets/google-translate-api
```

Then update `scripts/translate.js` to use it.

### Alternative: LibreTranslate (Open Source)
- ✅ Free
- ✅ Can self-host
- ⚠️ Lower quality than Google

## Translating Existing Components

### Example: Homepage Component

```javascript
// BEFORE (hardcoded)
export default function Homepage() {
  return (
    <div>
      <h1>Welcome to GiftCard Verify</h1>
      <button>Start Verifying</button>
    </div>
  );
}

// AFTER (with translations)
import { useTranslation } from '../context/I18nContext';

export default function Homepage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('homepage.title')}</h1>
      <button>{t('homepage.startVerifying')}</button>
    </div>
  );
}
```

## Troubleshooting

### Missing Translation Key
```javascript
// Console shows: [i18n] Missing translation: homepage.missing
t('homepage.missing') // Returns: 'homepage.missing'

// Fix: Add to en.json
```

### Language Not Switching
```javascript
// Check localStorage
localStorage.getItem('language') // Should show language code

// Check if language exists
// Add console log in I18nContext
```

### Translation Not Updating
```javascript
// Ensure component uses useTranslation hook
// Component needs to re-render when language changes
// This happens automatically with the context
```

## Performance Optimization

### Code Splitting Translations
```javascript
// Load additional languages on demand
import('locales/fr.json').then(fr => {
  i18nService.addLanguage('fr', 'Français', '🇫🇷', fr.default);
});
```

### Lazy Load Components Using i18n
```javascript
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Component will have access to translations via context
```

## Contributing Translations

To contribute a new language:

1. Run auto-translation script:
```bash
node scripts/translate.js --lang xx
```

2. Review and improve translations in `src/locales/xx.json`

3. Test with app by selecting language in language switcher

4. Submit translations via pull request

## Supported Languages

Current languages in `src/locales/`:
- ✅ English (en.json) - Main reference
- (Add more after running translate script)

Available language codes and flags:
- `en` 🇺🇸 English
- `fr` 🇫🇷 French
- `es` 🇪🇸 Spanish
- `de` 🇩🇪 German
- `it` 🇮🇹 Italian
- `pt` 🇵🇹 Portuguese
- `ru` 🇷🇺 Russian
- `ja` 🇯🇵 Japanese
- `zh` 🇨🇳 Chinese (Simplified)
- `ko` 🇰🇷 Korean

## Environment-Specific Translations

For backend translations (PHP), create similar JSON files:

```php
// app/locales/en.json
{
  "emails": {
    "verification_pending": "Your verification is pending",
    "verification_approved": "Your verification has been approved"
  },
  "errors": {
    "database_error": "Database error occurred",
    "validation_failed": "Validation failed"
  }
}
```

Load in PHP:
```php
class LocalizationService {
  public static function t($key, $lang = 'en', $vars = []) {
    $path = __DIR__ . "/../locales/$lang.json";
    $translations = json_decode(file_get_contents($path), true);
    
    $value = $translations;
    foreach (explode('.', $key) as $k) {
      $value = $value[$k] ?? null;
    }
    
    // Replace variables
    foreach ($vars as $var => $val) {
      $value = str_replace('{'.$var.'}', $val, $value);
    }
    
    return $value ?? $key;
  }
}
```

## Getting Help

- 📖 See `en.json` for all available translation keys
- 🛠️ Check `I18nContext.jsx` for React integration
- 📝 Review `i18n.js` for service methods
- 🎨 Check `LanguageSwitcher.jsx` for UI component

---

**Status**: ✅ Ready for multilingual deployment
**Master Language**: English (en.json)
**Translation Method**: Hybrid (Manual + Auto)
**Free API**: MyMemory (no cost, no key required)
