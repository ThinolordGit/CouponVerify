#!/usr/bin/env node

/**
 * scripts/init-translations.js
 * Initialize translation system and generate all language files
 * 
 * Usage:
 *   node scripts/init-translations.js              # Generate default languages
 *   node scripts/init-translations.js --all        # Generate all available
 *   node scripts/init-translations.js --verify     # Only verify en.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const I18N_CONFIG = path.join(__dirname, '../i18n.config.json');

function ensureDirectories() {
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
    console.log('✅ Created locales directory');
  }
}

function verifyEnglish() {
  const enPath = path.join(LOCALES_DIR, 'en.json');
  
  if (!fs.existsSync(enPath)) {
    console.error('❌ Error: en.json not found');
    process.exit(1);
  }

  try {
    const content = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const keyCount = JSON.stringify(content).split('"').length / 2;
    console.log(`✅ en.json verified (${keyCount} keys)`);
    return true;
  } catch (e) {
    console.error('❌ Error parsing en.json:', e.message);
    process.exit(1);
  }
}

function verifyConfig() {
  if (!fs.existsSync(I18N_CONFIG)) {
    console.error('❌ Error: i18n.config.json not found');
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(I18N_CONFIG, 'utf8'));
    console.log(`✅ i18n.config.json verified`);
    return config;
  } catch (e) {
    console.error('❌ Error parsing i18n.config.json:', e.message);
    process.exit(1);
  }
}

function initializeTranslationSystem() {
  console.log('\n📝 Initializing Translation System\n');
  
  ensureDirectories();
  const config = verifyConfig();
  verifyEnglish();
  
  console.log(`\n📊 Available languages: ${Object.keys(config.i18n.supportedLanguages).join(', ')}`);
  console.log(`\n💾 Locales directory: ${LOCALES_DIR}`);
  console.log(`⚙️  Config file: ${I18N_CONFIG}`);
  
  console.log(`\n✨ To generate translations, run:`);
  console.log(`   node scripts/sync-translations.js --lang fr,es,de,it,pt,ru,ja,zh,ko`);
  console.log(`\n✨ Or auto-generate all:`);
  console.log(`   node scripts/sync-translations.js --auto`);
}

function listLanguages() {
  const config = JSON.parse(fs.readFileSync(I18N_CONFIG, 'utf8'));
  
  console.log('\n📚 Available Languages:\n');
  
  Object.entries(config.i18n.supportedLanguages).forEach(([code, lang]) => {
    const filePath = path.join(LOCALES_DIR, `${code}.json`);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '⏳';
    console.log(`  ${status} ${lang.flag} ${lang.name} (${code}) - ${lang.locale}`);
  });
  
  console.log();
}

function checkStatus() {
  console.log('\n📊 Translation System Status\n');
  
  const config = JSON.parse(fs.readFileSync(I18N_CONFIG, 'utf8'));
  
  verifyEnglish();
  
  let generatedCount = 0;
  let pendingCount = 0;
  
  Object.keys(config.i18n.supportedLanguages).forEach(code => {
    if (code === 'en') return;
    const filePath = path.join(LOCALES_DIR, `${code}.json`);
    if (fs.existsSync(filePath)) {
      generatedCount++;
    } else {
      pendingCount++;
    }
  });
  
  console.log(`\n📈 Statistics:`);
  console.log(`  ✅ Generated: ${generatedCount} languages`);
  console.log(`  ⏳ Pending: ${pendingCount} languages`);
  console.log(`  📝 Total: ${Object.keys(config.i18n.supportedLanguages).length} languages`);
  
  if (pendingCount > 0) {
    console.log(`\n💡 Tip: Generate remaining languages with:`);
    console.log(`   node scripts/sync-translations.js`);
  }
  
  console.log();
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--verify')) {
    verifyEnglish();
    console.log('✅ Verification complete\n');
    return;
  }
  
  if (args.includes('--list')) {
    ensureDirectories();
    verifyConfig();
    listLanguages();
    return;
  }
  
  if (args.includes('--status')) {
    ensureDirectories();
    checkStatus();
    return;
  }

  initializeTranslationSystem();
}

if (require.main === module) {
  main();
}

module.exports = {
  ensureDirectories,
  verifyEnglish,
  verifyConfig
};
