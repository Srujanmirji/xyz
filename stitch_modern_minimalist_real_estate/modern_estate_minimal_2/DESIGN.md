---
name: Modern Estate Minimal
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#44474a'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#755a26'
  on-secondary: '#ffffff'
  secondary-container: '#fdd798'
  on-secondary-container: '#785c29'
  tertiary: '#000001'
  on-tertiary: '#ffffff'
  tertiary-container: '#111c2d'
  on-tertiary-container: '#798499'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#e6c183'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5b4311'
  tertiary-fixed: '#d8e3fa'
  tertiary-fixed-dim: '#bcc7dd'
  on-tertiary-fixed: '#111c2c'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  map-price-tag:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  map-control-offset: 16px
---

## Brand & Style

The design system is engineered for high-end property and land acquisitions, prioritizing clarity, prestige, and effortless navigation. The brand personality is authoritative yet understated, reflecting the confidence of luxury real estate through a "Modern Estate Minimal" aesthetic. 

The visual strategy relies on:
- **Spatial Luxury:** Generous whitespace and intentional "breathing room" to elevate high-resolution photography and site plans.
- **Precision:** A focus on technical accuracy and grid-based alignment, ensuring that complex land data feels structured and accessible.
- **Architectural Minimalism:** Drawing inspiration from modern galleries, the UI uses thin strokes, a restrained palette, and high-quality typography to ensure the properties remain the focal point.

## Colors

This design system utilizes a sophisticated, high-contrast palette to distinguish between editorial content and functional data.

- **Primary (#1A1C1E):** A deep, near-black "Obsidian" used for primary text, iconography, and heavy lifting in the UI to convey stability.
- **Secondary (#C5A368):** "Heritage Gold," used sparingly for accents, high-value property status, and primary map markers to denote exclusivity.
- **Tertiary (#4A5568):** A slate grey for secondary metadata, labels, and map boundaries.
- **Neutral (#F8F9FA):** A crisp, clean off-white background that prevents visual fatigue during long browsing sessions.

Map layers should utilize a custom "Silver" or "Monochrome" base style to ensure that property overlays and boundaries provide maximum legibility without competing with the geography.

## Typography

Typography in this design system balances the editorial elegance of luxury publishing with the utilitarian requirements of real estate data. 

**Bodoni Moda** is reserved for high-level headings, property titles, and pricing displays. Its high contrast evokes a sense of heritage and luxury. **Manrope** serves as the workhorse for all functional elements, including property descriptions, technical land specifications, and map controls, providing exceptional legibility at small sizes.

For map interfaces, use the `map-price-tag` token to ensure price points are readable at a glance. Always use `label-caps` for section headers like "SPECIFICATIONS" or "AMENITIES" to maintain an organized, architectural feel.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to ensure a curated, gallery-like experience, while transitioning to a fluid layout for mobile property browsing.

- **Desktop:** 12-column grid with 64px outer margins. Content is centered with a max-width of 1440px. 
- **Map View:** For the search experience, the map should utilize a "Full-Bleed" layout, with UI controls (Zoom, Layers, Filter Bar) floating 16px from the edges.
- **Property Details:** Spacing between sections (e.g., Image Gallery to Description) should be generous (80px–120px) to signify a premium experience.

## Elevation & Depth

This design system avoids heavy shadows, opting for **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

- **Surface Levels:** The base map sits at level 0. Information cards and search filters sit at level 1, separated by a 1px border (#E2E8F0) rather than a shadow.
- **Map Overlays:** Property "Quick View" modals use a subtle backdrop blur (Glassmorphism) to maintain the context of the map while drawing focus to the property details.
- **Active States:** Elements being interacted with (like a selected property marker) should use a crisp, 2px stroke in the secondary "Heritage Gold" color to denote focus.

## Shapes

The shape language is "Soft" (Level 1), utilizing a 0.25rem (4px) base radius. This minimal rounding provides a modern touch without appearing overly "bubbly" or casual, maintaining a professional and geometric architectural feel.

- **Standard Elements:** Buttons, input fields, and map markers use the 4px radius.
- **Large Containers:** Property cards and image carousels use a 8px (0.5rem) radius.
- **Interactive Map Points:** Markers can be rectangular price tags with a slight pointer at the bottom, maintaining the 4px corner radius for consistency.

## Components

### Map UI & Search Experience
- **Map Markers:** Use a horizontal price-tag style (e.g., "$2.4M"). The background is white with a 1px Obsidian border. On hover or selection, the background flips to Obsidian with Heritage Gold text.
- **Land Boundary Overlays:** When a property is selected, the parcel boundary should be highlighted with a 2px Heritage Gold stroke and a 10% Gold fill.
- **Floating Controls:** Map tools (Zoom, Compass, Satellite Toggle) should be grouped in a vertical stack. Use white backgrounds, 1px borders, and Obsidian icons.

### Property Cards
- **Structure:** Large-format imagery followed by a 24px vertical padding for text. 
- **Labels:** Use the `label-caps` typography for property status (e.g., "JUST LISTED" or "UNDER CONTRACT") in a small pill with a light grey background.

### Buttons & Inputs
- **Primary Action:** Solid Obsidian background with white text. No shadow.
- **Secondary Action:** Ghost style with a 1px Obsidian border. 
- **Input Fields:** Search bars should be expansive, using a subtle search icon and the Manrope font. Remove all default browser styling in favor of a bottom-border only or a very light 4-sided stroke.

### Lists & Data
- **Land Specs:** Use a two-column definition list for land data (Acreage, Zoning, Utilities). Labels in Tertiary Grey, values in Obsidian Bold.