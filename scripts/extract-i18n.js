#!/usr/bin/env node

const { GettextExtractor } = require('gettext-extractor');
const fs = require('fs');
const path = require('path');

const extractor = new GettextExtractor();

// Function to recursively find .njk files
function findNjkFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findNjkFiles(fullPath));
    } else if (item.endsWith('.njk')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Custom Nunjucks parser for {{ 'key' | i18n }} syntax
function extractFromNunjucks(filename, source) {
  // Regex to match {{ 'string' | i18n }} or {{ "string" | i18n }}
  const i18nRegex = /\{\{\s*['"`]([^'"`]+)['"`]\s*\|\s*i18n\s*\}\}/g;
  
  let match;
  while ((match = i18nRegex.exec(source)) !== null) {
    const key = match[1];
    const line = source.substring(0, match.index).split('\n').length;
    
    extractor.addMessage({
      text: key,
      references: [`${filename}:${line}`]
    });
  }
}

// Find and process all .njk files
const njkFiles = findNjkFiles('./src');
console.log(`Found ${njkFiles.length} Nunjucks template files`);

for (const file of njkFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const beforeCount = extractor.getMessages().length;
  extractFromNunjucks(file, source);
  const afterCount = extractor.getMessages().length;
  const foundInFile = afterCount - beforeCount;
  
  if (foundInFile > 0) {
    console.log(`  ${file}: ${foundInFile} strings`);
  }
}

console.log(`Total extractable strings found: ${extractor.getMessages().length}`);

// Ensure locales directory exists
if (!fs.existsSync('./locales')) {
  fs.mkdirSync('./locales');
}

// Check if messages.pot exists for incremental updates
const potFile = './locales/messages.pot';
const potExists = fs.existsSync(potFile);

if (potExists) {
  console.log('Updating existing messages.pot file...');
  
  // Read existing .pot file to preserve existing entries
  const existingPot = fs.readFileSync(potFile, 'utf8');
  
  // Extract existing msgids
  const existingMsgids = new Set();
  const msgidRegex = /^msgid "([^"]+)"/gm;
  let match;
  while ((match = msgidRegex.exec(existingPot)) !== null) {
    existingMsgids.add(match[1]);
  }
  
  // Get new messages
  const newMessages = extractor.getMessages();
  
  // Only add truly new messages
  const filteredMessages = newMessages.filter(msg => !existingMsgids.has(msg.text));
  
  if (filteredMessages.length > 0) {
    console.log(`Found ${filteredMessages.length} new translatable strings`);
    
    // Append new messages to existing .pot file
    const newPotContent = filteredMessages.map(msg => {
      const references = msg.references.map(ref => `#: ${ref}`).join('\n');
      return `\n${references}\nmsgid "${msg.text}"\nmsgstr ""`;
    }).join('\n');
    
    fs.appendFileSync(potFile, newPotContent);
    console.log('Added new strings to messages.pot');
  } else {
    console.log('No new translatable strings found');
  }
} else {
  console.log('Creating new messages.pot file...');
  
  // Create new .pot file
  extractor.savePotFile(potFile);
  console.log(`Extracted ${extractor.getMessages().length} translatable strings to messages.pot`);
}

console.log('Extraction complete!');