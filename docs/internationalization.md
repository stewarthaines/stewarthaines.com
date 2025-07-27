# Internationalization Guidelines

This document provides standards for implementing and maintaining multilingual support in stewarthaines.com using Eleventy and gettext (.po files).

## Current Architecture

### URL Structure
- **English (default)**: `/epub/`
- **Other languages**: `/es/epub/`, `/fr/epub/`, `/de/epub/`
- **Root fallback**: `/` serves English content

### Supported Languages
- `en` - English (default)
- `es` - Spanish (Español)
- `fr` - French (Français) 
- `de` - German (Deutsch)

## Template Patterns

### Dynamic HTML Lang Attribute (Required)

**✅ Correct Implementation:**
```html
<html lang="{{ lang.code or 'en' }}">
```

This generates:
- English pages: `<html lang="en">`
- French pages: `<html lang="fr">`
- Spanish pages: `<html lang="es">`
- German pages: `<html lang="de">`

### Language Switcher Pattern

**✅ Required Template Code:**
```html
<nav aria-label="Language selection">
  <div class="language-switcher">
    {% for language in languages %}
      <a href="{{ '/' if language.code == 'en' else '/' + language.code + '/' }}epub/"
         {% if language.code == lang.code %} aria-current="page" {% endif %}
         aria-label="{{ language.name }} {% if language.code == lang.code %}(current){% else %}({{ language.name }} version){% endif %}"
         lang="{{ language.code }}"
         onclick="localStorage.setItem('user-selected-locale', '{{ language.code }}')">
        {{ language.code | upper }}
      </a>
    {% endfor %}
  </div>
</nav>
```

**Key Requirements:**
- Each link has `lang="{{ language.code }}"` attribute
- Descriptive `aria-label` with language name
- Current page indication with `aria-current="page"`
- localStorage persistence for user preference

### Translatable Content

**✅ String Translation Pattern:**
```html
<!-- Instead of hardcoded text -->
<h1>EDITME.html</h1>
<p>Convert plain text to EPUB - the simplest way to create EPUB files</p>

<!-- Use translation filters -->
<h1>{{ 'page_title' | i18n }}</h1>
<p>{{ 'hero_description' | i18n }}</p>
```

### Page Titles and Meta

**✅ Localized Metadata:**
```html
<title>{{ 'page_title' | i18n }}</title>
<meta name="description" content="{{ 'meta_description' | i18n }}">
<link rel="icon" href="/stewarthaines.ico">
```

## Adding New Languages

### Step 1: Update Language Configuration

Add to `languages` array in your Eleventy data or configuration:
```javascript
languages: [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' } // New language
]
```

### Step 2: Create Translation File

Create `locales/it.po` with translated strings:
```po
# Italian translations
msgid "page_title"
msgstr "EDITME.html"

msgid "hero_description"  
msgstr "Converti testo semplice in EPUB - il modo più semplice per creare file EPUB"

msgid "plain_text_input"
msgstr "Inserimento Testo Semplice"
```

### Step 3: Update Automatic Locale Detection

Add new language to detection script in `epub-base.njk`:
```javascript
const supportedLocales = ['en', 'es', 'fr', 'de', 'it']; // Add 'it'
```

### Step 4: Test New Language

1. Build site: `npm run build`
2. Verify URL works: `/it/epub/`
3. Check language switcher includes new option
4. Test automatic detection for Italian browsers
5. Verify HTML lang attribute: `<html lang="it">`

## Locale Detection Features

### Automatic Browser Detection

The site includes JavaScript that:
1. Detects user's browser locale on first visit
2. Redirects to appropriate language if supported
3. Respects user's explicit language choices
4. Skips redirects for URLs with fragments or query parameters

**Implementation Location:** `src/_includes/epub-base.njk` lines 9-48

### User Preference Persistence

Language choices are saved to localStorage:
- **Key**: `user-selected-locale`
- **Values**: `'en'`, `'es'`, `'fr'`, `'de'`
- **Behavior**: Prevents auto-detection after explicit choice

## Accessibility Integration

### Language-Specific ARIA Labels

**✅ Proper Implementation:**
```html
<a href="/es/epub/" 
   aria-label="Español (Spanish version)" 
   lang="es">ES</a>
```

**Requirements:**
- Each language link must have `lang` attribute
- ARIA labels should include both native and English language names
- Current language should be indicated in ARIA label

### Screen Reader Considerations

- Language changes must be announced via `lang` attributes
- Navigation should be clearly labeled as language selection
- Current language should be obvious to screen reader users

## Testing Requirements

### Per-Language Testing Checklist

For each supported language:

#### Functional Testing
- [ ] URL loads correctly: `/[lang]/epub/`
- [ ] Language switcher shows correct current state
- [ ] All translated strings display properly
- [ ] HTML lang attribute matches page language
- [ ] Automatic detection works for that browser locale

#### Accessibility Testing
- [ ] Screen reader announces language changes
- [ ] Language switcher is properly labeled
- [ ] Content is announced in correct pronunciation
- [ ] Navigation makes sense in target language

#### Content Testing
- [ ] All UI text is translated (no English fallbacks)
- [ ] Text fits properly in UI elements
- [ ] Cultural considerations are appropriate
- [ ] Special characters display correctly

### Browser Locale Testing

Test automatic detection for each language:

```javascript
// In browser console, simulate different locales:
Object.defineProperty(navigator, 'language', {
  get: function() { return 'es-ES'; } // Test Spanish
});
// Clear localStorage and reload page
```

## File Structure

```
stewarthaines.com/
├── locales/
│   ├── messages.pot     # Translation template
│   ├── en.po           # English translations
│   ├── es.po           # Spanish translations
│   ├── fr.po           # French translations
│   └── de.po           # German translations
├── src/
│   ├── _includes/
│   │   └── epub-base.njk    # Contains locale detection script
│   └── epub-index.njk       # Main EPUB landing page
└── _site/
    ├── epub/               # English version
    ├── es/epub/           # Spanish version
    ├── fr/epub/           # French version
    └── de/epub/           # German version
```

## Content Management

### Translation Workflow

1. **Extract strings**: Use `{{ 'string_key' | i18n }}` in templates
2. **Update template**: Build generates `messages.pot` 
3. **Translate content**: Edit .po files with Poedit or text editor
4. **Build site**: `npm run build` generates all language versions
5. **Test thoroughly**: Verify each language works correctly

### String Key Conventions

Use descriptive, hierarchical keys:
```po
msgid "page_title"           # Good: Clear purpose
msgid "hero_description"     # Good: Descriptive
msgid "btn_download"         # Good: Component + action
msgid "feature_authors_title" # Good: Section + audience + element

msgid "text1"               # Bad: Non-descriptive
msgid "homepage_stuff"      # Bad: Vague
```

## Common Issues and Solutions

### Issue: Missing Translations
**Symptom**: English text appears on non-English pages
**Solution**: Check .po files for missing `msgstr` entries

### Issue: Wrong HTML Lang Attribute  
**Symptom**: Screen readers use wrong pronunciation
**Solution**: Verify template has `<html lang="{{ lang.code or 'en' }}">`

### Issue: Auto-Detection Not Working
**Symptom**: Browser locale detection fails
**Solution**: Check `supportedLocales` array includes the language

### Issue: Language Switcher Accessibility
**Symptom**: Screen readers don't announce language options clearly
**Solution**: Ensure each link has proper `aria-label` and `lang` attributes

## Performance Considerations

### Build Impact
- Each language adds one complete copy of the site
- Build time increases linearly with number of languages
- Consider build caching for production deployments

### Client-Side Impact
- Locale detection script runs once on page load
- localStorage persistence has minimal overhead
- No runtime translation - all content pre-generated

## SEO Considerations

### URL Structure Benefits
- Each language has unique URLs for search indexing
- Clean URL patterns: `/es/epub/` not `/epub/?lang=es`
- Proper `lang` attributes help search engines understand content

### Recommended Meta Tags
```html
<link rel="alternate" href="/epub/" hreflang="en">
<link rel="alternate" href="/es/epub/" hreflang="es">
<link rel="alternate" href="/fr/epub/" hreflang="fr">
<link rel="alternate" href="/de/epub/" hreflang="de">
```

## Migration Notes

### From Single Language
1. Wrap existing strings with `{{ 'key' | i18n }}`
2. Create initial .po files with current content
3. Add language switcher to templates
4. Implement locale detection script
5. Test each language thoroughly

### Adding Auto-Detection to Existing Multilingual Site
1. Add locale detection script to base template
2. Update language switcher with localStorage persistence
3. Test that existing user preferences are preserved

## Resources

- [Eleventy i18n Plugin Documentation](https://www.npmjs.com/package/eleventy-plugin-i18n-gettext)
- [GNU gettext Documentation](https://www.gnu.org/software/gettext/manual/gettext.html)
- [Poedit Translation Editor](https://poedit.net/)
- [W3C Internationalization Guidelines](https://www.w3.org/International/)

## Questions?

When implementing i18n features, consider:
1. Does the HTML lang attribute match the content language?
2. Are language switches accessible and clear?
3. Is automatic detection respectful of user choice?
4. Do all strings have proper translations?
5. Does the URL structure make sense for SEO?