# Development Workflow Guidelines

This document outlines required development practices, testing procedures, and quality checks for stewarthaines.com.

## Pre-Development Setup

### Required Browser Extensions

Install these extensions for accessibility and internationalization testing:

#### Accessibility Testing
- **[axe DevTools](https://www.deque.com/axe/devtools/)** - Automated accessibility scanning
- **[WAVE](https://wave.webaim.org/extension/)** - Web accessibility evaluation
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** - Built into Chrome DevTools

#### Internationalization Testing
- **[Language Switch](https://chrome.google.com/webstore/detail/language-switch/ehoepiggfbphobjaeblgihlcpomogibd)** - Change browser language for testing
- **Chrome DevTools Device Toolbar** - Test responsive behavior across locales

### Local Development Environment

#### Required Commands
```bash
# Development server
npm run dev          # Start development server at localhost:8080

# Build process  
npm run build        # Generate static site to _site/
npm run clean        # Remove build artifacts

# Testing (when available)
npm run test         # Run automated tests
npm run lint         # Check code style
npm run typecheck    # Validate TypeScript (if applicable)
```

#### Development URLs
- **Main site**: http://localhost:8080/
- **EPUB section**: http://localhost:8080/epub/
- **Spanish**: http://localhost:8080/es/epub/
- **French**: http://localhost:8080/fr/epub/
- **German**: http://localhost:8080/de/epub/

## Code Quality Checks

### Accessibility Validation (Required)

#### Before Every Commit
1. **Run axe DevTools** on all modified pages
   - Must have 0 critical violations
   - Address moderate violations where possible
   - Document any accepted violations with reasoning

2. **Lighthouse Accessibility Audit**
   - Target score: 95+ (minimum 90)
   - Address all actionable recommendations
   - Verify performance doesn't regress

3. **Manual Keyboard Testing**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Shift+Tab reverse navigation
   - Ensure all functionality available via keyboard

#### Weekly Deep Testing
- **Screen reader testing** with NVDA or VoiceOver
- **Color contrast verification** with WebAIM checker
- **Zoom testing** at 200% browser zoom

### Internationalization Validation (Required)

#### Per-Language Testing
For any changes affecting multiple languages:

1. **URL Testing**
   ```bash
   # Verify all language URLs work
   curl -I http://localhost:8080/epub/      # English
   curl -I http://localhost:8080/es/epub/   # Spanish  
   curl -I http://localhost:8080/fr/epub/   # French
   curl -I http://localhost:8080/de/epub/   # German
   ```

2. **HTML Lang Attribute Verification**
   ```bash
   # Check each page has correct lang attribute
   curl -s http://localhost:8080/epub/ | grep '<html lang='
   # Should show: <html lang="en">
   
   curl -s http://localhost:8080/fr/epub/ | grep '<html lang='  
   # Should show: <html lang="fr">
   ```

3. **Language Switcher Testing**
   - Click each language option
   - Verify localStorage saves preference: `user-selected-locale`
   - Test that auto-detection respects saved preferences

4. **Browser Locale Testing**
   ```javascript
   // In browser console, test auto-detection:
   localStorage.removeItem('user-selected-locale');
   Object.defineProperty(navigator, 'language', {
     get: function() { return 'fr-FR'; }
   });
   // Reload page, should redirect to /fr/epub/
   ```

## Code Review Checklist

### General Requirements
- [ ] Code follows existing patterns and conventions
- [ ] No hardcoded strings (use i18n filters)
- [ ] Semantic HTML elements used appropriately
- [ ] CSS classes follow existing naming conventions

### Accessibility Checklist
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators meet contrast requirements (3:1 minimum)
- [ ] ARIA labels are descriptive and appropriate
- [ ] Form labels are properly associated with inputs
- [ ] Images have appropriate alt text (if any)
- [ ] Color is not the only way information is conveyed
- [ ] Text meets contrast requirements (4.5:1 normal, 3:1 large)

### Internationalization Checklist
- [ ] HTML lang attribute is dynamic: `{{ lang.code or 'en' }}`
- [ ] Translatable strings use i18n filters: `{{ 'key' | i18n }}`
- [ ] Language switcher includes all supported languages
- [ ] ARIA labels on language links include language names
- [ ] Each language link has proper `lang` attribute
- [ ] New strings are added to all .po files

### Component-Specific Checks

#### Language Switcher
- [ ] Wrapped in `<nav aria-label="Language selection">`
- [ ] Each link has descriptive `aria-label`
- [ ] Current page marked with `aria-current="page"`
- [ ] onclick handlers save to localStorage
- [ ] Links have `lang` attributes for each language

#### Form Controls
- [ ] Radio groups wrapped in `<fieldset>` with `<legend>`
- [ ] All inputs have associated labels
- [ ] Complex forms use `aria-describedby` for help text
- [ ] Error messages are properly associated

#### Navigation
- [ ] Skip links present and functional
- [ ] Logical tab order throughout page
- [ ] All interactive elements focusable
- [ ] Focus indicators visible and high contrast

## Testing Procedures

### Pre-Commit Testing (Required)

```bash
# 1. Build the site
npm run build

# 2. Serve locally and test
npm run dev

# 3. Run accessibility scans
# Use axe DevTools on modified pages

# 4. Test keyboard navigation
# Tab through all interactive elements

# 5. Test language switching
# Click each language option, verify functionality

# 6. Test auto-detection (if locale logic changed)
# Clear localStorage, test browser locale detection
```

### Pre-Deployment Testing (Required)

#### Full Site Audit
- [ ] All pages load without errors
- [ ] Language switcher works on all pages  
- [ ] Automatic locale detection works correctly
- [ ] No broken links or missing resources
- [ ] Performance meets standards (Lighthouse)

#### Cross-Browser Testing
Test in at least:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)  
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

#### Accessibility Audit
- [ ] Zero critical accessibility violations (axe)
- [ ] Lighthouse accessibility score 95+
- [ ] Manual keyboard navigation works
- [ ] Screen reader testing completed (spot check)

## Debugging Common Issues

### Language Detection Not Working

**Symptoms**: Auto-detection not redirecting users
**Debug Steps**:
1. Check browser console for JavaScript errors
2. Verify `supportedLocales` array includes target language
3. Test localStorage state: `localStorage.getItem('user-selected-locale')`
4. Verify URL patterns match expected format

**Fix Pattern**:
```javascript
// Check current implementation in epub-base.njk lines 20-30
const supportedLocales = ['en', 'es', 'fr', 'de'];
// Ensure new languages are added here
```

### Accessibility Violations

**Common Issues**:
- Missing ARIA labels: Add descriptive `aria-label` attributes
- Poor focus indicators: Verify CSS meets 3:1 contrast ratio
- Form label issues: Ensure `<label for="id">` matches `<input id="id">`
- Missing landmarks: Wrap navigation in `<nav>` with `aria-label`

**Fix Pattern**:
```html
<!-- Before: accessibility violation -->
<a href="/fr/">FR</a>

<!-- After: accessible -->
<a href="/fr/epub/" aria-label="Français (French version)" lang="fr">FR</a>
```

### Build Failures

**Common Causes**:
- Missing translation strings in .po files
- Malformed Nunjucks template syntax
- Missing required data in front matter

**Debug Steps**:
1. Check build output for specific error messages
2. Verify all i18n keys exist in .po files
3. Test template syntax in isolation
4. Check that all required data is available

## Performance Guidelines

### Build Performance
- Monitor build time as languages are added
- Consider build caching for production deployments
- Profile build process if it exceeds 30 seconds locally

### Runtime Performance
- Locale detection script should execute in <50ms
- No layout shift from dynamic content loading
- Maintain Lighthouse performance score >90

### Resource Optimization
- Minimize inline JavaScript where possible
- Ensure CSS is efficient and follows existing patterns
- Avoid loading unnecessary resources per language

## Release Process

### Pre-Release Checklist
- [ ] All automated tests pass
- [ ] Accessibility audit complete (95+ score)
- [ ] All supported languages tested manually
- [ ] Cross-browser testing complete
- [ ] Performance metrics meet standards
- [ ] No console errors on any page

### Deployment Steps
1. Final build: `npm run build`
2. Deploy `_site/` directory contents
3. Smoke test production URLs
4. Verify CDN/cache invalidation if applicable

### Post-Deployment Verification
- [ ] All language URLs load correctly in production
- [ ] Language switching works end-to-end
- [ ] Automatic locale detection functional
- [ ] No broken links or missing resources

## Tools and Resources

### Required Tools
- **Node.js**: Latest LTS version
- **npm**: Package management
- **Browser DevTools**: Debugging and testing
- **axe DevTools**: Accessibility scanning
- **WAVE extension**: Accessibility evaluation

### Recommended Tools
- **Poedit**: Translation file editing
- **WebAIM Contrast Checker**: Color contrast testing
- **Colour Contrast Analyser**: Desktop contrast tool

### Documentation References
- [Accessibility Guidelines](./accessibility.md)
- [Internationalization Guidelines](./internationalization.md) 
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Questions and Support

### When to Ask for Help
- Accessibility violations you can't resolve
- Complex internationalization scenarios
- Performance issues beyond simple optimization
- Cross-browser compatibility problems

### How to Document Issues
When reporting problems:
1. Specific steps to reproduce
2. Expected vs actual behavior
3. Browser and OS information
4. Screenshots or console errors if applicable
5. Impact on users (critical/major/minor)

### Code Review Standards
- All accessibility and i18n checklist items must pass
- Performance must not regress
- Code must follow existing patterns
- Documentation must be updated for new features

Remember: Quality gates exist to ensure an excellent user experience for all users, including those using assistive technologies or browsing in different languages.