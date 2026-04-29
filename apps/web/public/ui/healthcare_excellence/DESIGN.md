---
name: Healthcare Excellence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#43474b'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777c'
  outline-variant: '#c4c7cb'
  surface-tint: '#52606c'
  primary: '#081621'
  on-primary: '#ffffff'
  primary-container: '#1d2b36'
  on-primary-container: '#8492a0'
  inverse-primary: '#b9c8d7'
  secondary: '#006d31'
  on-secondary: '#ffffff'
  secondary-container: '#5efc8d'
  on-secondary-container: '#007233'
  tertiary: '#34000a'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a0018'
  on-tertiary-container: '#ff4f6e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e4f3'
  primary-fixed-dim: '#b9c8d7'
  on-primary-fixed: '#0f1d28'
  on-primary-fixed-variant: '#3a4854'
  secondary-fixed: '#65ff90'
  secondary-fixed-dim: '#3ee276'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#40000f'
  on-tertiary-fixed-variant: '#91002d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
  margin: 24px
---

## Brand & Style

The design system is anchored in the principles of clinical precision and patient-centric care. It balances the authority of a traditional medical institution with the accessibility of modern digital health. The visual language is defined by a **Corporate / Modern** aesthetic, utilizing significant whitespace to reduce cognitive load and evoke a sense of calm and hygiene.

The target audience ranges from elderly patients requiring high legibility to medical professionals needing rapid data processing. The emotional response is one of absolute reliability, safety, and efficiency. Design elements are structured, predictable, and clean, ensuring that users feel supported during both routine bookings and high-stress emergency situations.

## Colors

The palette is meticulously selected to convey trust and urgency through high-contrast pairings. 

- **Primary Deep Navy (#1D2B36):** Used for typography, navigation, and structural elements to provide a grounded, authoritative foundation.
- **Secondary Clinical Green (#00C65E):** Reserved for growth, health indicators, and positive actions like "Booking Confirmed" or "Start Consultation."
- **Emergency Crimson (#C2003F):** High-visibility accent reserved exclusively for critical alerts and emergency call-to-actions.
- **System Neutrals:** A range of soft greys and pure whites are used to layer information without creating visual noise, maintaining the "clean room" feel essential for medical platforms.

## Typography

The design system utilizes **Public Sans** for its exceptional legibility and institutional character. This typeface was chosen for its clean, neutral letterforms that perform well across various screen sizes and resolutions, which is critical for accessible healthcare.

Headlines use semi-bold weights to establish a clear hierarchy, while body text maintains generous line heights to aid readability for users with visual impairments. All labels and metadata use increased letter spacing to ensure clarity at small sizes.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (12 columns, 1280px max-width) and a fluid model on mobile. A strict 4px baseline grid ensures vertical rhythm and alignment across all clinical data points.

Spacing is used to group related medical information. Larger gaps (xl, xxl) are employed between distinct sections to prevent the UI from feeling cluttered. Gutters are kept wide (24px) to ensure that text-heavy medical reports remain breathable and easy to scan.

## Elevation & Depth

To maintain a professional and sterile appearance, the design system utilizes **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surface Tiers:** Backgrounds use `#FFFFFF`, while secondary containers use `#F8FAFC`. This creates a subtle stacked effect.
- **Borders:** 1px solid borders in soft greys define input fields and card boundaries, providing structure without adding visual bulk.
- **Interactive Depth:** Only the most critical elements—such as "Emergency" buttons or active "Booking" cards—receive an **Ambient Shadow** (low-opacity, highly diffused) to lift them slightly above the interface.

## Shapes

The design system adopts a **Soft (0.25rem)** roundedness philosophy. This level of curvature strikes a balance between the precision of sharp edges and the approachability of rounded forms. 

- **Standard Components:** Buttons, inputs, and cards use the base 4px (0.25rem) radius.
- **Large Components:** Hero sections and large informational cards may use a `rounded-lg` (8px) radius to soften the visual impact of large containers.
- **Interactive Elements:** Checkboxes and radio buttons maintain consistent geometric shapes to ensure they are instantly recognizable as interactive form controls.

## Components

### Buttons
- **Emergency Button:** High-priority, using `#C2003F` with white text. It is always the most prominent element in any view where it appears.
- **Primary Action (Booking):** Uses the Primary Deep Navy or Clinical Green. Large padding and bold typography ensure clear intent.
- **Secondary Action:** Ghost buttons with 1px outlines in primary colors.

### Input Fields
- Medical forms must be highly legible. Use 16px font sizes to prevent zooming on mobile devices. Labels are always visible (not floating) to ensure context is never lost.

### Cards
- Patient records and appointment cards use a white background with a subtle `#E2E8F0` border. High-priority status indicators (e.g., "Urgent") are placed in the top-right corner using color-coded badges.

### Chips & Badges
- Used for categorizing medical departments or status (e.g., "Pediatrics", "Pending"). These use low-saturation background tints of the status colors with high-contrast text.

### Additional Components
- **Progress Trackers:** Vital for multi-step appointment booking or health check-ups.
- **Alert Banners:** Used for system-wide notifications, pinned to the top of the viewport.