# Accessibility Checklist

This document provides a checklist for accessible UX and how to run automated checks.

## Checklist
- Ensure `lang` attribute is set on `<html>`.
- Use semantic HTML: `<main>`, `<header>`, `<nav>`, `<footer>`.
- Forms: `label` associated with inputs, `aria-invalid` and `aria-describedby` for errors.
- Provide `aria-live="polite"` regions for async messages and errors.
- Provide `skip-link` to jump to main content.
- Ensure keyboard navigation and focus-visible styles.
- Respect `prefers-reduced-motion`.
- Ensure color contrast ratios meet WCAG AA.

## Tools
- axe-core, cypress-axe, pa11y, Lighthouse.
- Integrate in CI and run on PRs (fail on critical issues).
