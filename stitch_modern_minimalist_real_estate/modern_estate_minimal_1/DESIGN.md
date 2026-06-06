---
name: Modern Estate Minimal
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in high-end minimalism, drawing inspiration from industry leaders like Apple and Notion to create an atmosphere of transparency, efficiency, and premium quality. The target audience consists of discerning property seekers and professional real estate agents who value clarity over clutter.

The aesthetic blends **Minimalism** with **Corporate Modern** sensibilities. It prioritizes generous whitespace to allow high-quality property imagery to breathe, utilizing a restrained color palette and precise typography to convey a sense of calm authority. The interface should feel "invisible," reducing cognitive load so the user can focus entirely on the properties and data presented.

## Colors

The palette is intentionally restrained to maintain a professional SaaS appearance. 

- **Primary Blue (#2563EB):** Used exclusively for primary actions, active states, and critical highlights. It represents trust and technological precision.
- **Surface & Backgrounds:** The system uses a multi-layered neutral approach. `Neutral Base` is used for the page background, while `Surface` (White) is reserved for cards and interactive components to create depth through color rather than heavy lines.
- **Accents:** Subtle grays (#F3F4F6) are used for secondary buttons and dividers to maintain a soft, low-friction visual hierarchy.

In **Dark Mode**, the surfaces shift to deep navies and slates rather than pure black to preserve the "high-end" feel and reduce eye strain, while the primary blue is slightly brightened for better contrast.

## Typography

The design system utilizes **Geist** for its entire type scale. Geist’s monolinear strokes and geometric clarity provide the "developer-grade" precision required for a modern SaaS platform while remaining approachable for a consumer real estate app.

- **Headlines:** Use tight letter-spacing and heavier weights to create impact. The `headline-xl` is reserved for hero sections and property titles.
- **Body:** Standardized at 16px for optimal readability. Line heights are generous (1.5x) to ensure large blocks of property descriptions remain legible.
- **Labels:** Small caps or increased letter spacing should be applied to `label-md` when used for category headers or metadata (e.g., "SQUARE FEET").

## Layout & Spacing

This design system follows a **Fixed Grid** approach for desktop viewing, centering content within a 1280px container to ensure readability on ultra-wide monitors. 

- **Grid:** A 12-column system is used for dashboard and listing views. Property cards typically span 3 columns (4-up) or 4 columns (3-up) depending on the level of detail required.
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Mobile Adaptivity:** On mobile devices, the layout transitions to a fluid single-column stack with 16px side margins. Horizontal scrolling "peek" cards are preferred over vertical lists for property discovery.
- **Whitespace:** Use `stack-lg` (32px) between major sections to maintain the minimalist "breathable" feel.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layers** and **Ambient Shadows**. 

- **Level 0 (Background):** `neutral-base` (#F9FAFB).
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border (#E5E7EB) and a very soft, diffused shadow (Offset: 0, 4px; Blur: 6px; Opacity: 0.05).
- **Level 2 (Hover/Active):** Slightly deeper shadow (Blur: 12px; Opacity: 0.1) to indicate interactivity.
- **Level 3 (Modals/Popovers):** Higher elevation with a backdrop blur (12px) to simulate a glass-like overlay, keeping the underlying property context visible but softened.

Avoid heavy black shadows; instead, use shadows tinted with the primary blue or a cool slate to keep the UI looking clean and integrated.

## Shapes

The design system employs a **Rounded** shape language to soften the "industrial" feel of real estate data. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Main property image containers and featured cards use `rounded-lg` (16px) to create a distinct, friendly silhouette.
- **Specialty Shapes:** Search bars and tags may use a pill-shape (full radius) to differentiate them from functional data containers.

## Components

### Buttons
- **Primary:** Solid Blue background (#2563EB), white text. No gradient. 8px corner radius.
- **Secondary:** Light Gray background (#F3F4F6), dark slate text. Used for "Save" or "Share" actions.
- **Ghost:** Transparent background with Primary Blue text. Used for navigation and low-priority actions.

### Cards
Property cards are the core of the experience. They must feature a 1px subtle border, `rounded-lg` corners, and a white background. Images within cards should have a 0px top radius and 0px bottom radius if they fill the card width, or inherit the 8px radius if they sit inside a margin.

### Input Fields
Inputs use a white background with a 1px gray border. On focus, the border color shifts to Primary Blue with a 2px "halo" (shadow) of the same color at 20% opacity.

### Chips & Badges
Used for property status (e.g., "For Sale", "New Construction"). Use a soft-tinted background (e.g., light blue background with dark blue text) rather than high-contrast colors to keep the UI elegant.

### Navigation
A top-fixed, blurred transparency navigation bar. Use simple Geist-font links with a 2px blue underline for the active state.