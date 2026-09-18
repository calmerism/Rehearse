---
name: anti-slop
description: Comprehensive guidelines for eliminating AI visual slop, cliché UI templates, and low-quality design habits based on Impeccable Design (impeccable.style/slop). Activate when proposing, implementing, or reviewing any UI visual design, styling, layout, typography, color palette, or microcopy changes.
---

# Anti-Slop Design & Interface Quality Guidelines

> Sourced from [Impeccable Design](https://impeccable.style/slop/).
> These rules exist to prevent common AI design defaults and habits across eras and models, ensuring clean, human-grade, purpose-built interfaces that adhere to authentic design principles rather than superficial AI tropes.

---

## The AI Slop Catalog: What to Avoid Every Time

### 1. Surfaces & Visual Details
- **No Decorative Grid Backgrounds**: Do not apply subtle graph paper / blueprint grids behind sections. Grids belong on actual drawing canvases or map tools, not standard UI surfaces.
- **No Glassmorphism Everywhere**: Do not add frosted glass (`backdrop-filter: blur()`), translucent cards, or neon borders unless solving an authentic layering requirement.
- **No Hairline Border with Wide Shadow ("Ghost Cards")**: Do not combine a crisp 1px outline with a diffuse 30px black shadow on the same surface. Choose either a clean edge or a soft shadow, never both competing.
- **No Side-Tab Accent Borders**: Do not add 3–4px thick vertical colored stripes on the left of ordinary cards, which falsely mimic alert/warning dialogs.
- **No Border Accent on Rounded Elements**: Avoid thick colored borders that visually clash with corner radii.
- **No Extreme Corner Radii**: Do not curve ordinary cards into 32px–44px rounded blobs that eat up padding and squash internal content.
- **No Repeating-Gradient Stripes**: Avoid diagonal hazard or texture stripes filling background empty space with visual noise.
- **No Rough / Sketchy SVG Illustrations**: Do not hand-code crude SVG mascots or geometric shapes that make a finished interface look unpolished.

### 2. Typography & Hierarchy
- **No Kicker Labels Above Headings**: Do not stack small uppercase tracking labels (`FEATURES`, `OVERVIEW`) directly above primary headings. Integrate necessary context into the heading itself.
- **No Hero Eyebrow Badges / Chips**: Avoid floating non-clickable pill badges (`INTRODUCING`, `NEW`) directly above primary headlines.
- **No Oversized Hero Headlines**: Avoid 60px–80px display headlines that dominate the entire viewport and push meaningful content below the fold.
- **No Flat Type Hierarchy**: Ensure distinct contrast between headings, subheadings, and body copy in size, weight, and color. Never style adjacent levels at near-identical sizes (e.g. 17px vs 16px).
- **No Crushed Letter-Spacing**: Avoid aggressive negative tracking (`tracking-[-0.06em]` or worse) that causes character collisions.
- **No Default Font Reflexes**: Do not default to Inter or Geist everywhere by reflex. Adhere to the project typography (`SF Pro Display`, `SF Pro Text`, system stacks) in `DESIGN.md`.
- **No Italic Serif Display Shortcuts**: Avoid reaching for Georgia/Times italic display fonts as an unearned shortcut to an "editorial" look.
- **No Icon Tiles Stacked Above Headings**: Avoid the predictable AI feature-card pattern of a rounded square icon tile floating centered or left above a heading in a 3-column grid.
- **No All-Caps Body Text**: Reserve uppercase solely for short, deliberate badges or table headers. Never use all-caps for running sentences.
- **No Undersized Interface Text**: Never set interactive controls, form labels, or secondary text below 13px.
- **No Tight Line-Height**: Avoid line heights below 1.35 on multi-line copy; body text should breathe at 1.45–1.55.
- **No Justified Text**: Always align body text to the start (left-aligned in LTR) to prevent white space rivers.

### 3. Color & Contrast
- **No AI Color Palette Defaults**: Strictly avoid saturated purple-to-blue gradients, electric cyan against black, and cyberpunk neon defaults.
- **No Radial-Gradient Background Halos & Spotlights**: Do not place glowing orb gradients or soft spotlights centered behind cards or text blocks.
- **No Gradient Text**: Do not use `text-transparent bg-clip-text bg-gradient-to-r` on headings or numbers purely for decoration. Use solid, high-contrast typography.
- **No Dark Mode with Glowing Neon Accents**: Do not add glowing colored drop shadows (`0 0 20px rgba(...)`) to dark cards.
- **No Reflexive Cream / Beige Surfaces**: Avoid reaching for oatmeal, linen, or beige backgrounds as a default substitute for a considered palette.
- **No Gray Text on Colored Backgrounds**: Do not place neutral gray text over colored cards where it washes out and fails readability.
- **Strict WCAG AA Contrast**: Maintain at least 4.5:1 for normal body text and 3:1 for large display text against all backgrounds.

### 4. Layout & Spacing
- **No Nested Cards ("Cardocalypse")**: Never place cards inside cards inside cards. Flatten visual depth using whitespace, subtle dividers, and typographic hierarchy instead of endless nested borders and shadows.
- **No Identical 3x3 Card Grids**: Avoid formulaic grids where every card has the identical icon, title, and two lines of filler text. Vary the layout according to the content's actual structure.
- **No Hero Metric Layout Without Context**: Do not float giant numbers (`10M+`, `99.9%`) in a void with tiny labels beneath unless backed by meaningful context.
- **No Monotonous Spacing**: Avoid identical margins and gaps everywhere. Group related elements tightly and leave generous breathing room between distinct sections.
- **No Unbalanced Opening Columns**: Avoid multi-column hero sections where one side runs 3x longer than the other, creating large empty voids.
- **No Tiny Numbered Section Labels**: Do not prepend decorative `01`, `02`, `03` labels unless the content represents a strict sequential step-by-step workflow.
- **Respect Reading Measure**: Cap running text line lengths to 60–75 characters (e.g., `max-w-xl` to `max-w-3xl` for paragraphs, `max-w-5xl` for headings).
- **No Container Overflow**: Ensure all text wraps cleanly and interactive elements never trigger unwanted horizontal page scrolling.
- **No Cramped Padding**: Ensure touch/click targets have comfortable insets (minimum 44px hit targets, generous button padding).
- **No Text Flush Against the Viewport Edge**: Always maintain responsive horizontal gutters (`px-4 sm:px-8`).

### 5. Motion & Interaction
- **No Pulsing Status Dots**: Do not animate pulsing or expanding rings on status indicators when the state is static and unchanging.
- **No Decorative Blinking Cursors**: Never place a fake terminal-style blinking cursor on static text.
- **No Auto-Scrolling Marquees**: Avoid looping horizontal logo or text tickers without user pause controls.
- **No Bouncy / Elastic Overshoot on Routine UI**: Keep motion critically damped (`damping: 1.0` or `ease-out`); reserve bounce only for momentum-driven gesture releases.
- **No Animating Layout Properties**: Never animate `width`, `height`, `margin`, or `top`/`left`. Always animate `transform` and `opacity` for smooth 60fps GPU acceleration.
- **No Hover Zoom on Every Image**: Do not scale or rotate every image card on hover without a functional affordance.
- **No Content Hidden at Rest**: Never leave content at `opacity: 0` dependent on entrance animations that might fail or cause flash-of-invisible-content.

### 6. UX Writing & Microcopy
- **No Generic Marketing Buzzwords**: Avoid "Supercharge your workflow", "Enterprise-grade", "Next-generation", "Seamless experience", "Revolutionary", and "World-class".
- **No Repeated Container Text**: Do not repeat the same label across a badge, heading, and button within the same card (e.g. "Ready" badge, "Ready" heading, "Ready" action).
- **No Em-Dash Overuse**: Do not insert em-dashes into every sentence. Use clean periods and commas.
- **No Aphoristic Cadence / Forced Contrast**: Avoid pretentious slogan pairs ("Not a feature. A platform.", "Less friction. More magic.").
- **No Dismissive "Theater" Tropes**: Do not dismiss concepts with clichés like "growth theater" or "productivity theater". State the actual technical or user trade-offs directly.

---

## Integration with Project Design System (`DESIGN.md`)
Always consult `DESIGN.md` in the project root:
- Rely on Apple-inspired restraint: high visual signal-to-noise ratio, generous margins, clean typography (`SF Pro`), physical spring curves with no decorative wobble, and authentic functional hierarchy.
