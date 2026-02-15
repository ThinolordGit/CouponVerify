#!/usr/bin/env node

/**
 * Translation System Status Report
 * 
 * Run: node scripts/generate-status-report.js
 * This generates a comprehensive status report of the translation system.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const I18N_CONFIG = path.join(__dirname, '../i18n.config.json');

function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          TRANSLATION SYSTEM - IMPLEMENTATION STATUS           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Load configurations
  const config = JSON.parse(fs.readFileSync(I18N_CONFIG, 'utf8'));
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  // Count statistics
  let totalKeys = 0;
  const countKeys = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        countKeys(obj[key]);
      } else {
        totalKeys++;
      }
    }
  };
  countKeys(enData);

  // Check for language files
  const languages = Object.keys(config.i18n.supportedLanguages);
  const availableFiles = languages.filter(lang => {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    return fs.existsSync(filePath);
  });

  const pendingLanguages = languages.filter(lang => !availableFiles.includes(lang));

  console.log('📊 SYSTEM STATISTICS\n');
  console.log(`  Total Supported Languages: ${languages.length}`);
  console.log(`  Generated Languages: ${availableFiles.length}`);
  console.log(`  Pending Languages: ${pendingLanguages.length}`);
  console.log(`  Total Translation Keys: ${totalKeys}`);
  console.log();

  console.log('✅ GENERATED LANGUAGES\n');
  availableFiles.forEach(lang => {
    const langInfo = config.i18n.supportedLanguages[lang];
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    const fileSize = fs.statSync(filePath).size;
    console.log(`  ${langInfo.flag} ${langInfo.name.padEnd(12)} (${lang}) - ${fileSize} bytes`);
  });

  if (pendingLanguages.length > 0) {
    console.log('\n⏳ PENDING LANGUAGES\n');
    pendingLanguages.forEach(lang => {
      const langInfo = config.i18n.supportedLanguages[lang];
      console.log(`  ${langInfo.flag} ${langInfo.name} (${lang})`);
    });
  }

  console.log('\n📁 TRANSLATION KEYS BY SECTION\n');
  const sections = Object.keys(enData);
  const sectionStats = [];
  
  let maxNameLen = 0;
  Object.entries(enData).forEach(([section, data]) => {
    let keyCount = 0;
    const countSection = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          countSection(obj[key]);
        } else {
          keyCount++;
        }
      }
    };
    countSection(data);
    
    sectionStats.push({ section, keyCount });
    if (section.length > maxNameLen) {
      maxNameLen = section.length;
    }
  });

  sectionStats
    .sort((a, b) => b.keyCount - a.keyCount)
    .forEach(({ section, keyCount }) => {
      const bar = '█'.repeat(Math.floor(keyCount / 10));
      console.log(`  ${section.padEnd(maxNameLen)} │ ${bar.padEnd(50)} ${keyCount} keys`);
    });

  console.log('\n🔧 HELPER SCRIPTS\n');
  console.log('  npm run i18n:init              - Initialize system');
  console.log('  npm run i18n:init:list         - List available languages');
  console.log('  npm run i18n:init:status       - Check current status');
  console.log('  npm run i18n:init:verify       - Verify en.json');
  console.log('  npm run i18n:sync              - Auto-generate languages');
  console.log('  npm run i18n:validate          - Validate system');
  console.log('  npm run i18n:validate:hardcoded - Find hardcoded strings');
  console.log('  npm run i18n:validate:unused    - Find unused keys');
  console.log('  npm run i18n:validate:all       - Complete validation');

  console.log('\n📖 DOCUMENTATION\n');
  console.log('  TRANSLATION_SYSTEM_README.md     - Overview (START HERE)');
  console.log('  TRANSLATION_QUICK_REFERENCE.md   - Quick reference');
  console.log('  I18N_COMPLETE_SETUP.md           - Step-by-step guide');
  console.log('  TRANSLATION_GUIDELINES.md        - Best practices');
  console.log('  IMPLEMENTATION_CHECKLIST.md      - Progress tracker');

  console.log('\n🚀 QUICK START\n');
  if (pendingLanguages.length > 0) {
    console.log(`  1. Generate missing languages:`);
    console.log(`     npm run i18n:sync --lang ${pendingLanguages.join(',')}`);
    console.log();
  }
  console.log(`  2. Add language switcher to header:`);
  console.log(`     import LanguageSwitcher from './components/ui/LanguageSwitcher';`);
  console.log();
  console.log(`  3. Update components to use translations:`);
  console.log(`     const { t } = useTranslation();`);
  console.log(`     <h1>{t('page.title')}</h1>`);
  console.log();
  console.log(`  4. Build and deploy:`);
  console.log(`     npm run build`);

  console.log('\n' + '═'.repeat(60));
  console.log('\n✨ Translation system is ready for implementation!\n');
}

try {
  generateReport();
} catch (error) {
  console.error('Error generating report:', error.message);
  process.exit(1);
}
