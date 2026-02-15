#!/usr/bin/env node

/**
 * scripts/convert-to-i18n.js
 * Automatically convert JSX files to use i18n translations
 * 
 * Usage: node scripts/convert-to-i18n.js [--file path/to/file.jsx | --dir path/to/dir]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Common French to English translation mapping
const FRENCH_TRANSLATIONS = {
  'Vérifier un Coupon': 'homepage.startVerifying',
  'Vérifiez la Validité de Vos Coupons en Toute Sécurité': 'homepage.title',
  'CouponVerify vous permet de vérifier instantanément': 'homepage.heroDescription',
  'Comment ça marche': 'homepage.learnMore',
  'Vérifications': 'couponVerification.title',
  'Taux de Réussite': 'homepage.successRate',
  'Disponibilité': 'common.support',
  'Erreur lors du chargement': 'errors.loadingError',
  'Erreur': 'common.error',
  'Chargement': 'common.loading',
  'Succès': 'common.success',
  'Enregistrer': 'common.save',
  'Supprimer': 'common.delete',
  'Ajouter': 'common.add',
  'Modifier': 'common.edit',
  'Annuler': 'common.cancel',
  'Soumettre': 'common.submit',
  'Retour': 'common.back',
  'Accueil': 'common.home',
  'Paramètres': 'common.settings',
  'Aide': 'common.help',
  'Langue': 'common.language',
  'Rechercher': 'common.search',
  'Filtrer': 'common.filter',
  'Statut': 'common.status',
  'Date': 'common.date',
  'Heure': 'common.time',
  'Action': 'common.action',
  'Actions': 'common.actions',
  'Télécharger': 'common.download',
  'Importer': 'common.import',
  'Exporter': 'common.export',
  'Tableau de bord': 'navigation.dashboard',
  'Coupons': 'navigation.coupons',
  'Catégories': 'navigation.categories',
  'Vérifications': 'navigation.verifications',
  'Approbations': 'navigation.approved',
  'Rejetées': 'navigation.rejected',
  'Bloquées': 'navigation.blocked',
  'Configuration Email': 'navigation.emailConfig',
  'Paramètres Admin': 'navigation.adminSettings',
  'Utilisateurs': 'navigation.users',
  'Profil': 'navigation.profile'
};

function addI18nImport(content) {
  // Check if import already exists
  if (content.includes("from '../context/I18nContext'") || 
      content.includes("from './context/I18nContext'") ||
      content.includes('useTranslation')) {
    return content;
  }

  // Find the end of imports
  const importRegex = /^(import[\s\S]*?from\s+['"][^'"]+['"]\s*;)/m;
  const match = content.match(importRegex);

  if (match) {
    const lastImportEnd = match[0].lastIndexOf(';');
    const insertPosition = match[0].length;
    
    // Determine correct import path based on component type
    let importPath = '../context/I18nContext';
    if (content.includes('pages')) {
      const depthMatch = content.match(/from.*pages[\s\S]*?\.\./g);
      if (depthMatch) {
        const depth = (content.match(/\.\.\//g) || []).length;
        importPath = '../'.repeat(depth) + 'context/I18nContext';
      }
    }

    const newImport = `\nimport { useTranslation } from '${importPath}';`;
    return content.slice(0, insertPosition) + newImport + content.slice(insertPosition);
  }

  return content;
}

function addUseTranslationHook(content) {
  // Check if already exists
  if (content.includes('const { t } = useTranslation()')) {
    return content;
  }

  // Find component function/arrow function
  const funcRegex = /(const\s+\w+\s*=\s*(?:\(\)?\s*=>|function)|function\s+\w+\s*\()/;
  const match = content.match(funcRegex);

  if (match) {
    const funcStart = match.index;
    const funcLine = content.substring(funcStart, content.indexOf('\n', funcStart));
    const lineEnd = content.indexOf('\n', funcStart);
    
    // Find opening brace
    const braceIndex = content.indexOf('{', funcStart);
    const afterBrace = content.indexOf('\n', braceIndex);

    const indent = '  ';
    const newHook = `\n${indent}const { t } = useTranslation();`;
    
    return content.slice(0, afterBrace) + newHook + content.slice(afterBrace);
  }

  return content;
}

function replaceTextWithTranslations(content) {
  let result = content;

  for (const [french, key] of Object.entries(FRENCH_TRANSLATIONS)) {
    // Match both single and double quoted strings
    const escapedFrench = french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`['"](${escapedFrench})['"']`, 'g');
    
    // Replace with t('key')
    result = result.replace(regex, (match) => {
      return `{t('${key}')}`;
    });

    // Also replace in JSX text nodes (between > and <)
    const jsxRegex = new RegExp(`>\\s*${escapedFrench}\\s*<`, 'g');
    result = result.replace(jsxRegex, (match) => {
      return `>{t('${key}')}<`;
    });
  }

  return result;
}

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Add imports
  content = addI18nImport(content);

  // Add hook
  content = addUseTranslationHook(content);

  // Replace text
  content = replaceTextWithTranslations(content);

  // Only write if there were changes
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let updated = 0;

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.')) {
      updated += processDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.jsx') || file.endsWith('.js'))) {
      if (processFile(fullPath)) {
        updated++;
      }
    }
  });

  return updated;
}

function main() {
  const args = process.argv.slice(2);
  const fileArgIndex = args.indexOf('--file');
  const dirArgIndex = args.indexOf('--dir');

  let updated = 0;

  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    const filePath = args[fileArgIndex + 1];
    console.log(`\n📝 Processing file: ${filePath}`);
    if (processFile(filePath)) {
      updated = 1;
    }
  } else if (dirArgIndex !== -1 && args[dirArgIndex + 1]) {
    const dirPath = args[dirArgIndex + 1];
    console.log(`\n📁 Processing directory: ${dirPath}`);
    updated = processDirectory(dirPath);
  } else {
    // Default: process all src files
    const srcDir = path.join(__dirname, '../src');
    console.log(`\n📁 Processing entire src directory...`);
    updated = processDirectory(srcDir);
  }

  console.log(`\n✅ Completed! Updated ${updated} files.\n`);
}

if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
