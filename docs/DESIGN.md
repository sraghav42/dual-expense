---
name: Dual Expense
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
  payer-user-1: '#6366f1'
  on-payer-user-1: '#4338ca'
  payer-user-1-container: '#eef2ff'
  payer-user-1-outline: '#c7d2fe'
  payer-user-2: '#14b8a6'
  on-payer-user-2: '#0f766e'
  payer-user-2-container: '#ccfbf1'
  payer-user-2-outline: '#99f6e4'
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

This design system draws direct inspiration from Scandinavian functionalism and Dieter Rams’ "ten principles for good design": unobtrusive, honest, thorough down to the last detail, and stripped of ornamental excess. Designed specifically for 2-user households and partners tracking individual and shared spending, it replaces financial anxiety and complex ledger fatigue with an atmosphere of absolute clarity, calm, and mutual transparency.

The interface avoids split-bill calculations, owed balances, or debt-settlement logic. Instead, it serves as a lightweight, single-payer expense logger. Every expense entry belongs to exactly one user, providing effortless side-by-side visibility into each person's monthly total while displaying a consolidated household spending metric. Financial friction is eliminated through disciplined visual hierarchy, generous whitespace, tactile monetary typography, and instant category awareness.

## Colors

The YAML color tokens above are canonical. Component guidance below refers to those tokens rather than introducing competing color values. The payer-specific tokens distinguish the two fixed household users.

- **Canvas & Backgrounds:** Use `background` for the page canvas, `surface-container-lowest` for cards and dialogs, and the `surface-container-*` tokens for progressively differentiated surfaces.
- **Text & Contrast:** Use `on-surface` for primary text, `on-surface-variant` for secondary text, and the corresponding `on-*` token for text on colored surfaces.
- **Primary & Accent:** Use `primary` for primary actions and high-priority totals. `primary-container`, `secondary`, and `tertiary` provide supporting emphasis.
- **Structural Outlines:** Use `outline-variant` for subtle dividers and component boundaries; use `outline` for stronger field or icon details.
- **User Payer Accents:** Use the `payer-user-1*` and `payer-user-2*` tokens for payer controls and badges. Category pills use `surface-container-low`, `on-surface-variant`, and `outline-variant`.

## Typography

The typographic hierarchy couples **Geist** for crisp, architectural user interface text with **JetBrains Mono** strictly reserved for monetary amounts, timestamps, and spending totals.

- **Numerical Uniformity:** Using monospaced figures for all expense entries and monthly sums prevents ragged horizontal movement when viewing dynamic individual and consolidated totals side-by-side.
- **Optical Calm:** Tight negative tracking on display headlines emphasizes geometric restraint, while uppercase tags rely on generous positive tracking (`+0.06em`) for clear taxonomy labeling.
- **Vertical Rhythm:** Headings and numeric summaries align to strict proportional baselines to maintain editorial order throughout long transaction feeds.

## Layout & Spacing

The layout operates on a balanced 12-column grid on desktop (max container width: 1140px, centered) with generous margins that honor negative space as a first-class structural component.

- **Desktop (≥1024px):** 12 columns with 24px gutters and 48px outer margins. Supports an integrated 2-column layout:
  - **Top Hero Section (12 cols):** Consolidated household monthly spending banner.
  - **Middle Section (6 cols / 6 cols):** Side-by-side individual summary cards for User 1 and User 2.
  - **Bottom Section (12 cols):** Chronological transaction feed with quick filtering.
- **Tablet (768px – 1023px):** 8 columns with 20px gutters and 32px canvas margins. Content reflows vertically; overview metrics stack above the transaction log.
- **Mobile (≤767px):** 4 columns with 12px gutters and 16px page margins. Single-column linear flow prioritizing the total household spend, followed by stacked individual user totals and a simplified expense feed with a floating "+ Add Expense" trigger.
- **Add Expense Modal / View:** A distraction-free, centered 6-column container (max-width: 480px) with dedicated amount display, payer selector toggle, date picker, category grid, and description field.
- **Internal Rhythm:** Component padding relies strictly on geometric multiples: `space-sm` (8px) for badge and input insets, `space-md` (16px) for standard card padding, and `space-xl` (40px) for separating major dashboard modules.

## Elevation & Depth

Visual hierarchy rejects simulated physical heaviness or glossy drop shadows in favor of Dieter Rams-inspired surface discipline: flat planes delineated by fine micro-borders and ultra-subtle ambient daylight shadows.

- **Structural Borders:** The primary method of surface differentiation is a clean, razor-sharp 1px line using `outline-variant`.
- **Level 0 (Base Canvas):** `background` token. Completely un-elevated.
- **Level 1 (Cards, Expense Containers):** `surface-container-lowest` background bound by a 1px `outline-variant` border, paired with an ambient soft blur: `box-shadow: 0 1px 3px rgba(26, 28, 28, 0.02), 0 4px 16px rgba(26, 28, 28, 0.03)`.
- **Level 2 (Dropdowns, Popovers, Modals):** `surface-container-lowest` surface, 1px `outline-variant` border, with an expanded soft shadow: `box-shadow: 0 4px 12px rgba(26, 28, 28, 0.04), 0 12px 32px rgba(26, 28, 28, 0.06)`.
- **User Ownership Indicators:** Subtle tonal background washes distinguish user ownership (e.g., User 1 highlighted with soft indigo tone, User 2 highlighted with muted teal tone).

## Shapes

The design system maintains an architectural, restrained geometry using a `Soft` corner radius scale. 

- **Cards and Panels:** Standardized to `rounded-lg` (8px / 0.5rem) to provide a gentle, approachable contour while preserving clean grid alignment.
- **Inputs and Form Controls:** Set to base roundedness (4px / 0.25rem) to convey functional precision.
- **Interactive Badges and Status Pills:** Set to full cylindrical bounds (`rounded-full` / 9999px) to establish immediate visual differentiation between structural data containers and categorical metadata.

## Components

### Buttons
- **Primary:** Solid `primary` background, `on-primary` text, 4px border radius, 40px height, inset padding `0 16px`. Hover and active states use `primary-container`. No drop shadow.
- **Secondary / Ghost:** Transparent background with a 1px `outline-variant` border and `on-surface` text. Hover uses `surface-container-low` and `outline`.

### Payer Toggle Component
- Single-payer segmented toggle button for selecting who paid for an expense entry.
- 2-option container (`[ User 1 ]` vs `[ User 2 ]`) framed in a single 1px `outline-variant` border cradle.
- Active state highlights the chosen user with their respective payer container and foreground tokens.

### User Payer Badges & Category Pills
- **Base Style:** Height 22px, pill-rounded (9999px), padding `0 8px`, `label-caps` typography.
- **User 1 Badge:** Use `payer-user-1-container`, `on-payer-user-1`, and `payer-user-1-outline`.
- **User 2 Badge:** Use `payer-user-2-container`, `on-payer-user-2`, and `payer-user-2-outline`.
- **Category Pill:** Use `surface-container-low`, `on-surface-variant`, and `outline-variant`.

### Transaction Feed Rows
- Minimal, edge-to-edge layout inside cards with a 1px bottom divider in `outline-variant`.
- Hover uses `surface-container-low`.
- Left region: Date block (`label-caps`) and title (`body-md` in bold charcoal).
- Center region: Category pill and User Payer Badge (single payer).
- Right region: Expense amount formatted in JetBrains Mono (`label-numeric`), followed by a delete action. Deletion requires confirmation; editing is out of scope for v1.

### Input Fields
- Height 42px, 4px border radius, `surface-container-lowest` fill, 1px `outline-variant` border.
- Typography: `body-md` for text; `label-numeric` when entering currency figures with a static prepended currency glyph in `outline`.
- Focus state: Border transitions to `primary` with no colored outer halo—strictly a crisp 1px high-contrast stroke.

### Date Picker Field
- Minimal input trigger showing selected expense date with calendar icon prefix.
- Quick action pills adjacent to the picker: `[ Today ]` and `[ Yesterday ]` for instant single-tap selection.

### Cards
- Surface: `surface-container-lowest`, 8px border radius, 1px `outline-variant` boundary.
- Padding: 20px desktop, 16px mobile.
- Section headers within cards utilize `label-caps` in `on-surface-variant` with generous 12px bottom spacing before content rows.

### Consolidated vs. Individual Spending Ratio Bar
- A streamlined horizontal proportion bar situated inside the hero spending card.
- Displays the relative contribution percentage of total household spending incurred by User 1 (`payer-user-1`) versus User 2 (`payer-user-2`) for the selected month.