#!/usr/bin/env node

/**
 * scripts/massive-i18n-conversion.js
 * Massive conversion: Add useTranslation hook to ALL JSX components
 * This scans all JSX files and adds the necessary imports and hooks
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

function addI18nHook(filepath, content) {
  // Skip if already has useTranslation
  if (content.includes('useTranslation')) {
    return content;
  }

  let modified = content;

  // Step 1: Find last import statement and add i18n import
  const lastImportMatch = content.match(/import\s+.*?from\s+['"][^'"]+['"]\s*;(?=\s*(const|function|class|export))/s);
  
  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    
    // Calculate correct import path depth
    const depth = filepath.split(path.sep).length - SRC_DIR.split(path.sep).length - 1;
    const importPath = '../'.repeat(depth) + 'context/I18nContext';
    
    const i18nImport = `\nimport { useTranslation } from '${importPath}';`;
    modified = modified.slice(0, insertPos) + i18nImport + modified.slice(insertPos);
  }

  // Step 2: Find first component function/arrow function and add hook
  // Look for: const X = () => { or const X = () => ( or function X()
  const componentRegex = /((?:const|function)\s+\w+\s*=\s*(?:\([^)]*\)\s*)?=>|function\s+\w+\s*\([^)]*\))\s*\{/;
  const componentMatch = modified.match(componentRegex);

  if (componentMatch) {
    const bracePosStart = componentMatch.index + componentMatch[0].lastIndexOf('{');
    const nextLine = modified.indexOf('\n', bracePosStart);
    
    // Don't add if already there
    if (!modified.substring(nextLine, nextLine + 100).includes('useTranslation')) {
      const indent = '  ';
      const hook = `\n${indent}const { t } = useTranslation();`;
      modified = modified.slice(0, nextLine) + hook + modified.slice(nextLine);
    }
  }

  return modified;
}

function processJSXFiles(dir, processed = { count: 0, files: [] }) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processJSXFiles(fullPath, processed);
    } else if ((file.endsWith('.jsx') || file.endsWith('.js')) && !file.startsWith('.')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const modified = addI18nHook(fullPath, content);

        if (modified !== content) {
          fs.writeFileSync(fullPath, modified, 'utf8');
          processed.count++;
          processed.files.push(path.relative(SRC_DIR, fullPath));
          console.log(`✓ ${path.relative(SRC_DIR, fullPath)}`);
        }
      } catch (err) {
        console.error(`✗ Error processing ${file}: ${err.message}`);
      }
    }
  });

  return processed;
}

function main() {
  console.log('\n🚀 Starting Massive i18n Conversion...\n');
  console.log('📁 Converting all JSX files in src/\n');

  const result = processJSXFiles(SRC_DIR);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Conversion Complete!`);
  console.log(`\nFiles updated: ${result.count}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the changes`);
  console.log(`2. Run: npm start`);
  console.log(`3. Check the app visually`);
  console.log(`4. Fix any remaining issues manually`);
  console.log(`5. Replace hardcoded French text: npm run i18n:validate:hardcoded\n`);
}

if (require.main === module) {
  main();
}

module.exports = { addI18nHook, processJSXFiles };
