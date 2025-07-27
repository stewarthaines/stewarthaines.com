# Simplified Accessibility Implementation Plan

## Overview

This document outlines a streamlined approach to achieving WCAG 2.1 AA compliance for the stewarthaines.com EPUB section by leveraging existing documented patterns from `docs/accessibility.md` and `docs/internationalization.md`.

## Strategy: Use Documented Standards

Instead of creating custom solutions, this plan implements the **exact patterns already documented** in the project's accessibility and internationalization guidelines. This approach ensures:
- **Maintainability**: Uses established, tested patterns
- **Consistency**: Aligns with project standards
- **Speed**: ~90 minutes vs weeks of custom development
- **Reliability**: Less custom code, fewer bugs

## Current State Analysis

### ✅ Existing Good Practices
- Proper HTML lang attributes (dynamic per locale via i18n system)
- Semantic HTML structure with header elements
- Responsive design with proper viewport configuration
- Clean heading hierarchy with single H1
- Working internationalization system

### ❌ Issues to Fix (Using Documented Patterns)
- Missing documented CSS utilities from `accessibility.md`
- Language switcher not using documented i18n pattern
- Radio buttons missing documented fieldset/legend structure
- No skip link (required by documented standards)
- Missing main element wrapper

---

## Implementation Plan

### Phase 1: Apply Documented CSS (45 minutes)

#### 1.1 Add Required CSS Utilities
Use **exact CSS from `docs/accessibility.md`**:
```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Enhanced focus indicators (required) */
*:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* Skip link pattern */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
  border-radius: 0 0 4px 4px;
}

.skip-link:focus {
  top: 0;
}
```

#### 1.2 Language Switcher Pattern
Use **exact template from `docs/internationalization.md`**:
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

#### 1.3 Radio Button Pattern
Use **documented fieldset/legend pattern**:
```html
<fieldset class="audience-selector-fieldset">
  <legend>Choose your role to see relevant features</legend>
  <div class="audience-selector">
    <input type="radio" name="audience" id="authors" checked>
    <label for="authors">
      <span class="sr-only">View features for </span>Book Authors
    </label>
    <!-- Additional radio buttons -->
  </div>
</fieldset>
```

**Required CSS**:
```css
.audience-selector-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.audience-selector-fieldset legend {
  position: absolute;
  left: -9999px; /* Visually hidden but available to screen readers */
}
```

### Phase 2: Semantic HTML Updates (30 minutes)

#### 2.1 Add Skip Link and Main Wrapper
```html
<a href="#main" class="skip-link">Skip to main content</a>
<header>
  <!-- existing header content -->
</header>
<main id="main">
  <!-- existing content -->
</main>
```

#### 2.2 Standard Heading Structure
Use standard `<h2>` elements for feature sections:
```html
<div class="features" aria-live="polite">
  <h2 class="sr-only">Feature Details</h2>
  <!-- feature content -->
</div>
```

#### 2.3 iframe Pattern
Use **documented iframe pattern from `accessibility.md`**:
```html
<div class="app-frame">
  <h2 id="app-heading">Interactive EPUB Creation Tool</h2>
  <p>
    <a href="/epub/indexeddb/EDITME.html" target="_blank">
      Open EPUB tool in new window
      <span class="sr-only"> (opens in new tab)</span>
    </a>
  </p>
  <iframe 
    src="/epub/indexeddb/EDITME.html" 
    title="Interactive EPUB creation tool - convert plain text to EPUB format"
    aria-labelledby="app-heading">
  </iframe>
</div>
```

### Phase 3: Testing & Validation (15 minutes)

Use **documented testing requirements from `accessibility.md`**:
1. **axe-core browser extension**: Must show 0 critical violations
2. **Lighthouse accessibility audit**: Must score 95+
3. **Keyboard navigation**: Tab through all elements
4. **Focus indicators**: Verify visibility on all interactive elements

---

## Benefits of This Approach

### Maintainability
- **Zero custom patterns**: Uses only documented standards
- **Future-proof**: Changes align with project guidelines
- **Team consistency**: Other developers can reference same docs

### Speed & Reliability
- **90 minutes total**: vs weeks of custom development
- **Tested patterns**: All solutions already validated
- **Reduced bugs**: Minimal custom code to break

### Compliance
- **WCAG 2.1 AA**: Documented patterns ensure compliance
- **Screen reader friendly**: All patterns tested with assistive technology
- **Keyboard accessible**: Standard patterns support full keyboard navigation

---

## Success Criteria

### Automated Tests Pass
- Lighthouse accessibility score: 95+
- axe-core: 0 critical violations, <5 moderate
- WAVE: 0 errors

### Manual Testing Passes
- Full keyboard navigation works
- Screen reader announces all content logically
- Language switching works with proper pronunciation

### Code Quality
- Only documented patterns used
- No custom accessibility CSS beyond documented utilities
- Integration with existing i18n system maintained

---

## Implementation Notes

1. **CSS Location**: Add utilities to main stylesheet (likely `sh2.css`)
2. **Template Updates**: Modify `src/epub-index.njk` and `src/_includes/epub-base.njk`
3. **Testing**: Use browser extensions per documented requirements
4. **No Custom Solutions**: If a pattern isn't documented, don't create it

This simplified approach delivers full WCAG 2.1 AA compliance while maintaining the existing codebase patterns and ensuring long-term maintainability.