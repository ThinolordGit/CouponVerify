#!/usr/bin/env node

/**
 * scripts/translate.js
 * Auto-translate en.json to other languages using free translation API
 * Usage: node scripts/translate.js --lang fr,es,de,it,pt,ja,zh,ko,ru
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Language codes to target
const DEFAULT_LANGS = ['fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'];

// Function to translate text using Google Translate API (free version)
async function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    if (targetLang === 'en') {
      resolve(text);
      return;
    }

    // Using mymemory translation API (free, no auth required)
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.responseStatus === 200 && result.responseData.translatedText) {
            resolve(result.responseData.translatedText);
          } else {
            resolve(text); // Fallback to English if translation fails
          }
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

// Recursively translate object keys and values
async function translateObject(obj, targetLang) {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      // Only translate if it contains actual text (not empty)
      if (obj.length > 0 && obj.length < 500) {
        return await translateText(obj, targetLang);
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, targetLang)));
  }

  const translated = {};
  for (const [key, value] of Object.entries(obj)) {
    translated[key] = await translateObject(value, targetLang);
  }
  return translated;
}

// Main function
async function main() {
  try {
    // Get languages from command line or use defaults
    const args = process.argv.slice(2);
    let langs = DEFAULT_LANGS;
    
    if (args.includes('--lang')) {
      const langIndex = args.indexOf('--lang');
      langs = args[langIndex + 1]?.split(',') || DEFAULT_LANGS;
    }

    // Read English translations
    const enPath = path.join(__dirname, '../src/locales/en.json');
    const enContent = fs.readFileSync(enPath, 'utf8');
    const enData = JSON.parse(enContent);

    console.log('🌐 Starting translation process...\n');
    console.log(`Source: en.json`);
    console.log(`Target languages: ${langs.join(', ')}\n`);

    // Translate to each language
    for (const lang of langs) {
      if (lang === 'en') continue;

      console.log(`📝 Translating to ${lang}...`);
      const translated = await translateObject(enData, lang);
      
      // Save translation file
      const langPath = path.join(__dirname, `../src/locales/${lang}.json`);
      fs.writeFileSync(langPath, JSON.stringify(translated, null, 2), 'utf8');
      console.log(`✅ Saved: locales/${lang}.json\n`);
    }

    console.log('🎉 Translation complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { translateText, translateObject };
