const i18n = require('eleventy-plugin-i18n');
const fs = require('fs');

// Load translations from JSON files
function loadTranslations() {
  const languages = ['en', 'es', 'fr', 'de'];
  const translations = {};
  
  // Load each language file
  languages.forEach(lang => {
    try {
      const data = JSON.parse(fs.readFileSync(`src/_data/locales/${lang}.json`, 'utf8'));
      // Convert flat structure to plugin format
      Object.keys(data).forEach(key => {
        if (!translations[key]) translations[key] = {};
        translations[key][lang] = data[key];
      });
    } catch (error) {
      console.warn(`Could not load translations for ${lang}:`, error.message);
    }
  });
  
  return translations;
}

const translations = loadTranslations();

module.exports = function(eleventyConfig) {
  // Configure i18n plugin
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocales: {
      'es': 'en',
      'fr': 'en',
      'de': 'en',
      '*': 'en'  // Default fallback to English
    },
    defaultLanguage: 'en'
  });

  // Disable live reload script injection to prevent corruption of standalone HTML apps
  eleventyConfig.setServerOptions({
    liveReload: false
  });

  // Copy existing static assets unchanged  
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("EDITME.html");
  eleventyConfig.addPassthroughCopy("sh2.css");
  eleventyConfig.addPassthroughCopy("stewarthaines.ico");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("movies");
  eleventyConfig.addPassthroughCopy("papers");
  eleventyConfig.addPassthroughCopy("picklets");
  eleventyConfig.addPassthroughCopy("RoadkillTour");
  eleventyConfig.addPassthroughCopy("CNAME");
  
  // Preserve existing epub folder but exclude index.html (we'll generate it)
  eleventyConfig.addPassthroughCopy("epub/SEED.html");
  eleventyConfig.addPassthroughCopy("epub/georgia.epub");
  eleventyConfig.addPassthroughCopy("epub/feed.opds");
  eleventyConfig.addPassthroughCopy("epub/feed.opds.xml");
  eleventyConfig.addPassthroughCopy("epub/full");
  eleventyConfig.addPassthroughCopy("epub/indexeddb");
  eleventyConfig.addPassthroughCopy("epub/lite");
  eleventyConfig.addPassthroughCopy("epub/samples");

  // Completely ignore template processing for epub and RoadkillTour
  eleventyConfig.ignores.add("epub/**/*.html");
  eleventyConfig.ignores.add("RoadkillTour/**/*.html");

  // watch for changes in the sample directory
  eleventyConfig.addWatchTarget("epub/samples/");
  eleventyConfig.addWatchTarget("src/_data/locales/");

  // Override template formats to exclude .html files outside src/
  eleventyConfig.setTemplateFormats(["njk", "md", "11ty.js"]);

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};