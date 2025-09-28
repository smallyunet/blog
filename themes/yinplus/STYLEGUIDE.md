# YinPlus Theme – Design Style Guide

This guide defines the design tokens, layout rules, and component patterns for the blog. It aligns with common design system practice (tokens → components), accessibility guidance (WCAG), and CJK (Chinese) readability research.

## 1) Viewport & responsiveness
- Viewport (recommended): `width=device-width, initial-scale=1.0`.
  - Rationale: 1.0 preserves natural sizing, readable text, and 44×44px tap targets. Use CSS to adapt, not page zoom.
  - Exception: kiosk/embedded displays. If you intentionally miniaturize, document the scope clearly.
- Breakpoints (mobile-first):
  - `sm` 480px, `md` 768px, `lg` 1024px, `xl` 1280px.

## 2) Typography
- Base font size (desktop): 18px. Mobile: 17px (in CSS via media query). `.mobile` mode keeps legacy 32px.
- Line height: body 1.8 (CJK); headings ≥ 1.3.
- Type scale (Minor Third 1.25):
  - h1: clamp(1.75em, 4.2vw, 2em)
  - h2: 1.6em, h3: 1.25em, h4: 1.1em
- Heading underline: short decorative rules (not full-width). h1: 4em × 3px, h2: 3.5em × 2px, h3: 3em × 2px.
- Preferred CJK/Latin stack is declared in `typography.css`.
- Code fonts: UI monospace stack; inline code slightly smaller (0.9em) with subtle background and border.

## 3) Readability (CJK specifics)
- Ideal measure (line length): ~28–40 Chinese characters per line (≈ 560–800 CSS px at 18px with current font stack).
- Paragraph spacing: ~1.0em between paragraphs; lists slightly tighter.
- Avoid hard hyphenation; let CJK wrap naturally.

## 4) Spacing, radii, shadows
- Spacing scale (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Component paddings (default): vertical 12–16px, horizontal 16px.
- Border radius scale: 2, 3, 6, 8px. Default container: 6px on images/code, 0 on cards for a flat look.
- Shadows: ultra-soft only (e.g., `0 1px 4px rgba(0,0,0,0.08)`). Avoid heavy drop shadows.

## 5) Color tokens
Defined in `source/css/typography.css` as CSS variables.
- Light mode
  - Text `--color-text`: #111
  - Muted `--color-muted`: #666
  - Links `--link-color`: #2563eb, hover `--link-hover`: #1d4ed8, visited `--link-visited`: #1e40af
  - Dividers `--color-hr`: #e5e5e5
  - Quote bg/border: #fafafa / #e0e0e0
- Dark mode (prefers-color-scheme)
  - Text `--color-text`: #e7e7e7
  - Links `--link-color`: #8ab4f8 (Google blue-ish), hover `--link-hover`: #a9c6ff
  - Dividers `--color-hr`: #2a2f37; quote bg: #141a20
- Accessibility: maintain at least 4.5:1 contrast for body text on backgrounds.

## 6) Layout rules
- Page background: plain, no texture. Use whitespace for rhythm.
- Containers (`.inner`, `.inner-narrow` on posts):
  - Desktop margins: `.inner { margin: 0% 14%; }`, `.inner-narrow { margin: 0% 7%; }`
  - Padding: `2% 8% 4% 8%`, border: `1px solid var(--color-hr)`
  - Mobile (< 860px): remove side margins; keep padding 16–20px (`2% 4% 4% 4%` is acceptable).
- Maximum content width: not strictly capped for this theme; fluid layout is part of its visual identity.

## 7) Navigation
- Hover/focus states change color only; avoid background fills.
- Keyboard: use `:focus-visible` outlines (2px, `--link-hover`), with `outline-offset: 2px`.

## 8) List (index) component
- Desktop (≥ 860px): grid with three columns → `[date | title | count]`.
  - Date width: `10ch`, numeric `tabular-nums` for alignment.
  - Title grows; word-count right-aligned, muted gray.
  - Row padding: 12–16px vertical.
  - Hover: soft tint only (no left-color bar). Keep focus-visible outline for accessibility.
- Mobile: stack → date above title; hide word-count; ensure 16–18px vertical padding.

## 9) Post content
- Title `h1` centered with decorative underline; `.time` muted and spaced (`margin-bottom: 20px`).
- Images: block, centered, `max-width: 100%`, radius 6px, soft shadow.
- Code blocks: background `--color-code-bg`, radius 6px, padding 10–12px.
- Quotes: left border 4px; subtle background fill.

## 10) Tables
- Full width inside `.inner` with horizontal scroll when needed.
- Borders: `#dfe2e5` (light), `#2a2f37` (dark).

## 11) Motion & performance
- Respect `prefers-reduced-motion`; disable non-essential transitions/animations.
- Defer non-critical JS (already implemented). Avoid layout thrash in scripts.

## 12) SEO & meta
- Keep description, canonical, OpenGraph/Twitter tags.
- Theme-color per scheme.

## 13) Quality checklist (acceptance)
- [ ] Text size ≥ 16px on mobile; tap targets ≥ 44×44px.
- [ ] Color contrast ≥ 4.5:1 for body text.
- [ ] List rows have consistent vertical rhythm (12–16px).
- [ ] Date column aligns via `tabular-nums` and `10ch` width.
- [ ] Post content line length ≈ 28–40 CJK chars.
- [ ] Focus-visible ring is present for keyboard navigation.
- [ ] Mobile removes desktop side margins and preserves padding.
- [ ] Viewport set to `initial-scale=1.0` (unless intentionally overridden for kiosk use).

## 14) Token reference (from typography.css)
```css
:root {
  --font-size-base: 18px;
  --lh-base: 1.8;
  --bg-color: #ffffff;
  --color-text: #111; --color-muted: #666;
  --link-color: #2563eb; --link-hover: #1d4ed8; --link-visited: #1e40af;
  --color-hr: #e5e5e5; --color-quote-bg: #fafafa; --color-quote-border: #e0e0e0;
  --color-code-bg: #f6f6f6; --color-code-border: #e2e2e2;
  --heading-color: #333; --heading-underline: #e6e6e6;
}
```

---
Implementation tip: evolve CSS against these tokens rather than hard-coded values. When behavior must change by page type (home vs post), prefer utility variables/classes and media queries over zoom/scaling.
