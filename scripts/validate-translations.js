#!/usr/bin/env node

/**
 * scripts/validate-translations.js
 * Validate translation system and find untranslated strings
 * 
 * Usage:
 *   node scripts/validate-translations.js --check           # Basic validation
 *   node scripts/validate-translations.js --find-hardcoded  # Find hardcoded strings
 *   node scripts/validate-translations.js --missing-keys    # Find missing keys
 *   node scripts/validate-translations.js --unused-keys     # Find unused keys
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SRC_DIR = path.join(__dirname, '../src');

class TranslationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalKeys: 0,
      totalLanguages: 0,
      filesChecked: 0,
      keysUsed: new Set(),
      keysFound: new Set()
    };
  }

  /**
   * Validate JSON structure
   */
  validateJsonStructure() {
    console.log('\n📋 Validating JSON Structure\n');

    if (!fs.existsSync(LOCALES_DIR)) {
      this.errors.push('Locales directory not found: ' + LOCALES_DIR);
      return;
    }

    const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
    this.stats.totalLanguages = files.length;

    files.forEach(file => {
      const filePath = path.join(LOCALES_DIR, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const keyCount = this.countKeys(content);
        this.stats.totalKeys += keyCount;
        this.stats.keysFound.add(file.replace('.json', ''));
        
        console.log(`  ✅ ${file} (${keyCount} keys)`);

        // Check for empty values
        this.checkEmptyValues(content, file);

      } catch (e) {
        this.errors.push(`Invalid JSON in ${file}: ${e.message}`);
        console.log(`  ❌ ${file}: ${e.message}`);
      }
    });
  }

  /**
   * Count keys recursively
   */
  countKeys(obj, count = 0) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count = this.countKeys(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * Check for empty values
   */
  checkEmptyValues(obj, file, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.checkEmptyValues(obj[key], file, fullKey);
      } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
        this.warnings.push(`Empty value in ${file}: ${fullKey}`);
      }
    }
  }

  /**
   * Check translation consistency between languages
   */
  validateConsistency() {
    console.log('\n🔄 Validating Consistency Between Languages\n');

    const files = fs.readdirSync(LOCALES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        lang: f.replace('.json', ''),
        path: path.join(LOCALES_DIR, f)
      }));

    if (files.length < 2) {
      console.log('  ⓘ Only one language file found. Skipping consistency check.');
      return;
    }

    const enFile = files.find(f => f.lang === 'en');
    if (!enFile) {
      this.warnings.push('English (en.json) not found as reference');
      return;
    }

    const enData = JSON.parse(fs.readFileSync(enFile.path, 'utf8'));
    const enKeys = this.extractAllKeys(enData);

    files.forEach(file => {
      if (file.lang === 'en') return;

      const data = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      const fileKeys = this.extractAllKeys(data);

      // Find missing keys
      const missingKeys = enKeys.filter(k => !fileKeys.has(k));
      if (missingKeys.length > 0) {
        this.warnings.push(
          `${file.lang}.json missing keys: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? ` (+${missingKeys.length - 3} more)` : ''}`
        );
      }

      // Find extra keys
      const extraKeys = Array.from(fileKeys).filter(k => !enKeys.has(k));
      if (extraKeys.length > 0) {
        this.warnings.push(
          `${file.lang}.json has extra keys: ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? ` (+${extraKeys.length - 3} more)` : ''}`
        );
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(`  ✅ ${file.lang}.json matches en.json structure`);
      } else {
        console.log(`  ⚠️  ${file.lang}.json has inconsistencies`);
      }
    });
  }

  /**
   * Extract all keys from nested object
   */
  extractAllKeys(obj, prefix = '') {
    const keys = new Set();

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedKeys = this.extractAllKeys(obj[key], fullKey);
        nestedKeys.forEach(k => keys.add(k));
      } else {
        keys.add(fullKey);
        this.stats.keysUsed.add(fullKey);
      }
    }

    return keys;
  }

  /**
   * Find hardcoded strings in components
   */
  findHardcodedStrings() {
    console.log('\n🔍 Searching for Hardcoded Strings\n');

    const jsxPattern = /["']([A-Z][a-zA-Z0-9\s,.\-:()&/@]+)["']/g;
    const commonStrings = [
      'Loading',
      'Error',
      'Success',
      'Cancel',
      'Submit',
      'Save',
      'Delete',
      'Edit',
      'Add',
      'Search',
      'Filter',
      'Export',
      'Import',
      'Close'
    ];

    let filesChecked = 0;
    let suspiciousFound = 0;

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules') return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for common hardcoded strings
          commonStrings.forEach(str => {
            if (content.includes(`"${str}"`) || content.includes(`'${str}'`)) {
              if (!content.includes(`t('`) && !content.includes('tReplace(')) {
                suspiciousFound++;
                if (suspiciousFound <= 10) {
                  const match = content.includes(`"${str}"`) ? `"${str}"` : `'${str}'`;
                  console.log(`  ⚠️  Possible hardcoded string: ${match} in ${path.relative(SRC_DIR, fullPath)}`);
                }
              }
            }
          });

          filesChecked++;
        }
      });
    };

    walkDir(SRC_DIR);
    this.stats.filesChecked = filesChecked;

    console.log(`\n  📊 Files checked: ${filesChecked}`);
    console.log(`  ⚠️  Suspicious hardcoded strings: ${suspiciousFound}`);
  }

  /**
   * Find translations not used in code
   */
  findUnusedTranslations() {
    console.log('\n📦 Analyzing Unused Translations\n');

    const enPath = path.join(LOCALES_DIR, 'en.json');
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const definedKeys = this.extractAllKeys(enData);

    let filesChecked = 0;
    const usedKeys = new Set();

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules' || file === 'locales') return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.php')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Find all t('...')  calls
          const matches = content.matchAll(/t\(['"]([^'"]+)['"]\)/g);
          for (const match of matches) {
            usedKeys.add(match[1]);
          }

          filesChecked++;
        }
      });
    };

    walkDir(SRC_DIR);

    const unusedKeys = Array.from(definedKeys).filter(k => !usedKeys.has(k));

    if (unusedKeys.length > 0) {
      console.log(`  ℹ️  Found ${unusedKeys.length} possibly unused translations`);
      console.log(`  (First 10):`);
      unusedKeys.slice(0, 10).forEach(key => {
        console.log(`    - ${key}`);
      });
    } else {
      console.log(`  ✅ All translations appear to be used`);
    }

    console.log(`\n  📊 Files scanned: ${filesChecked}`);
    console.log(`  📝 Keys defined: ${definedKeys.size}`);
    console.log(`  🔗 Keys used: ${usedKeys.size}`);
  }

  /**
   * Generate validation report
   */
  report() {
    console.log('\n📊 VALIDATION REPORT\n');
    console.log('═'.repeat(50));

    if (this.errors.length === 0) {
      console.log('✅ No critical errors found');
    } else {
      console.log(`❌ ${this.errors.length} critical error(s):`);
      this.errors.forEach(e => console.log(`  • ${e}`));
    }

    console.log();

    if (this.warnings.length === 0) {
      console.log('✅ No warnings found');
    } else {
      console.log(`⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.slice(0, 10).forEach(w => console.log(`  • ${w}`));
      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more`);
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`\n📈 Statistics:`);
    console.log(`  Languages: ${this.stats.totalLanguages}`);
    console.log(`  Total keys: ${this.stats.totalKeys}`);
    console.log(`  Files checked: ${this.stats.filesChecked}`);
    console.log(`\n✨ Validation complete!\n`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const validator = new TranslationValidator();

  console.log('\n🌐 Translation System Validator\n');

  if (args.includes('--check')) {
    validator.validateJsonStructure();
    validator.validateConsistency();
    validator.report();
  } else if (args.includes('--find-hardcoded')) {
    validator.findHardcodedStrings();
  } else if (args.includes('--unused-keys')) {
    validator.findUnusedTranslations();
  } else if (args.includes('--all')) {
    validator.validateJsonStructure();
    validator.validateConsistency();
    validator.findHardcodedStrings();
    validator.findUnusedTranslations();
    validator.report();
  } else {
    // Default: run basic validation
    validator.validateJsonStructure();
    validator.validateConsistency();
    validator.report();
  }
}

if (require.main === module) {
  main();
}

module.exports = TranslationValidator;
