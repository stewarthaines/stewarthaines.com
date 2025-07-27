# Eleventy Internationalization (i18n) Plan

## Overview

This document outlines a plan for implementing internationalization in the Eleventy-based stewarthaines.com site using gettext .po files and the `eleventy-plugin-i18n-gettext` plugin.

## Goals

- Support multiple languages on the site
- Use industry-standard .po files for translation management
- Maintain static site generation for GitHub Pages compatibility
- Avoid JavaScript-based language detection
- Enable translator-friendly workflow with standard tools like Poedit

## Architecture

### Single Multilingual Site Approach

The solution generates one static site with multiple language versions:

```
_site/
├── index.html           # Default language (English)
├── en/
│   ├── index.html      # English version
│   └── epub/
│       └── index.html
├── es/
│   ├── index.html      # Spanish version
│   └── epub/
│       └── index.html
└── fr/
    ├── index.html      # French version
    └── epub/
        └── index.html
```

### URL Structure

- **Default language**: `/` (English)
- **Other languages**: `/es/`, `/fr/`, etc.
- **Language switching**: Manual links in navigation
- **SEO-friendly**: Each language has its own URL path

## Implementation Plan

### Phase 1: Plugin Setup

1. **Install plugin**:

   ```bash
   npm install eleventy-plugin-i18n-gettext
   ```

2. **Configure .eleventy.js**:

   ```javascript
   const i18n = require("eleventy-plugin-i18n-gettext");

   module.exports = function (eleventyConfig) {
     eleventyConfig.addPlugin(i18n, {
       localesDirectory: "locales",
       parserMode: "po",
       tokenFilePatterns: ["src/**/*.njk", "src/**/*.js"],
       localeRegex: /^(?<lang>.{2})(?:-(?<country>.{2}))*$/,
     });
   };
   ```

3. **Create directory structure**:
   ```
   locales/
   ├── messages.pot      # Translation template
   ├── en.po            # English translations
   ├── es.po            # Spanish translations
   └── fr.po            # French translations
   ```

### Phase 2: Template Modification

1. **Update base template** (`src/_includes/base.njk`):

   ```html
   <html lang="{{ locale }}">
     <head>
       <title>{{ __('Stewart Haines') }}</title>
     </head>
     <body>
       <nav>
         <a href="/">{{ __('Home') }}</a>
         <div class="language-switcher">
           <a href="/en/">EN</a>
           <a href="/es/">ES</a>
           <a href="/fr/">FR</a>
         </div>
       </nav>
     </body>
   </html>
   ```

2. **Wrap translatable strings**:

   - Replace hardcoded text with `{{ __('Text to translate') }}`
   - Use `{{ _n('Singular', 'Plural', count) }}` for pluralization
   - Focus on UI elements, navigation, headings

3. **Update EPUB landing page** (`src/epub-index.njk`):
   ```html
   <h1>{{ __('Plain Text Input') }}</h1>
   <p>{{ __('No Installation') }}</p>
   ```

### Phase 3: Translation Workflow

1. **String extraction**:

   - Plugin automatically extracts `__()` calls
   - Generates `messages.pot` template file
   - Updates existing .po files with new strings

2. **Translation process**:

   - Use Poedit or similar tool to edit .po files
   - Translators work with familiar gettext format
   - Version control friendly (plain text files)

3. **Build process**:
   - Single `npm run build` command
   - Plugin reads all .po files
   - Generates complete multilingual site

### Phase 4: Language Detection & Navigation

1. **Manual language selection**:

   - Prominent language switcher in header
   - Clear visual indicators for current language
   - Preserve current page path across languages

2. **Default language handling**:

   - Root path (`/`) serves default language (English)
   - Other languages use path prefixes (`/es/`, `/fr/`)
   - Consistent navigation structure across languages

3. **SEO considerations**:
   - Proper `lang` attributes on HTML elements
   - Hreflang meta tags for search engines
   - Language-specific sitemaps

## Technical Details

### Plugin Configuration Options

- **localesDirectory**: Where .po files are stored
- **parserMode**: 'po' for text files, 'mo' for binary
- **tokenFilePatterns**: Which files to scan for strings
- **localeRegex**: Pattern for language codes

### Template Functions

- **`__(key)`**: Basic translation
- **`_n(singular, plural, count)`**: Pluralization
- **`locale`**: Current language code
- **`locales`**: Available languages array

### File Structure

```
stewarthaines.com/
├── locales/
│   ├── messages.pot
│   ├── en.po
│   ├── es.po
│   └── fr.po
├── src/
│   ├── _includes/
│   │   └── base.njk
│   └── epub-index.njk
└── .eleventy.js
```

## Deployment Considerations

### GitHub Pages Compatibility

- **Static output**: All languages pre-generated
- **No server logic**: Works with GitHub Pages restrictions
- **File-based routing**: Clean URLs via directory structure

### Content Management

- **Translatable content**: Stored in .po files
- **Version control**: Track translation changes
- **Collaboration**: Standard gettext toolchain

## Migration Strategy

### Phase 1: Infrastructure

- Set up plugin and basic configuration
- Create initial .po files with minimal strings

### Phase 2: Core Pages

- Migrate main site navigation and headers
- Implement language switcher
- Test build process

### Phase 3: EPUB Section

- Translate EPUB collection interface
- Update static content descriptions
- Ensure EDITME.html apps remain functional

### Phase 4: Expansion

- Add more languages as needed
- Implement content-specific translations
- Optimize build performance

## Benefits

- **Professional workflow**: Industry-standard gettext format
- **Translator-friendly**: Familiar tools and processes
- **Static hosting**: Compatible with GitHub Pages
- **No JavaScript**: Works without client-side detection
- **SEO-friendly**: Proper language tagging and URLs
- **Maintainable**: Clear separation of content and translations

## Limitations

- **Manual language selection**: No automatic detection
- **Build complexity**: More complex than single-language site
- **Plugin maintenance**: Last updated 5 years ago (but stable)
- **Content duplication**: Some overhead for multiple language versions

## Next Steps

1. Install and configure the plugin
2. Create initial .po files for target languages
3. Update base templates with translation calls
4. Test build process and language switching
5. Begin translation of core site content
