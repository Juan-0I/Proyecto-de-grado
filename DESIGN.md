---
name: Vital Tech Clinic
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#6c7b6d'
  outline-variant: '#bbcbbb'
  surface-tint: '#006d37'
  primary: '#006d37'
  on-primary: '#ffffff'
  primary-container: '#2ecc71'
  on-primary-container: '#005027'
  inverse-primary: '#4ae183'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#5b5f62'
  on-tertiary: '#ffffff'
  tertiary-container: '#b0b3b6'
  on-tertiary-container: '#414548'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfe9c'
  primary-fixed-dim: '#4ae183'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#43474a'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-mono:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 20px
---

## Brand & Style
The brand personality centers on the concept of "Digital Wellness." This design system treats mobile device repair with the precision of a clinic and the innovation of a tech lab. The target audience includes both urgent repair seekers and tech enthusiasts looking for quality electronics.

The visual style is **Corporate / Modern** with a focus on high-clarity and functional reliability. It utilizes a systematic approach to layout and color to evoke a sense of professional expertise, immediate trust, and technical proficiency. The interface should feel organized, clean, and highly responsive, mirroring the efficiency of the repair services offered.

## Colors
The palette is led by a vibrant, medium-light "Signal Green," symbolizing both technical "go" status and device health. 

- **Primary**: Used for call-to-actions, status indicators, and branding elements. It should be applied to indicate successful repairs or "active" states.
- **Secondary/Tertiary**: These light greys and whites create a sterile, organized environment that lets product images and service icons stand out.
- **Neutral**: A deep charcoal used for all primary text to ensure high legibility and a grounded, professional feel. 
- **Functional**: Use a subtle red (#FF4757) only for "critical damage" alerts or urgent warnings.

## Typography
Inter is used across the entire system for its exceptional legibility and neutral, systematic appearance. 

The type hierarchy prioritizes clarity of information. Headlines use tight letter-spacing and heavy weights to appear authoritative. Body text maintains a generous line-height to ensure repair guides and service terms remain accessible. For technical specs or device model numbers, use the `label-mono` style to give a subtle "data-sheet" feel.

## Layout & Spacing
This design system utilizes a **Fluid Grid** based on an 8px square rhythm. 

- **Desktop**: A 12-column layout with 24px gutters. Use large margins (48px) to frame the content, emphasizing the "clean clinic" aesthetic.
- **Tablet**: An 8-column layout with 16px gutters.
- **Mobile**: A 4-column layout with 16px gutters and 20px side margins.

Content should be grouped into distinct logical blocks with vertical spacing typically set at 48px or 64px to prevent the UI from feeling cluttered with technical information.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and extremely soft **Ambient Shadows**. 

The design remains mostly flat to maintain a "modern tech" feel, using light grey backgrounds (`#F8F9FA`) to define sections. Elevate interactive cards and product modals using a subtle shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`. Avoid heavy blurs; the goal is to make components feel like physical tools resting on a clean workbench. Use 1px borders in `#E9ECEF` for structural separation instead of shadows where possible.

## Shapes
The shape language is **Soft** (0.25rem - 0.75rem). This strikes a balance between the precision of sharp corners and the approachability of fully rounded ones. 

- **Buttons & Inputs**: 0.25rem (4px) corner radius for a precise, "tooled" look.
- **Service Cards**: 0.5rem (8px) corner radius to differentiate them from smaller interactive elements.
- **Image Containers**: 0.75rem (12px) to give product photos a modern, premium framing.

## Components
- **Buttons**: The Primary button is the green repair action. It features a solid fill with white text. The "Find us on Google Maps" button should use a secondary style (white background, thin grey border, primary green text) accompanied by a location icon.
- **Service Lists**: Use horizontal layouts for services. Include an icon (e.g., a cracked screen icon), the service name in `headline-sm`, and a "Starting from" price in `label-mono`.
- **Product Grids**: Electronics should be housed in simple cards with a 1px border. Product titles use `body-md` bold, with prices highlighted in the primary green.
- **Input Fields**: Use a "form-clinic" style—clean white backgrounds, 1px grey borders that turn primary green on focus, and clear `label-bold` headers.
- **Status Chips**: Small, rounded badges used to indicate repair progress (e.g., "In Progress" in amber, "Ready for Pickup" in primary green).
- **Repair Tracker**: A vertical or horizontal stepper component with thin lines and circular nodes to show customers exactly where their device is in the repair pipeline.