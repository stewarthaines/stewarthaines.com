#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple PO file parser
function parsePoFile(poContent) {
  const translations = {};
  const lines = poContent.split('\n');
  
  let currentMsgid = null;
  let currentMsgstr = null;
  let inMsgid = false;
  let inMsgstr = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') {
      continue;
    }
    
    // Start of msgid
    if (line.startsWith('msgid ')) {
      if (currentMsgid && currentMsgstr !== null) {
        // Save previous translation
        if (currentMsgid && currentMsgstr) {
          translations[currentMsgid] = currentMsgstr;
        }
      }
      
      currentMsgid = line.substring(6).replace(/^"/, '').replace(/"$/, '');
      currentMsgstr = null;
      inMsgid = true;
      inMsgstr = false;
      continue;
    }
    
    // Start of msgstr
    if (line.startsWith('msgstr ')) {
      currentMsgstr = line.substring(7).replace(/^"/, '').replace(/"$/, '');
      inMsgid = false;
      inMsgstr = true;
      continue;
    }
    
    // Continuation lines (quoted strings)
    if (line.startsWith('"') && line.endsWith('"')) {
      const content = line.substring(1, line.length - 1);
      if (inMsgid && currentMsgid !== null) {
        currentMsgid += content;
      } else if (inMsgstr && currentMsgstr !== null) {
        currentMsgstr += content;
      }
      continue;
    }
  }
  
  // Don't forget the last translation
  if (currentMsgid && currentMsgstr !== null) {
    if (currentMsgid && currentMsgstr) {
      translations[currentMsgid] = currentMsgstr;
    }
  }
  
  return translations;
}

// Get list of supported languages
const languages = require('../src/_data/languages.js').map(l => l.code);

console.log(`Converting .po files to JSON for languages: ${languages.join(', ')}`);

// Ensure output directory exists
const outputDir = 'src/_data/locales';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let processedCount = 0;

for (const lang of languages) {
  const poFile = `locales/${lang}.po`;
  const jsonFile = `${outputDir}/${lang}.json`;
  
  if (fs.existsSync(poFile)) {
    try {
      const poContent = fs.readFileSync(poFile, 'utf8');
      const translations = parsePoFile(poContent);
      
      // Filter out empty translations and the header entry
      const filteredTranslations = {};
      Object.keys(translations).forEach(key => {
        if (key && translations[key]) {
          filteredTranslations[key] = translations[key];
        }
      });
      
      // Write JSON file
      fs.writeFileSync(jsonFile, JSON.stringify(filteredTranslations, null, 2));
      
      const translationCount = Object.keys(filteredTranslations).length;
      console.log(`  ${lang}: ${translationCount} translations → ${jsonFile}`);
      processedCount++;
      
    } catch (error) {
      console.error(`Error processing ${poFile}:`, error.message);
    }
  } else {
    console.warn(`  ${lang}: ${poFile} not found, skipping`);
  }
}

console.log(`\nProcessed ${processedCount} language files.`);

if (processedCount > 0) {
  console.log('\nNext steps:');
  console.log('1. Build site: npm run build');
  console.log('2. Test translations in browser');
}