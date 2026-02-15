# 🌐 Complete i18n Setup - Implementation Guide

This guide walks you through implementing the complete internationalization system for the GiftCard Verify application.

## Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start](#quick-start)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Generating Translations](#generating-translations)
5. [Component Integration](#component-integration)
6. [Backend Integration](#backend-integration)
7. [Testing & Validation](#testing--validation)
8. [Deployment](#deployment)

---

## System Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│  Components use useTranslation() hook                        │
│         ↓                                                    │
│  I18nContext (React Context/Provider)                      │
│         ↓                                                    │
│  i18n Service (Singleton with localStorage)                │
│         ↓                                                    │
│  Translation Files (src/locales/*.json)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Backend (PHP)                             │
├─────────────────────────────────────────────────────────────┤
│  PHP APIs use Localization::t()                             │
│         ↓                                                    │
│  Localization Service (Static methods)                      │
│         ↓                                                    │
│  Translation API (api/localization.php)                    │
│         ↓ or ↓                                              │
│  Backend Translation Files (app/locales/*.json)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Configuration                               │
├─────────────────────────────────────────────────────────────┤
│  i18n.config.json - Language definitions and settings       │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Master Translation File** | `src/locales/en.json` | Single source of truth for all UI text (570+ keys) |
| **i18n Service** | `src/services/i18n.js` | Core translation engine with auto-detection |
| **React Context** | `src/context/I18nContext.jsx` | Makes translations available to components |
| **useTranslation Hook** | From context | Simple way to use translations in components |
| **useTranslationFormatted Hook** | `src/hooks/useTranslationFormatted.js` | Formatting helpers (dates, numbers, currencies) |
| **Translation Adapter** | `src/services/translationAdapter.js` | Backend integration and caching |
| **Language Switcher** | `src/components/ui/LanguageSwitcher.jsx` | UI dropdown for language selection |
| **Backend Service** | `app/Utils/Localization.php` | PHP translation support |
| **API Endpoints** | `api/localization.php` | HTTP endpoints for frontend-backend communication |
| **Configuration** | `i18n.config.json` | System-wide language definitions |

---

## Quick Start

### 1. Initialize the System (First Time Only)

```bash
# Verify everything is set up correctly
npm run i18n:init:verify

# List available languages
npm run i18n:init:list

# Check system status
npm run i18n:init:status
```

Expected output:
```
✅ en.json verified (570+ keys)
✨ To generate translations, run:
   npm run i18n:sync --lang fr,es,de,it,pt,ru,ja,zh,ko
```

### 2. Generate Additional Language Files

```bash
# Generate all default languages (recommended)
npm run i18n:sync

# Or generate specific languages
npm run i18n:sync -- --lang fr,es,de
```

This creates:
- `src/locales/fr.json` (French)
- `src/locales/es.json` (Spanish)
- `src/locales/de.json` (German)
- etc.

### 3. Start Using Translations in Components

```javascript
// In any React component
import { useTranslation } from '../context/I18nContext';

export function MyComponent() {
  const { t, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('homepage.title')}</h1>
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### 4. Add Language Switcher to App

```javascript
// In your header/navbar
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### 5. Test Language Selection

1. Open app in browser
2. Click language switcher dropdown
3. Select different language
4. Verify UI updates
5. Refresh page - language should persist

---

## Step-by-Step Implementation

### Phase 1: Frontend Setup (✅ Already Done)

- [x] Master translation file created (`en.json`)
- [x] i18n service implemented
- [x] React context and hook created
- [x] Language switcher component created
- [x] App.jsx wrapped with I18nProvider

**Status**: Ready to use

### Phase 2: Generate Language Files (❌ TODO)

**Estimated Time**: 2-5 minutes

```bash
npm run i18n:sync --lang fr,es,de,it,pt,ru,ja,zh,ko
```

**What happens**:
1. Reads `src/locales/en.json`
2. Translates each value to target language using free MyMemory API
3. Creates `.json` file for each language
4. Saves in `src/locales/` directory

**Output files**:
```
src/locales/
├── en.json      (existing - master)
├── fr.json      (newly created)
├── es.json      (newly created)
├── de.json      (newly created)
├── it.json      (newly created)
├── pt.json      (newly created)
├── ru.json      (newly created)
├── ja.json      (newly created)
├── zh.json      (newly created)
└── ko.json      (newly created)
```

### Phase 3: Update Components to Use Translations (❌ TODO)

**Estimated Time**: 4-6 hours

**Strategy**: Update components by page/feature

**Approach for each component**:

1. Import hook:
```javascript
import { useTranslation } from '../context/I18nContext';
```

2. Get translator:
```javascript
const { t } = useTranslation();
```

3. Replace hardcoded strings:

**Before:**
```javascript
<h1>Welcome to GiftCard Verify</h1>
<button>Submit</button>
```

**After:**
```javascript
<h1>{t('homepage.title')}</h1>
<button>{t('button.submit')}</button>
```

**Start with (Priority Order)**:
1. Homepage (`src/pages/homepage/`) - Most visible
2. Admin Dashboard (`src/pages/admin-dashboard/`) - Core feature
3. Coupon Verification (`src/pages/coupon-verification/`) - User-facing
4. User Dashboard (`src/pages/user-dashboard/`) - Important
5. Admin pages (others)

### Phase 4: Backend Integration (❌ TODO)

**Estimated Time**: 2-3 hours

**In PHP files**:

```php
use App\Utils\Localization;

// At start of request
Localization::init(); // Auto-detects from Accept-Language header

// In email services
$subject = Localization::t('emails.verificationPending');

// In API responses
return response()->json([
  'message' => Localization::t('errors.serverError')
]);

// With variables
$message = Localization::tReplace('emails.verificationBody', [
  'name' => $user->name,
  'approvalLink' => $approvalUrl
]);
```

**Files to update**:
- `app/Services/EmailService.php`
- `api/admin/*.php`
- `api/*.php` (all API endpoints returning user-facing messages)

### Phase 5: Testing & Validation (❌ TODO)

```bash
# Validate translation system
npm run i18n:validate

# Find hardcoded strings still in code
npm run i18n:validate:hardcoded

# Find unused translation keys
npm run i18n:validate:unused

# Complete system validation
npm run i18n:validate:all
```

### Phase 6: Deployment (❌ TODO)

- Build application normally: `npm run build`
- Deploy to server
- All translation files included in build
- localStorage persists language across sessions

---

## Generating Translations

### Automatic Translation (Recommended for Initial Setup)

```bash
# Generate all 10 languages
npm run i18n:sync

# Generate specific languages
npm run i18n:sync -- --lang fr,es,de

# Use auto-translation script directly
node scripts/sync-translations.js --lang fr,es,de,it,pt,ru,ja,zh,ko
```

**What it does**:
- Uses free MyMemory API
- No authentication required
- Translates all keys in `en.json` to target language
- Saves new `.json` file

**Quality Notes**:
- Free translation may be 80-90% accurate
- Technical terms might need manual review
- Recommended to review important translations manually
- See "Manual Translation Review" section below

### Manual Translation

**For specific language**:

1. Open `src/locales/[lang].json`
2. Edit translation values:

```json
{
  "button": {
    "submit": "Soumettre"  // Change English to French
  }
}
```

3. Save file
4. Refresh browser to see changes (automatic reload on language switch)

### Adding New Translation Keys

1. **Add to master file** (`src/locales/en.json`):

```json
{
  "myFeature": {
    "title": "My New Title",
    "description": "My new description"
  }
}
```

2. **Generate for all languages**:

```bash
npm run i18n:sync
```

3. **Use in component**:

```javascript
const { t } = useTranslation();
<h2>{t('myFeature.title')}</h2>
```

---

## Component Integration

### Basic Integration Pattern

```javascript
import { useTranslation } from '../context/I18nContext';

export function MyComponent() {
  const { t, tReplace } = useTranslation();

  return (
    <div>
      {/* Simple translation */}
      <h1>{t('page.title')}</h1>
      
      {/* With variable substitution */}
      <p>{tReplace('validationMessages.minLength', { 
        field: 'Password',
        min: 8 
      })}</p>
      
      {/* With default value if key not found */}
      <button>{t('button.save', 'Save')}</button>
    </div>
  );
}
```

### With Formatting

```javascript
import useTranslationFormatted from '../hooks/useTranslationFormatted';

export function StatsComponent() {
  const { 
    t, 
    formatDate, 
    formatCurrency, 
    formatNumber 
  } = useTranslationFormatted();

  return (
    <div>
      <p>{t('stats.totalSales')}: {formatCurrency(10000)}</p>
      <p>{t('stats.lastUpdate')}: {formatDate(new Date())}</p>
      <p>{t('stats.customers')}: {formatNumber(12345)}</p>
    </div>
  );
}
```

### With Language Switching

```javascript
export function LanguageSwitcher() {
  const { setLanguage, getAvailableLanguages } = useTranslation();
  const languages = getAvailableLanguages();

  return (
    <select onChange={(e) => setLanguage(e.target.value)}>
      {Object.entries(languages).map(([code, lang]) => (
        <option key={code} value={code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Common Component Patterns

**Navigation Menu**:
```javascript
const menu = [
  { label: t('navigation.dashboard'), href: '/dashboard' },
  { label: t('navigation.coupons'), href: '/coupons' },
  { label: t('navigation.settings'), href: '/settings' }
];
```

**Form Labels**:
```javascript
<label>{t('form.labels.email')}</label>
<input type="email" placeholder={t('form.labels.email')} />
```

**Buttons**:
```javascript
<button>{t('button.save')}</button>
<button>{t('button.cancel')}</button>
```

**Error Messages**:
```javascript
{error && <p className="error">{t('errors.' + error.code)}</p>}
```

---

## Backend Integration

### Initialize Localization in PHP

```php
use App\Utils\Localization;

// In your controller or API handler

// Option 1: Auto-detect from Accept-Language header
Localization::init();

// Option 2: Set specific language
Localization::init('fr');

// Option 3: Get current language
$currentLang = Localization::getCurrentLanguage();
```

### Using Translations in APIs

```php
// Simple translation
$message = Localization::t('errors.notFound');

// With variable replacement
$message = Localization::tReplace('validationMessages.required', [
  'field' => 'Email Address'
]);

// In API response
return response()->json([
  'success' => false,
  'message' => Localization::t('errors.unauthorized')
], 401);
```

### In Email Services

```php
use App\Utils\Localization;
use App\Services\EmailService;

class VerificationService {
  public function sendApprovalEmail($user) {
    Localization::init($user->preferred_language); // Use user's language
    
    $emailService = new EmailService();
    $emailService->send([
      'to' => $user->email,
      'subject' => Localization::t('emails.verificationApproved'),
      'body' => Localization::tReplace('emails.approvalBody', [
        'name' => $user->name,
        'couponName' => $coupon->name
      ])
    ]);
  }
}
```

### In Validation Messages

```php
$messages = [
  'email.required' => Localization::t('validationMessages.required'),
  'email.email' => Localization::t('validationMessages.email'),
  'password.min' => Localization::tReplace('validationMessages.minLength', [
    'field' => 'Password',
    'min' => 8
  ]),
  'password.confirmed' => Localization::t('validationMessages.passwordMismatch')
];

$validator = Validator::make($request->all(), [...], $messages);
```

---

## Testing & Validation

### Automated Validation

```bash
# Test JSON structure
npm run i18n:validate

# Find hardcoded English strings
npm run i18n:validate:hardcoded

# Find translation keys not used in code
npm run i18n:validate:unused

# Complete validation suite
npm run i18n:validate:all
```

### Manual Testing Checklist

**Language Switching**:
- [ ] Click language switcher in header
- [ ] Select different language
- [ ] UI updates immediately
- [ ] Language persists after page reload
- [ ] All text in selected language

**Language Detection**:
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Refresh page
- [ ] App detects browser language from Accept-Language header
- [ ] Correct language loaded

**Fallback Handling**:
- [ ] Disable network in DevTools
- [ ] Switch language
- [ ] Language still changes (uses cached data)
- [ ] Missing keys show key name (e.g., `unknown.key`)

**Format Testing** (with FormattedHook):
- [ ] Dates format correctly: `Apr 15, 2024` (EN) vs `15 avr. 2024` (FR)
- [ ] Numbers format correctly: `1,234.56` (EN) vs `1.234,56` (FR)
- [ ] Currency displays correctly: `$99.99` (EN) vs `€99,99` (FR)

### Browser Testing

**Test in different browsers**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Test on different devices**:
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

**Test with different language settings**:
- [ ] System language: English
- [ ] System language: Spanish
- [ ] System language: Chinese
- [ ] System language: Right-to-left (if implementing RTL)

---

## Deployment

### Pre-Deployment Checklist

```bash
# 1. Validate entire translation system
npm run i18n:validate:all

# 2. Build application
npm run build

# 3. Test production build locally
npm run serve
```

### Build Output

Translation files are included in build:
```
dist/
├── index.html
├── assets/
│   ├── app.js
│   ├── style.css
│   └── locales/
│       ├── en.json
│       ├── fr.json
│       ├── es.json
│       ├── de.json
│       ├── it.json
│       ├── pt.json
│       ├── ru.json
│       ├── ja.json
│       ├── zh.json
│       └── ko.json
```

### Server Deployment

1. **Frontend**:
   - Deploy `dist/` folder contents to web server
   - Translation files served as static assets
   - No special server configuration needed

2. **Backend** (PHP):
   - Copy new/updated translation files to backend `app/locales/` folder
   - Update API endpoints to call `Localization::t()`
   - No database changes needed

3. **Environment Variables** (Optional):
   ```
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

### Post-Deployment Testing

1. **Test in production**:
   - Open app in different languages
   - Verify all text translates correctly
   - Check language switcher works
   - Test API responses in different languages

2. **Monitor errors**:
   - Check browser console for missing key warnings
   - Monitor server logs for PHP errors
   - Check network tab for missing translation files

---

## Troubleshooting

### Problem: Translations not loading

**Check**:
1. Browser console for errors
2. Network tab for failed requests
3. localStorage for language setting: `localStorage.getItem('app_language')`
4. Verify translation files exist: `src/locales/*.json`

**Solution**:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Problem: Auto-translated text is incorrect

1. Edit translation file directly:
   ```
   src/locales/[lang].json
   ```
2. Improve the translation manually
3. Refresh page to see changes

### Problem: API returns English even when using different language

**PHP Backend**:
```php
// Make sure you're initializing Localization
use App\Utils\Localization;

Localization::init(); // This auto-detects from header
```

**Frontend API call**:
```javascript
// Include language in request or header
axios.get(url, {
  headers: {
    'Accept-Language': currentLanguage
  }
});
```

### Problem: Missing translation key shows `key.name` in UI

This is correct behavior - indicates:
1. Key not yet translated
2. Key name has typo
3. Language file incomplete

**Solution**:
1. Add missing key to master file (`en.json`)
2. Run: `npm run i18n:sync`
3. Verify key exists in target language file

---

## Best Practices

1. ✅ **Always use translation keys**, never hardcode UI text
2. ✅ **Test all languages** before releasing
3. ✅ **Use descriptive key names** (`homepage.title` not `h1_1`)
4. ✅ **Keep translations short** (avoid text overflow in UI)
5. ✅ **Use variables** for dynamic content (`tReplace()`)
6. ✅ **Validate system regularly** (`npm run i18n:validate`)
7. ✅ **Update master file first** then auto-generate
8. ✅ **Review auto-translations** for quality
9. ✅ **Test on mobile** - text length varies by language
10. ✅ **Document complex translations** for translators

---

## Support & Resources

- **Quick Commands**: See "Quick Start" section
- **Detailed Guide**: See [TRANSLATION_GUIDELINES.md](./TRANSLATION_GUIDELINES.md)
- **Core Files**: 
  - `src/services/i18n.js` - Translation engine
  - `src/context/I18nContext.jsx` - React integration
  - `app/Utils/Localization.php` - Backend service
- **Configuration**: `i18n.config.json`

---

## Timeline Estimate

| Phase | Task | Duration |
|-------|------|----------|
| 1 | ✅ Setup infrastructure | Complete |
| 2 | Generate language files | 5 min |
| 3 | Update components | 4-6 hrs |
| 4 | Backend integration | 2-3 hrs |
| 5 | Testing & validation | 2-3 hrs |
| **Total** | **Full i18n implementation** | **~12 hours** |

---

## Next Steps

1. **Run**: `npm run i18n:init:status` to check current status
2. **Generate**: `npm run i18n:sync` to create language files
3. **Start**: Update homepage component to use translations
4. **Test**: Use language switcher to verify functionality
5. **Expand**: Update remaining components incrementally

Good luck! 🌍
