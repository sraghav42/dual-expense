---
name: Nordic Ledger
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeed'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#434845'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1f0'
  outline: '#737874'
  outline-variant: '#c3c8c3'
  surface-tint: '#52625a'
  primary: '#0f1e18'
  on-primary: '#ffffff'
  primary-container: '#24332c'
  on-primary-container: '#8b9b92'
  inverse-primary: '#b9cbc0'
  secondary: '#466555'
  on-secondary: '#ffffff'
  secondary-container: '#c8ebd6'
  on-secondary-container: '#4c6b5b'
  tertiary: '#111e10'
  on-tertiary: '#ffffff'
  tertiary-container: '#253324'
  on-tertiary-container: '#8c9c88'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e7dc'
  primary-fixed-dim: '#b9cbc0'
  on-primary-fixed: '#101e18'
  on-primary-fixed-variant: '#3b4a43'
  secondary-fixed: '#c8ebd6'
  secondary-fixed-dim: '#accebb'
  on-secondary-fixed: '#012114'
  on-secondary-fixed-variant: '#2f4d3e'
  tertiary-fixed: '#d7e7d1'
  tertiary-fixed-dim: '#bbcbb6'
  on-tertiary-fixed: '#111f11'
  on-tertiary-fixed-variant: '#3c4b3a'
  background: '#f9f9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-numeric:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.02em
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system draws direct inspiration from Scandinavian functionalism and Dieter Rams’ "ten principles for good design": unobtrusive, honest, thorough down to the last detail, and stripped of ornamental excess. Designed specifically for cohabiting couples, partners, and collaborative duos managing shared finances, it replaces financial anxiety and dense ledger fatigue with an atmosphere of absolute clarity, calm, and mutual trust.

The interface prioritizes high-order legibility, deliberate architectural rhythm, and quiet confidence. Financial friction is eliminated through disciplined visual hierarchy, generous whitespace, tactile clarity in monetary values, and precise status communication. Every element exists solely to inform or facilitate action, rendering complex splits, balances, and shared ledgers effortlessly comprehensible.

## Colors

The palette is rooted in stone neutrals, quiet off-whites, and an understated, muted sage green accent family that signals stability and natural balance rather than institutional austerity.

- **Canvas & Backgrounds:** The core background utilizes `#F9F9F8` (Off-White Chalk), transitioning to `#FFFFFF` for elevated foreground cards and panels. Secondary surfaces and table striping sit on subtle warm stone `#F2F2EF`.
- **Text & Contrast:** Primary text is rendered in deep charcoal `#181A19` for maximum reading comfort without the harshness of pure black. Secondary captions and labels utilize `#6B706E`, while disabled states drop to `#A2A8A5`.
- **Primary & Accent:** The primary tone `#24332C` (Deep Pine Slate) commands high-priority actions, balance totals, and primary keylines. The secondary `#4C6B5B` (Muted Sage) and tertiary `#8A9A86` (Soft Lichen) provide refined context for positive balances, split confirmations, and active filter states.
- **Structural Outlines:** Subtle dividing strokes and panel bounds rely strictly on `#E5E7E4`—a delicate 1px boundary providing crisp edge definition without heavy visual compartmentalization.
- **Semantic Accents:** Owed/Debit states utilize a desaturated clay terracotta (`#A35C51`), while settled/balanced states rely on the signature muted sage (`#4C6B5B`).

## Typography

The typographic hierarchy couples **Geist** for crisp, architectural user interface text with **JetBrains Mono** strictly reserved for monetary amounts, transaction splits, timestamps, and ledger balance alignment.

- **Numerical Uniformity:** Using monospaced figures for all ledger entries and currency rows prevents ragged horizontal movement when viewing dynamic totals side-by-side.
- **Optical Calm:** Tight negative tracking on display headlines emphasizes geometric restraint, while uppercase tags rely on generous positive tracking (`+0.06em`) for clear taxonomy labeling.
- **Vertical Rhythm:** Headings and numeric summaries align to strict proportional baselines to maintain editorial order throughout long expense lists.

## Layout & Spacing

The layout operates on a balanced 12-column grid on desktop (max container width: 1140px, centered) with generous margins that honor negative space as a first-class structural component.

- **Desktop (≥1024px):** 12 columns with 24px gutters and 48px outer margins. Supports an asymmetric dual-pane model: primary shared ledger summary on the left (8 cols), partner settlement balance and quick split module on the right (4 cols).
- **Tablet (768px – 1023px):** 8 columns with 20px gutters and 32px canvas margins. Content reflows vertically; overview metrics stack above transaction logs.
- **Mobile (≤767px):** 4 columns with 12px gutters and 16px page margins. Single-column linear flow prioritizing immediate mutual balance, followed by categorized expenses with floating action triggers.
- **Internal Rhythm:** Component padding relies strictly on geometric multiples: `space-sm` (8px) for badge and input insets, `space-md` (16px) for standard card padding, and `space-xl` (40px) for separating major functional ledger sections.

## Elevation & Depth

Visual hierarchy rejects simulated physical heaviness or glossy drop shadows in favor of Dieter Rams-inspired surface discipline: flat planes delineated by fine micro-borders and ultra-subtle ambient daylight shadows.

- **Structural Borders:** The primary method of surface differentiation is a clean, razor-sharp 1px line using `#E5E7E4`.
- **Level 0 (Base Canvas):** `#F9F9F8` tint. Completely un-elevated.
- **Level 1 (Cards, Ledger Containers):** `#FFFFFF` background bound by a 1px border (`#E5E7E4`) paired with an ambient soft blur: `box-shadow: 0 1px 3px rgba(24, 26, 25, 0.02), 0 4px 16px rgba(24, 26, 25, 0.03)`.
- **Level 2 (Dropdowns, Popovers, Modals):** `#FFFFFF` surface, 1px border (`#E0E3DF`), with an expanded soft shadow: `box-shadow: 0 4px 12px rgba(24, 26, 25, 0.04), 0 12px 32px rgba(24, 26, 25, 0.06)`.
- **Partner Split Indicators:** Subtle tonal fills rather than shadows indicate ownership (e.g., Partner A highlighted with 4% sage wash, Partner B highlighted with 4% neutral slate wash).

## Shapes

The design system maintains an architectural, restrained geometry using a `Soft` corner radius scale. 

- **Cards and Panels:** Standardized to `rounded-lg` (8px / 0.5rem) to provide a gentle, approachable contour while preserving clean grid alignment.
- **Inputs and Form Controls:** Set to base roundedness (4px / 0.25rem) to convey functional precision.
- **Interactive Badges and Status Pills:** Set to full cylindrical bounds (`rounded-full` / 9999px) to establish immediate visual differentiation between structural data containers and categorical metadata.

## Components

### Buttons
- **Primary:** Solid `#24332C` background, `#FFFFFF` text, 4px border radius, 40px height, inset padding `0 16px`. Hover state shifts gently to `#35483F`. Active state settles to `#1B2621`. No drop shadow.
- **Secondary / Ghost:** Transparent background with 1px border in `#E5E7E4`, `#181A19` text. Hover state reveals `#F2F2EF` background with border `#D5D8D4`.
- **Split Action Trigger:** 50/50 dual-segmented button grouping for toggling "Split 50/50", "You Paid", or "Partner Paid", contained in a single 1px framed cradle.

### Status & Categorical Pills
- **Base Style:** Height 22px, pill-rounded (9999px), padding `0 8px`, `label-caps` typography.
- **Settled / Paid:** Background `#EEF3EE`, text `#3D594B`, delicate 1px border `#DDE6DD`.
- **Owed / Pending:** Background `#F8EFEF`, text `#8A473D`, delicate 1px border `#F0DDDB`.
- **Shared Split (Neutral):** Background `#F2F2EF`, text `#525654`, delicate 1px border `#E5E7E4`.

### Lists & Ledger Rows
- Minimal, edge-to-edge layout inside cards with 1px bottom divider `#EBECE8`.
- Hover introduces an imperceptible slate tint (`#F7F8F6`).
- Left region: Date block (`label-caps`) and title (`body-md` in bold charcoal).
- Center region: Partner attribution avatar/initial capsule (20px circular badge).
- Right region: Monetary value formatted in JetBrains Mono (`label-numeric`), followed by individual split breakdown below in `body-sm`.

### Input Fields
- Height 42px, 4px border radius, `#FFFFFF` fill, 1px border `#DCDED9`.
- Typography: `body-md` for text; `label-numeric` when entering currency figures with a static prepended currency glyph in `#8C918E`.
- Focus state: Border transitions to `#24332C` with no colored outer halo—strictly a crisp 1px high-contrast stroke.

### Checkboxes & Radio Controls
- Square 16px boxes with 3px subtle corner radii for checkboxes; 16px circles for radios.
- Unchecked: `#FFFFFF` fill, 1px border `#C8CDC6`.
- Checked: `#24332C` solid fill with an ultra-fine white micro-checkmark or center dot.

### Cards
- Surface: `#FFFFFF`, 8px border radius, 1px boundary `#E5E7E4`.
- Padding: 20px desktop, 16px mobile.
- Section headers within cards utilize `label-caps` in `#6B706E` with generous 12px bottom spacing before content rows.

### Dual Ledger Balance Meter (Specialty Component)
- A streamlined horizontal equilibrium bar situated at the top of the shared ledger.
- Displays the mutual balance status via a central anchor indicator flanked by Partner A and Partner B axes, using the muted sage accent to signify mutual debt resolution.