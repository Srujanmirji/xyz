---
name: Deep Minimalist
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
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
    fontWeight: '500'
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
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is a sophisticated dark-mode evolution of the real estate experience, prioritizing clarity, luxury, and technical precision. It targets a professional audience seeking a focused, high-end environment for property management and discovery.

The aesthetic blends **Minimalism** with **Modern Corporate** sensibilities. It utilizes a restrained color palette and generous negative space to reduce cognitive load. The atmosphere is quiet and authoritative, using subtle elevation and crisp typography to guide the user through complex data without visual fatigue. The focus remains entirely on property imagery and key performance indicators, framed by a high-fidelity interface.

## Colors

The palette is anchored in deep, atmospheric tones to provide a stable foundation for a premium dark-mode experience.

- **Primary Background (#0f172a):** A deep charcoal navy used for the lowest z-index surfaces.
- **Surface/Container (#1e293b):** A slightly lighter navy used to define functional areas and interactive cards.
- **Accent Blue (#3b82f6):** A vibrant, high-energy blue optimized for visibility against dark backgrounds, used exclusively for primary actions and critical states.
- **Typography:** High-contrast off-white (#f8fafc) ensures maximum legibility for body and headlines, while muted slate gray (#94a3b8) handles secondary information and metadata.

## Typography

This design system utilizes **Geist**, a typeface engineered for precision and readability. The typographic hierarchy is strictly enforced to ensure clarity in data-heavy views. 

Headlines utilize tighter letter-spacing and heavier weights to create a strong visual anchor. Body text maintains a generous line height to prevent "clumping" on dark backgrounds. All labels for buttons and navigation items favor a medium weight to ensure they remain distinct from surrounding body content.

## Layout & Spacing

The layout follows a **Fluid Grid** model with fixed maximum constraints for readability on ultra-wide displays. 

- **Desktop:** A 12-column grid with 24px gutters. Content is centered with a max-width of 1440px.
- **Tablet:** An 8-column grid with 20px gutters. 
- **Mobile:** A 4-column grid with 16px gutters and 16px side margins.

Spacing is based on a 4px baseline grid. Vertical rhythm is established using "stack" variables to ensure consistent grouping of related elements (e.g., 8px between a label and input, 16px between form fields).

## Elevation & Depth

In this dark-mode environment, depth is communicated through **Tonal Layering** rather than traditional shadows. Surfaces physically closer to the user are rendered in lighter shades of navy/charcoal.

1.  **Level 0 (Base):** #0f172a (Primary Background).
2.  **Level 1 (Cards/Panels):** #1e293b (Surface color).
3.  **Level 2 (Modals/Popovers):** #334155 (Lighter slate to indicate floating state).

Where outlines are required, use a low-opacity white (10% opacity) border to define edges without creating harsh visual noise. Shadows, if used for high-importance modals, should be deep, broad, and black (#000000 at 40% opacity) to create a subtle glow effect around the container.

## Shapes

The design system employs a "Rounded" language (0.5rem / 8px base) to soften the technical nature of the Geist typeface.

- **Standard Elements:** 8px (0.5rem) for buttons, input fields, and small cards.
- **Large Containers:** 16px (1rem) for primary dashboard widgets and image containers.
- **Full Radius:** Reserved for status chips and decorative icons.

This consistent 8px-based rounding ensures the UI feels approachable while maintaining its professional architecture.

## Components

### Buttons
- **Primary:** Saturated Blue (#3b82f6) background with White text. No border.
- **Secondary:** Surface (#1e293b) background with a subtle 1px border (#334155). 
- **Ghost:** Transparent background with Muted Gray (#94a3b8) text, shifting to High-Contrast White on hover.

### Input Fields
- Background matches the parent surface but utilizes a 1px border (#334155).
- On focus, the border transitions to the Accent Blue (#3b82f6) with a subtle outer glow.

### Cards
- Use the Surface color (#1e293b).
- Padding should be 24px (stack-lg) for property cards to allow images and text to breathe.

### Chips & Badges
- Backgrounds should use a 10% opacity version of the status color (e.g., Blue for "Active", Green for "Sold") to keep the interface feeling light and modern.

### Property Lists
- Use thin separators (1px, #1e293b) between items rather than boxing each item in its own card, maintaining the minimalist, "no-grid" feel for data density.