# Accessibility Guidelines

This document provides accessibility standards and patterns for stewarthaines.com development. All code changes must meet WCAG 2.1 AA standards.

## Core Principles

1. **Semantic HTML first** - Use proper elements before adding ARIA
2. **Keyboard accessible** - Every interactive element must be keyboard operable
3. **Screen reader friendly** - Provide context and clear navigation
4. **Visual accessibility** - Meet contrast ratios and support zoom

## Required CSS Utilities

Add these utility classes to your CSS for consistent accessibility:

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

## Component Patterns

### Language Switcher (Required Pattern)

**✅ Correct Implementation:**

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

**❌ Common Mistakes:**

- Missing `nav` wrapper with `aria-label`
- No descriptive `aria-label` on links
- Missing `lang` attribute on each link
- No current page indication

### Radio Button Groups (Required Pattern)

**✅ Correct Implementation:**

```html
<fieldset class="audience-selector-fieldset">
  <legend>Choose your role to see relevant features</legend>
  <div class="audience-selector">
    <input type="radio" name="audience" id="authors" checked />
    <label for="authors">
      <span class="sr-only">View features for </span>Book Authors
    </label>
    <input type="radio" name="audience" id="designers" />
    <label for="designers">
      <span class="sr-only">View features for </span>Book Designers
    </label>
    <input type="radio" name="audience" id="developers" />
    <label for="developers">
      <span class="sr-only">View features for </span>Book Developers
    </label>
  </div>
</fieldset>
```

**Required CSS:**

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

### Skip Links (Required on Every Page)

**✅ Implementation:**

```html
<!-- Must be first focusable element after <body> -->
<a href="#main" class="skip-link">Skip to main content</a>
<header>
  <!-- navigation content -->
</header>
<main id="main">
  <!-- page content -->
</main>
```

## ARIA Patterns

### Navigation Landmarks

- `<nav aria-label="Language selection">` for language switcher
- `<nav aria-label="Main navigation">` for primary site navigation
- `<main id="main">` for primary content
- `<header>` and `<footer>` for page structure

### Dynamic Content

```html
<!-- For content that changes via CSS/JS -->
<div class="features" aria-live="polite" aria-labelledby="features-heading">
  <h2 id="features-heading" class="sr-only">Feature Details</h2>
  <!-- dynamic content -->
</div>
```

### Form Labels

```html
<!-- Always associate labels with form controls -->
<label for="input-id">Label text</label>
<input type="text" id="input-id" name="field-name" />

<!-- For complex forms, use aria-describedby -->
<label for="password">Password</label>
<input type="password" id="password" aria-describedby="pwd-help" />
<div id="pwd-help">Must be at least 8 characters</div>
```

## Testing Requirements

### Automated Testing (Required)

1. **axe-core browser extension**: Run on every page before deployment
2. **Lighthouse accessibility audit**: Must score 95+
3. **WAVE extension**: Zero errors allowed

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab works in reverse order
- [ ] Enter/Space activates buttons and links
- [ ] Escape dismisses modal dialogs (if any)
- [ ] Arrow keys work for radio groups and menus
- [ ] Focus is visible on all interactive elements

#### Screen Reader Testing

- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All content is announced in logical order
- [ ] Interactive elements have clear purpose
- [ ] Form labels are properly associated
- [ ] Headings create logical document outline
- [ ] Language changes are announced properly

#### Visual Testing

- [ ] Page works at 200% zoom
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] Color is not the only way to convey information

## Color Contrast Standards

### Required Ratios

- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum
- **Interactive elements**: 3:1 minimum
- **Focus indicators**: 3:1 minimum

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools Accessibility panel

## Common Pitfalls to Avoid

### ❌ Don't Do This

```html
<!-- Generic or missing ARIA labels -->
<a href="/fr/">FR</a>

<!-- Clickable divs instead of buttons -->
<div onclick="doSomething()">Click me</div>

<!-- Missing form labels -->
<input type="text" placeholder="Enter name" />

<!-- Inaccessible custom controls -->
<div class="dropdown">...</div>

<!-- Missing skip links -->
<header>
  <nav>lots of links</nav>
</header>
<main>content</main>
```

### ✅ Do This Instead

```html
<!-- Descriptive ARIA labels -->
<a href="/fr/" aria-label="Français (French version)" lang="fr">FR</a>

<!-- Proper button elements -->
<button onclick="doSomething()">Click me</button>

<!-- Explicit form labels -->
<label for="name">Enter name</label>
<input type="text" id="name" name="name" />

<!-- Accessible custom controls with ARIA -->
<div class="dropdown" role="combobox" aria-expanded="false">...</div>

<!-- Skip links for keyboard users -->
<a href="#main" class="skip-link">Skip to main content</a>
<header>
  <nav>lots of links</nav>
</header>
<main id="main">content</main>
```

## Reduced Motion Support

Always include this CSS for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Accessibility Guidelines](https://webaim.org/)
- [MDN Accessibility Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Questions?

When in doubt, ask yourself:

1. Can I operate this with only a keyboard?
2. Would this make sense to someone using a screen reader?
3. Is the purpose of each element clear?
4. Do colors meet contrast requirements?

If any answer is "no" or "maybe", the implementation needs improvement.
