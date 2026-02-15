#!/usr/bin/env node

/**
 * scripts/sync-translations.js
 * Syncronize translations between frontend and backend
 * Auto-generates translations using free MyMemory API
 * 
 * Usage: 
 *   node scripts/sync-translations.js                  # Uses default languages
 *   node scripts/sync-translations.js --lang fr,es,de  # Custom languages
 *   node scripts/sync-translations.js --auto            # Auto ALL available
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_LANGUAGES = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'];

// Translate single string using MyMemory API
async function translateText(text, targetLang, sourceLanguage = 'en') {
  if (targetLang === sourceLanguage) {
    return text;
  }

  return new Promise((resolve) => {
    // Don't translate empty strings or very short ones
    if (!text || text.length < 2) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLang}`;

    const request = https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
        // Limit response size
        if (data.length > 10000) {
          request.abort();
        }
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.responseStatus === 200 && result.responseData.translatedText) {
            resolve(result.responseData.translatedText);
          } else {
            resolve(text);
          }
        } catch (e) {
          resolve(text);
        }
      });
    });

    request.on('error', () => resolve(text));
    request.on('timeout', () => {
      request.abort();
      resolve(text);
    });
  });
}

// Recursively translate object
async function translateObject(obj, targetLang, depth = 0, maxDepth = 10) {
  // Prevent infinite recursion
  if (depth > maxDepth) return obj;

  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string' && obj.length > 0 && obj.length < 500) {
      return await translateText(obj, targetLang);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, targetLang, depth + 1, maxDepth)));
  }

  const translated = {};
  const keys = Object.keys(obj);
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    process.stdout.write(`\r  ├─ ${key} (${i + 1}/${keys.length})`);
    translated[key] = await translateObject(obj[key], targetLang, depth + 1, maxDepth);
  }
  
  return translated;
}

// Copy file from frontend to backend
function copyLocaleFile(lang) {
  const frontendPath = path.join(__dirname, `../src/locales/${lang}.json`);
  const backendPath = path.join(__dirname, `../../giftcloud/src/locales/${lang}.json`);

  if (!fs.existsSync(frontendPath)) {
    console.log(`  ⚠️  Frontend file not found: ${frontendPath}`);
    return false;
  }

  // Create backend locales directory if not exists
  const backendDir = path.dirname(backendPath);
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  fs.copyFileSync(frontendPath, backendPath);
  console.log(`  ✅ Copied: ${lang}.json to backend`);
  return true;
}

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    let langs = DEFAULT_LANGUAGES;
    let skipTranslation = false;

    if (args.includes('--lang')) {
      const langIndex = args.indexOf('--lang');
      langs = args[langIndex + 1]?.split(',') || DEFAULT_LANGUAGES;
      skipTranslation = false;
    }

    if (args.includes('--auto')) {
      skipTranslation = false;
    }

    if (args.includes('--copy-only')) {
      skipTranslation = true;
    }

    console.log('\n🌐 Synchronizing Translations\n');
    console.log(`📁 Target languages: ${langs.join(', ')}\n`);

    // Read English source
    const enPath = path.join(__dirname, '../src/locales/en.json');
    if (!fs.existsSync(enPath)) {
      console.error('❌ Error: en.json not found at', enPath);
      process.exit(1);
    }

    const enContent = fs.readFileSync(enPath, 'utf8');
    const enData = JSON.parse(enContent);

    let translationCount = 0;

    // Process each language
    for (const lang of langs) {
      if (lang === 'en') continue;

      console.log(`\n📝 Processing: ${lang}`);
      
      // Check if already exists
      const langPath = path.join(__dirname, `../src/locales/${lang}.json`);
      if (fs.existsSync(langPath) && !skipTranslation) {
        console.log(`  ℹ️  File exists, updating...`);
      }

      // Translate
      if (!skipTranslation) {
        console.log(`  🔄 Translating to ${lang}...`);
        const translated = await translateObject(enData, lang);
        
        // Save frontend
        fs.writeFileSync(langPath, JSON.stringify(translated, null, 2), 'utf8');
        console.log(`\n  ✅ Saved: src/locales/${lang}.json`);
        translationCount++;
      } else {
        console.log(`  ⏭️  Skipping translation (--copy-only)`);
      }

      // Copy to backend
      copyLocaleFile(lang);
    }

    console.log(`\n✅ Synchronization Complete!`);
    console.log(`📊 Total languages translated: ${translationCount}`);
    console.log(`✨ All translations synchronized between frontend and backend\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { translateText, translateObject };
