---
name: Warm Paws Adoption System
colors:
  surface: '#f4faff'
  surface-dim: '#cfdce4'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f6fd'
  surface-container: '#e3f0f8'
  surface-container-high: '#ddeaf2'
  surface-container-highest: '#d7e4ec'
  on-surface: '#111d23'
  on-surface-variant: '#59413a'
  inverse-surface: '#263238'
  inverse-on-surface: '#e6f3fb'
  outline: '#8d7169'
  outline-variant: '#e0bfb6'
  surface-tint: '#ac3509'
  primary: '#ac3509'
  on-primary: '#ffffff'
  primary-container: '#ff7043'
  on-primary-container: '#641800'
  inverse-primary: '#ffb59f'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#8bf1e6'
  on-secondary-container: '#006f67'
  tertiary: '#655d4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a59b8a'
  on-tertiary-container: '#393326'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#852300'
  secondary-fixed: '#8ef4e9'
  secondary-fixed-dim: '#71d7cd'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ede1cf'
  tertiary-fixed-dim: '#d0c5b3'
  on-tertiary-fixed: '#201b10'
  on-tertiary-fixed-variant: '#4d4638'
  background: '#f4faff'
  on-background: '#111d23'
  surface-variant: '#d7e4ec'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is crafted for a compassionate, community-driven, and highly dependable pet adoption platform. It bridges the emotional connection of meeting a future family companion with the rigorous trust, transparency, and structure required for responsible adoption.

### Personality & Tone
- **Warm & Empathetic:** Welcoming, emotionally resonant, and optimistic. The interface invites gentle exploration without overwhelming high-pressure prompts.
- **Trustworthy & Professional:** High legibility, clear health records, structured metadata grids, and verified status badges assure prospective adopters of institutional integrity.
- **Joyful & Playful:** Soft curves, generous organic forms, subtle tactile depth, and friendly micro-interactions create an approachable, human atmosphere.

### Target Audience
Responsible pet adopters, foster families, rescue organizations, shelters, and veterinary partners looking for an intuitive, uplifting, and clear adoption pipeline.

### Visual Style
A warm modern hybrid style combining soft organic neomorphism with clean contemporary UI:
- **Generous Rounded Surfaces:** Heavy utilization of rounded corners (`rounded-2xl` to `rounded-3xl` and full pills) delivering an approachable, non-intimidating aesthetic.
- **Tactile Soft Shadows:** Layered off-white surfaces hovering over ambient tinted backdrops rather than sharp, heavy drop-shadows.
- **Editorial Pet Photography:** Full-bleed portrait cards and expansive photographic framing celebrating each animal's individuality.

## Colors

The palette balances warm emotional enthusiasm with clinical serenity and crisp informational hierarchy.

- **Primary (`#FF7043` - Warm Coral):** Symbolizes vitality, love, and affection. Used for primary calls-to-action (e.g., "Adopt Now", "Get Started"), active category highlights, favorited heart states, and interactive accents. Can be deployed in subtle directional linear gradients (`linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)`) for primary buttons.
- **Secondary (`#4DB6AC` - Soft Teal / Seafoam):** Represents health, care, recovery, and serenity. Applied to secondary actions, medical/vaccination verified chips, shelter badges, interactive map route radii, and direct messaging actions.
- **Tertiary & Highlights (`#FFF3E0` - Soft Apricot Cream):** Serves as an approachable container background for spec badges (Age, Weight, Sex, Breed) and inactive category pills.
- **Neutral & Text (`#263238` - Deep Graphite):** Provides strong contrast and high legibility for headlines and critical body information.
- **Secondary Text (`#78909C` - Slate Grey):** Used for metadata, subtitles, geographic locations, and neutral microcopy.
- **Canvas / Background (`#FAFAF8` - Warm Alabaster):** A warm off-white foundation that eliminates eye fatigue and prevents clinical sterile starkness.
- **Surface (`#FFFFFF` - Pure White):** Reserved for elevated cards, bottom sheets, search pills, and floating navigation bars.

## Typography

The typography leverages **Plus Jakarta Sans** across all roles to unify modern geometric precision with friendly, open letterforms.

- **Headlines & Titles:** Set in bold and semi-bold weights with slight negative letter tracking (`-0.01em` to `-0.03em`) to anchor cards and hero screens with confidence.
- **Pet Spec & Attribute Readouts:** Numerical data (e.g., "11 month", "4.5 Kg", "5 km") use bold weights paired with smaller medium-weight unit labels for swift scannability.
- **Narrative Storytelling:** Pet biographies ("About") use `body-md` with relaxed line spacing (`1.5`) to maximize reading comfort.

## Layout & Spacing

The layout is built upon an 8pt base grid fluidly optimized for mobile-first touch ergonomics:

### Screen Breakpoints & Margins
- **Mobile (<640px):** Single-column stack or 2-column pet card grid. Lateral margins are `16px` (`margin-mobile`), gutter is `12px` (`gutter-mobile`). Bottom padding reserves `88px` of clearance to float above the floating navigation bar.
- **Tablet / Expanded (641px - 1024px):** 2 to 3-column masonry/grid layouts with `24px` margins and `16px` gutters.
- **Desktop (>1024px):** Centered application frame maxing out at `1200px`, utilizing fluid gutters up to `24px`.

### Spacing Density
- **Micro Spacing (`space-xs` to `space-sm`):** Icon-to-label gaps, badge internal padding, and status dot offsets.
- **Component Padding (`space-md` to `space-lg`):** Internal card padding, sheet margins, and form field heights.
- **Section Breaks (`space-xl` to `space-2xl`):** Vertical separation between horizontal carousel categories, map cards, and narrative bio blocks.

## Elevation & Depth

Visual hierarchy uses warm, diffuse ambient shadows to create physical lift without visual clutter.

- **Level 0 (Canvas):** Ground layer at `#FAFAF8`.
- **Level 1 (Card & Content Blocks):** Pure white `#FFFFFF` surfaces with `box-shadow: 0px 4px 16px rgba(38, 50, 56, 0.05)`. Used for pet cards, specification boxes, and text inputs.
- **Level 2 (Floating Action & Nav):** Elevated floating containers (floating bottom nav bar, circular floating action buttons, map control pills) with `box-shadow: 0px 8px 24px rgba(38, 50, 56, 0.08)`.
- **Level 3 (Interactive Bottom Sheet & Modals):** Top-anchored sheet shadows with `box-shadow: 0px -8px 32px rgba(38, 50, 56, 0.12)`.
- **Primary Element Glow:** For primary action buttons, a soft tinted drop-shadow reinforces warmth: `box-shadow: 0px 8px 20px rgba(255, 112, 67, 0.35)`.

## Shapes

The shape philosophy is organic, soft, and inviting:

- **Buttons & Input Fields:** Full pill-shaped radius (`rounded-full` / `9999px`) to invite touch interactions.
- **Cards (Pet Cards, Detail Panels):** Ultra-curved corners (`rounded-2xl` / `16px` to `rounded-3xl` / `24px-32px`) mirroring the friendly contours of animal paws and friendly design principles.
- **Map Bottom Sheets:** Top edges rounded at `32px` (`rounded-t-[32px]`) with a centered pill grab-handle (`width: 36px`, `height: 4px`, `rounded-full`).
- **Pet Badges & Category Containers:** Soft squircle or pill shapes (`16px` to `24px`).

## Components

### 1. Floating Bottom Navigation Bar (5 Tabs)
- **Container:** Floating white pill or deep charcoal container (`#263238` or `#FFFFFF` depending on scene contrast) elevated with Level 2 shadow.
- **Structure:** 5 equal slots: Home, Map/Explore, Favorites, Messages, Profile.
- **Active State:** Primary Coral pill surrounding the active icon with a soft white icon/label or icon-only accentuation.

### 2. Pet Profile Cards
- **Structure:** Generous full-bleed or framed photograph with soft rounded inner/outer masks (`24px`).
- **Overlays:** Top-right floating circular favorite button (white pill with coral heart icon); bottom floating quick-info chip (Breed name, age, distance indicator).
- **Background Tones:** Soft pastel backing colors behind transparent pet cutouts (apricot, mint, sage, warm gold) to differentiate species and breeds.

### 3. Pet Attribute Badges (Health, Age, Sex, Weight)
- **Container:** Soft cream container (`#FFF3E0`) or pure white with borderless Level 1 elevation.
- **Layout:** Centered icon or label (e.g., "Age", "Vaccinated") in `78909C`, accompanied by bold primary value ("11 month", "Yes") in `263238`.

### 4. Interactive Map & Custom Paw Markers
- **Map Styling:** Soft, desaturated warm map tiles with subdued road geometry.
- **Markers:** Teardrop or circular photo badges containing the pet’s headshot bordered by Warm Coral (`#FF7043`) or Soft Teal (`#4DB6AC`). Active marker scales `1.15x` with an ambient glow.
- **Radius Circle:** Translucent coral/teal stroke with 10% opacity fill indicating search proximity (e.g., "5 km").

### 5. Interactive Bottom Sheet
- **Container:** Pure `#FFFFFF` surface sliding over the map with smooth swipe physics.
- **Content:** Pet summary thumbnail, health tags, foster/shelter owner info, and primary contact CTA.

### 6. Buttons & CTAs
- **Primary Action ("Adopt Now", "Get Started"):** Warm coral gradient (`#FF8A65` to `#FF7043`), full pill shape, white bold typography, paired with an optional nested circular white icon arrow at the leading edge.
- **Secondary Action ("Send Message"):** Solid Seafoam Teal (`#4DB6AC`) or soft cream pill with coral text.