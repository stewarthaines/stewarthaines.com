#!/usr/bin/env node

/**
 * Auto-translate Q&A content to French, Spanish, and German using MyMemory API
 * Specifically designed for EPUB Questions page content
 */

const fs = require('fs');
const path = require('path');

// Free MyMemory translation API (no API key required, 1000 requests/day)
async function translateText(text, targetLang) {
  try {
    // Clean text for URL encoding but preserve markdown and HTML
    const cleanText = text.trim();
    if (!cleanText) return text;

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|${targetLang}`;

    console.log(`    Translating to ${targetLang}: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? '...' : ''}"`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      console.log(`    ✅ Translated successfully`);
      return '🤖 ' + translated;
    } else {
      throw new Error(
        `API returned status ${data.responseStatus}: ${data.responseDetails || 'Unknown error'}`
      );
    }
  } catch (error) {
    console.warn(`    ⚠️ Translation failed: ${error.message}`);
    // Fallback: return original text with language indicator
    return `[${targetLang.toUpperCase()}] ${text}`;
  }
}

// Language mappings for MyMemory API
const LANGUAGE_MAPPINGS = {
  fr: 'fr', // French
  es: 'es', // Spanish  
  de: 'de', // German
};

// Language display names
const LANGUAGE_NAMES = {
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  de: 'German (Deutsch)',
};

async function loadEnglishQAContent() {
  const enPath = path.join(__dirname, '../src/_data/locales/en.json');
  const content = fs.readFileSync(enPath, 'utf8');
  const allTranslations = JSON.parse(content);
  
  // Filter to only Q&A keys
  const qaContent = {};
  Object.keys(allTranslations).forEach(key => {
    if (key.startsWith('qa_')) {
      qaContent[key] = allTranslations[key];
    }
  });
  
  return qaContent;
}

async function translateQAContent(locale, qaContent) {
  const langCode = LANGUAGE_MAPPINGS[locale];
  const langName = LANGUAGE_NAMES[locale];

  console.log(`\n🌍 Translating Q&A content to ${langName} (${locale})...`);

  const translated = {};
  const keys = Object.keys(qaContent);
  const total = keys.length;

  for (let i = 0; i < total; i++) {
    const key = keys[i];
    const englishText = qaContent[key];

    console.log(`  [${i + 1}/${total}] ${key}`);

    // Only translate if there's actual content (not empty strings)
    if (englishText && englishText.trim()) {
      // Translate the text
      translated[key] = await translateText(englishText, langCode);
    } else {
      translated[key] = englishText;
    }

    // Rate limiting: pause every 3 requests to be respectful to free API
    if ((i + 1) % 3 === 0 && i < total - 1) {
      console.log(`    💤 Pausing 2 seconds for rate limiting...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return translated;
}

function updatePoFile(locale, qaTranslations) {
  const poPath = path.join(__dirname, `../locales/${locale}.po`);
  let poContent = fs.readFileSync(poPath, 'utf8');

  console.log(`\n📝 Updating ${locale}.po with translated Q&A content...`);

  // Update each Q&A translation in the .po file
  Object.keys(qaTranslations).forEach(key => {
    const translation = qaTranslations[key];
    if (translation) {
      // Find the msgid and replace the following msgstr
      const msgidPattern = new RegExp(`msgid "${key}"\\s*\\nmsgstr ""`, 'g');
      const replacement = `msgid "${key}"\nmsgstr "${translation.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      
      if (poContent.match(msgidPattern)) {
        poContent = poContent.replace(msgidPattern, replacement);
        console.log(`  ✅ Updated ${key}`);
      } else {
        console.log(`  ⚠️ Could not find ${key} in ${locale}.po`);
      }
    }
  });

  fs.writeFileSync(poPath, poContent, 'utf8');
  console.log(`✅ Updated ${locale}.po`);
}

async function main() {
  console.log('🚀 Starting Q&A content translation');
  console.log('📡 Using MyMemory free translation API (no API key required)');
  console.log('⏱️  This may take several minutes with rate limiting\n');

  try {
    // Load English Q&A content
    const qaContent = await loadEnglishQAContent();
    const stringCount = Object.keys(qaContent).length;
    console.log(`📝 Found ${stringCount} Q&A strings to translate`);

    // Sample of what we're translating
    const sampleKeys = Object.keys(qaContent).slice(0, 2);
    console.log('📋 Sample Q&A content:');
    sampleKeys.forEach(key => {
      const preview = qaContent[key].substring(0, 100) + (qaContent[key].length > 100 ? '...' : '');
      console.log(`   "${key}": "${preview}"`);
    });

    // Translate each locale
    const locales = Object.keys(LANGUAGE_MAPPINGS);
    const results = [];

    for (const locale of locales) {
      try {
        const translations = await translateQAContent(locale, qaContent);
        updatePoFile(locale, translations);

        // Count successful translations vs fallbacks
        const successful = Object.values(translations).filter(
          text => text && !text.startsWith('[') && !text.includes('] ')
        ).length;

        results.push({
          locale,
          total: Object.keys(translations).length,
          successful,
          fallbacks: Object.keys(translations).length - successful,
        });
      } catch (error) {
        console.error(`❌ Failed to translate ${locale}:`, error.message);
        results.push({ locale, error: error.message });
      }
    }

    // Summary
    console.log('\n🎉 Q&A Translation Summary:');
    results.forEach(result => {
      if (result.error) {
        console.log(`   ${result.locale}: ❌ Failed - ${result.error}`);
      } else {
        console.log(
          `   ${result.locale}: ✅ ${result.successful} translated, ${result.fallbacks} fallbacks`
        );
      }
    });

    console.log('\n📦 Next steps:');
    console.log('   1. Regenerate JSON files: npm run po-to-json');
    console.log('   2. Test localized pages at /fr/epub/questions/, /es/epub/questions/, /de/epub/questions/');
    console.log('   3. Review translations and improve via weblate workflow');
  } catch (error) {
    console.error('💥 Translation process failed:', error);
    console.error('🔧 Try running again or check your internet connection');
    process.exit(1);
  }
}

main();