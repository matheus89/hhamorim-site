---
name: HH Amorim
description: Site de marca para diagnostico e registro de marcas no INPI.
colors:
  paper: "oklch(0.975 0.018 155)"
  paper-soft: "oklch(0.94 0.035 150)"
  ink: "oklch(0.18 0.035 165)"
  muted: "oklch(0.46 0.035 165)"
  line: "oklch(0.84 0.035 155)"
  brand: "oklch(0.31 0.085 165)"
  brand-deep: "oklch(0.22 0.07 165)"
  mint: "oklch(0.86 0.09 160)"
  sun: "oklch(0.86 0.14 83)"
  coral: "oklch(0.68 0.16 38)"
  surface: "oklch(0.99 0.008 155)"
  danger: "oklch(0.47 0.13 28)"
typography:
  display:
    fontFamily: "Aptos, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(3.2rem, 7vw, 6.7rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "0"
  headline:
    fontFamily: "Aptos, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.8rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "0"
  title:
    fontFamily: "Aptos, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.24rem"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "Aptos, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Aptos, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  field: "16px"
  md: "22px"
  card: "34px"
  hero: "44px"
  pill: "999px"
spacing:
  xs: "10px"
  sm: "12px"
  md: "18px"
  lg: "28px"
  xl: "44px"
  section: "clamp(74px, 10vw, 122px)"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "13px 20px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
    padding: "13px 20px"
    height: "50px"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "28px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
    height: "54px"
---

# Design System: HH Amorim

## 1. Overview

**Creative North Star: "The Careful Trademark Studio"**

The HH Amorim interface should feel like a careful studio for a legal asset: warm enough for entrepreneurs, precise enough for intellectual property, and visually confident enough to avoid the generic legal-office mold. The current system uses a committed teal-green identity, a sunlit yellow field, and a coral action accent to make the page feel active without becoming aggressive.

The design is brand-led, not app-like. The page should move with large rounded surfaces, asymmetric image composition, clear explanatory sections, and direct CTAs that point people toward "Verifique sua marca". It must reject the cold law-firm brochure, the guru-style launch page, and the generic SaaS landing page with empty metrics.

**Key Characteristics:**
- Large, confident type with short and direct messaging.
- Rounded, tactile containers that feel approachable rather than bureaucratic.
- Deep green authority balanced by sun and coral accents.
- Real imagery and layered cards in the hero, never abstract placeholders.
- Form-first conversion, with the diagnostic presented as a calm next step.

## 2. Colors

The palette is a confident green legal-studio system with warm diagnostic accents. The surface is soft and lightly tinted, never pure white.

### Primary

- **Studio Green** (`brand`): Main action color for primary buttons, brand mark, and selected states. It carries authority without falling into corporate navy.
- **Deep Registry Green** (`brand-deep`): Used for the header CTA, footer, dark quote panel, and benefit section background. It anchors the site when the message becomes serious.

### Secondary

- **Evidence Sun** (`sun`): Warm yellow used for pricing and hero accent geometry. It makes the brand feel accessible and helps break the legal category reflex.
- **Action Coral** (`coral`): Used for labels, process numbers, and progress bars. It should behave as a sparing signal color, not as a full-page theme.

### Tertiary

- **Soft Mint** (`mint`): Reserved for gentle supporting accents and future success or educational states.

### Neutral

- **Paper Wash** (`paper`): Main page background. It keeps the site light without using pure white.
- **Soft Paper Layer** (`paper-soft`): Used for pills and secondary nested surfaces.
- **Ink Green** (`ink`): Main text color, darker and warmer than black.
- **Muted Counsel** (`muted`): Paragraph and supporting text color.
- **Hairline Green** (`line`): Borders and section dividers.
- **Legal Surface** (`surface`): Cards, forms, buttons, and elevated panels.

### Named Rules

**The No Pure White Rule.** Never use pure white or pure black. Every neutral must stay tinted toward the green brand world.

**The Coral Is A Signal Rule.** Coral is for attention, progress, labels, and numbered moments. Do not turn it into the dominant brand color.

## 3. Typography

**Display Font:** Aptos with Segoe UI, system-ui, and platform sans fallbacks.
**Body Font:** Aptos with Segoe UI, system-ui, and platform sans fallbacks.
**Label Font:** Aptos, uppercase, tracked.

**Character:** The typography is single-family and weight-driven. It should feel like a contemporary service brand with a legal backbone: blunt, readable, and confident.

### Hierarchy

- **Display** (900, `clamp(3.2rem, 7vw, 6.7rem)`, `0.92`): Hero headline only. Use for one dominant idea per first fold.
- **Headline** (900, `clamp(2.4rem, 5vw, 4.8rem)`, `0.98`): Major section statements.
- **Title** (900, `1.24rem`, `1.2`): Card titles, process headings, and form section headings.
- **Body** (400, `1rem`, `1.55`): Paragraph copy. Cap dense explanatory text to roughly 65-75 characters where possible.
- **Label** (900, `0.78rem`, `0.12em`, uppercase): Short orientation labels only. Do not repeat it mechanically above every small section.

### Named Rules

**The One Family Confidence Rule.** Stay in one sans family and create hierarchy with weight, size, and spacing. Do not introduce a decorative serif just to appear premium.

**The Short Sentence Rule.** Headings should feel spoken and direct: "Verifique sua marca", "Nada de burocracia escondida", "Sua marca esta segura para crescer?"

## 4. Elevation

The system uses a hybrid of tonal layering and soft ambient elevation. Most containers rely on background, border, and radius. Shadows appear on important floating objects: the hero photo, hero cards, the diagnostic form, and confirmation panels.

### Shadow Vocabulary

- **Ambient Lift** (`0 24px 70px oklch(0.18 0.035 165 / 0.14)`): Use for large conversion surfaces and hero imagery.
- **Header Float** (`0 12px 40px oklch(0.18 0.035 165 / 0.09)`): Use only for sticky navigation.
- **Hero Card Lift** (`0 16px 44px oklch(0.18 0.035 165 / 0.16)`): Use for small floating proof cards layered over imagery.

### Named Rules

**The Calm Elevation Rule.** Shadows must be broad and soft. If a card looks like a dashboard widget, the shadow is too literal.

## 5. Components

### Buttons

- **Shape:** Fully pill-shaped (`999px`) with a minimum height of `50px`.
- **Primary:** Studio Green background with Legal Surface text. Use for "Verifique sua marca", "Continuar", and form submission.
- **Hover / Focus:** Hover shifts to Deep Registry Green and moves up `1px`. Focus uses browser outline plus form field focus treatment where applicable.
- **Secondary:** Legal Surface background, Studio Green text, Hairline Green border.
- **Light:** Legal Surface background, Deep Registry Green text, for buttons inside dark or saturated blocks.

### Chips

- **Style:** Proof-strip chips are pill containers with Legal Surface background, Hairline Green border, centered text, and strong weight.
- **Purpose:** Use for reassuring facts, not stats theater. They should say concrete things like "Atendimento online" or "Validade nacional".

### Cards / Containers

- **Corner Style:** Large tactile rounding (`34px`) for main cards; hero surface uses `44px`.
- **Background:** Legal Surface for cards, Deep Registry Green for serious emphasis, Evidence Sun for pricing.
- **Shadow Strategy:** Flat by default. Add Ambient Lift only for high-priority conversion or visual layering.
- **Border:** Hairline Green, usually `1px`.
- **Internal Padding:** Card padding sits around `28px`, with larger sections using `clamp(30px, 5vw, 58px)`.

### Inputs / Fields

- **Style:** Soft surface fields with a `16px` radius, Hairline Green stroke, and `54px` minimum height.
- **Focus:** Border shifts to Studio Green and gains a subtle green focus halo.
- **Error / Disabled:** Error color uses Danger Clay. Disabled states should lower opacity, not switch to gray slabs.

### Navigation

- **Style:** Sticky floating pill at desktop sizes, full-width bar on tablet and mobile.
- **Typography:** Brand text is bold and compact. Links are muted until hover.
- **Mobile Treatment:** Hide nav links and header CTA below `680px`; keep the brand clear and avoid cramped menus.

### Signature Component

The hero image stack combines a decisive photo, warm abstract backing shape, and two floating cards. This is the signature brand object. Preserve it when extending the homepage or building campaign variants.

## 6. Do's and Don'ts

### Do:

- **Do** use Studio Green and Deep Registry Green as the authority base.
- **Do** keep the diagnostic form prominent, calm, and friction-light.
- **Do** use real imagery for the hero or equivalent brand surfaces.
- **Do** explain risk with sober language and clear next steps.
- **Do** preserve large rounded surfaces, broad spacing, and asymmetric layout.

### Don't:

- **Don't** make the site look like an escritorio juridico engessado, frio ou excessivamente formal.
- **Don't** make it look like uma pagina de guru de marketing with urgency tricks, exaggerated claims, or infoproduct aesthetics.
- **Don't** make it look like uma landing page generica de SaaS with empty metrics, repeated cards, decorative gradients, or fake dashboards.
- **Don't** promise "registro garantido", "aprovacao certa", or "marca disponivel" without prior analysis.
- **Don't** suggest any official relationship with INPI.
- **Don't** use pure black, pure white, side-stripe accent borders, or gradient text.
