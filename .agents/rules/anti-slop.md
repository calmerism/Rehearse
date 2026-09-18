# Rehearse — Agent Guidelines & Anti-Slop Design System

These instructions apply to all agents and operations in this workspace.

---

## 🎨 Visual Design Standard: Strict Anti-Slop Directives

> **MANDATORY**: Whenever you propose, edit, or review any visual design, component layout, styling, typography, animation, or microcopy, you **MUST strictly avoid** the AI design anti-patterns cataloged below (derived from [Impeccable Design](https://impeccable.style/slop/)).

### 1. Surfaces & Visual Details (No Fake "AI Polish")
- ❌ **No decorative grid-line backgrounds**: Do not add subtle graph paper or blueprint grid lines behind hero sections or cards. Reserve grids solely for genuine canvas, charting, or map tools.
- ❌ **No glassmorphism everywhere**: Avoid gratuitous frosted glass (`backdrop-blur`), translucent floating cards, and glowing borders used as generic decoration rather than solving an authentic layering problem.
- ❌ **No hairline borders with wide shadows ("Ghost Cards")**: Do not combine a crisp 1px border with a diffuse 30px black shadow on the same surface. Choose an edge OR a soft shadow to define the boundary—never both competing.
- ❌ **No side-tab accent borders**: Do not place 3–4px thick saturated vertical stripes along the left side of ordinary cards. This makes routine content look like an urgent warning/alert.
- ❌ **No border accents on rounded elements**: Avoid thick, saturated borders that visually clash with corner radii.
- ❌ **No extreme card border-radii**: Do not turn cards into 32px–44px pill/blob shapes that squeeze internal content and padding.
- ❌ **No repeating-gradient stripes**: Avoid diagonal hazard or texture stripes filling background empty space with visual noise.
- ❌ **No rough / sketchy SVG illustrations**: Do not invent crude hand-coded SVG mascots or wobbly geometric clip art that make a finished page feel amateur.

### 2. Typography & Hierarchy (No Font & Header Slop)
- ❌ **No kicker / label above headings**: Do not stack small uppercase tracking labels (`FEATURES`, `OVERVIEW`) directly above headings. Work meaningful words into the headline itself.
- ❌ **No hero eyebrow badges/chips**: Avoid floating non-clickable pill badges (`INTRODUCING`, `NEW`) directly above primary headlines.
- ❌ **No oversized hero headlines**: Avoid 60px–80px display headlines that dominate the entire first screen and push core value and actions below the fold.
- ❌ **No flat type hierarchy**: Ensure unmistakable contrast between headings, subheadings, and body copy in size, weight, and color. Never style adjacent levels at near-identical sizes (e.g., 17px vs 16px).
- ❌ **No crushed letter-spacing**: Avoid aggressive negative tracking (`tracking-[-0.06em]` or worse) that causes character collisions.
- ❌ **No lazy font defaults**: Do not default to Inter or Geist everywhere by reflex. Adhere to the project typography (`SF Pro Display`, `SF Pro Text`, system stacks) defined in `DESIGN.md`.
- ❌ **No italic serif display shortcuts**: Avoid reaching for Georgia/Times italic as an unearned shortcut to an "editorial" look.
- ❌ **No icon tiles stacked above headings**: Avoid the predictable AI feature-card pattern of a rounded square icon tile floating centered or left above a heading in a 3-column grid.
- ❌ **No all-caps body text**: Reserve uppercase solely for short, deliberate badges or table headers. Never use all-caps for running sentences.
- ❌ **No undersized interface text**: Never set interactive controls, form labels, or secondary text below 13px.
- ❌ **No tight line-height**: Avoid line heights below 1.35 on multi-line copy; body text should breathe at 1.45–1.55.
- ❌ **No justified text**: Always align body text to the start (left-aligned in LTR) to prevent white space rivers.

### 3. Color & Contrast (No Cyberpunk or Faux-Tasteful Beige Reflexes)
- ❌ **No AI color palette defaults**: Strictly avoid saturated purple-to-blue gradients, electric cyan against black, and cyberpunk neon defaults.
- ❌ **No radial-gradient background halos & spotlights**: Do not place glowing orb gradients or soft spotlights centered behind cards or text blocks.
- ❌ **No gradient text**: Do not use `text-transparent bg-clip-text bg-gradient-to-r` on headings or numbers purely for decoration. Use solid, high-contrast typography.
- ❌ **No dark mode with glowing neon accents**: Do not add glowing colored drop shadows (`0 0 20px rgba(...)`) to dark cards.
- ❌ **No reflexive cream / beige surfaces**: Avoid reaching for oatmeal, linen, or beige backgrounds as a default substitute for a considered palette.
- ❌ **No gray text on colored backgrounds**: Do not place neutral gray text over colored cards where it washes out and fails readability.
- ❌ **Strict WCAG AA contrast**: Maintain at least 4.5:1 for normal body text and 3:1 for large display text against all backgrounds.

### 4. Layout & Spacing (No "Cardocalypse" or Rigid Grids)
- ❌ **No nested cards ("Cardocalypse")**: Never place cards inside cards inside cards. Flatten visual depth using whitespace, subtle dividers, and typographic hierarchy instead of endless nested borders and shadows.
- ❌ **No identical 3x3 card grids**: Avoid formulaic grids where every card has the identical icon, title, and two lines of filler text. Vary the layout according to the content's actual structure.
- ❌ **No hero metric layout without context**: Do not float giant numbers (`10M+`, `99.9%`) in a void with tiny labels beneath unless backed by meaningful context.
- ❌ **No monotonous spacing**: Avoid identical margins and gaps everywhere. Group related elements tightly and leave generous breathing room between distinct sections.
- ❌ **No unbalanced opening columns**: Avoid multi-column hero sections where one side runs 3x longer than the other, creating large empty voids.
- ❌ **No tiny numbered section labels**: Do not prepend decorative `01`, `02`, `03` labels unless the content represents a strict sequential step-by-step workflow.
- ❌ **Respect reading measure**: Cap running text line lengths to 60–75 characters (e.g., `max-w-xl` to `max-w-3xl` for paragraphs, `max-w-5xl` for headings).
- ❌ **No container overflow**: Ensure all text wraps cleanly and interactive elements never trigger unwanted horizontal page scrolling.
- ❌ **No cramped padding**: Ensure touch/click targets have comfortable insets (minimum 44px hit targets, generous button padding).
- ❌ **No text flush against the viewport edge**: Always maintain responsive horizontal gutters (`px-4 sm:px-8`).

### 5. Motion & Interaction (No Restless UI)
- ❌ **No pulsing status dots**: Do not animate pulsing or expanding rings on status indicators when the state is static and unchanging.
- ❌ **No decorative blinking cursors**: Never place a fake terminal-style blinking cursor on static text.
- ❌ **No auto-scrolling marquees**: Avoid looping horizontal logo or text tickers without user pause controls.
- ❌ **No bouncy / elastic overshoot on routine UI**: Keep motion critically damped (`damping: 1.0` or `ease-out`); reserve bounce only for momentum-driven gesture releases.
- ❌ **No animating layout properties**: Never animate `width`, `height`, `margin`, or `top`/`left`. Always animate `transform` and `opacity` for smooth 60fps GPU acceleration.
- ❌ **No hover zoom on every image**: Do not scale or rotate every image card on hover without a functional affordance.
- ❌ **No content hidden at rest**: Never leave content at `opacity: 0` dependent on entrance animations that might fail or cause flash-of-invisible-content.

### 6. UX Writing & Microcopy (No AI Voice)
- ❌ **No generic marketing buzzwords**: Avoid "Supercharge your workflow", "Enterprise-grade", "Next-generation", "Seamless experience", "Revolutionary", and "World-class".
- ❌ **No repeated container text**: Do not repeat the same label across a badge, heading, and button within the same card (e.g. "Ready" badge, "Ready" heading, "Ready" action).
- ❌ **No em-dash overuse**: Do not insert em-dashes into every sentence. Use clean periods and commas.
- ❌ **No aphoristic cadence / forced contrast**: Avoid pretentious slogan pairs ("Not a feature. A platform.", "Less friction. More magic.").
- ❌ **No dismissive "theater" tropes**: Do not dismiss concepts with clichés like "growth theater" or "productivity theater". State the actual technical or user trade-offs directly.

### 7. Design System Alignment (`DESIGN.md`)
- Always inspect and respect documented tokens in `DESIGN.md`:
  - Primary interactive color: Action Blue (`#0066cc`, `#0071e3`, `#2997ff`) or warm Apple amber accents.
  - Neutral palette: Apple ink (`#1d1d1f`), canvas white (`#ffffff`), canvas parchment (`#f5f5f7`), hairline dividers (`#e0e0e0`, `#d2d2d7`).
  - Typography: `SF Pro Display` for titles, `SF Pro Text` for interface and body.
  - Radii scale: Subtle, refined corners (8px–16px), never grotesque over-rounded blobs.

---

## 🚀 Engineering & Verification Standards
- Maintain strict TypeScript type-safety (0 errors on `npx tsc --noEmit`).
- All automated unit and integration tests must pass (`npm test`).
- Ensure serverless builds pass cleanly (`npm run build`).
