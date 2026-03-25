# Light Mode Toggle — Design Spec

**Date:** 2025-03-25  
**Status:** Draft  
**Scope:** Landing page theme toggle (dark ↔ light)

## Goal

Add a light mode toggle to the portfolio landing page, giving visitors a choice between the existing dark "Pacific Lifted Classic" theme and a new "Limestone" light theme. Motivation is polish and variety — making the site feel more complete.

## Palette: Limestone Light Theme

The light theme uses cooler off-white backgrounds with a deep terra cotta accent that's intentionally darker than the dark theme's bright terracotta, so it reads well on light surfaces.

| Token | Dark Value | Light Value |
|-------|-----------|-------------|
| `--landing-bg` | `#1C2228` | `#F7F4F0` |
| `--landing-bg-sidebar` | `#141A1F` | `#EFEBE4` |
| `--landing-bg-card` | `#2A3540` | `#EFEBE4` |
| `--landing-bg-card-hover` | `#324050` | `#E6E0D6` |
| `--landing-bg-card-gradient` | `linear-gradient(135deg, #2A3540, #324050)` | `linear-gradient(135deg, #EFEBE4, #E6E0D6)` |
| `--landing-text` | `#EDE8E0` | `#1F1A14` |
| `--landing-text-muted` | `#8A9AA8` | `#5C5248` |
| `--landing-text-dim` | `rgba(237,232,224,0.3)` | `rgba(31,26,20,0.3)` |
| `--landing-accent` | `#E09B6C` | `#A65D2E` |
| `--landing-accent-bg` | `rgba(224,155,108,0.14)` | `rgba(166,93,46,0.10)` |
| `--landing-accent-bg-hover` | `rgba(224,155,108,0.22)` | `rgba(166,93,46,0.18)` |
| `--landing-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |
| `--landing-border-hover` | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.10)` |
| `--landing-particle-rgb` (new) | `224, 155, 108` | `166, 93, 46` |

## Architecture

### Approach: CSS Custom Properties + next-themes

The landing page already uses `--landing-*` CSS custom properties for all styling. The implementation adds a `.light .landing-theme` CSS block that overrides these variables when `next-themes` sets `class="light"` on `<html>`.

**Why this approach:**
- Zero component rewrites — only CSS vars change
- `next-themes` (already installed) handles localStorage persistence, SSR hydration, and flash prevention
- Particle canvas is the only JS code that needs theme awareness

### Files Changed

| File | Change |
|------|--------|
| `src/components/ThemeProvider.tsx` | **New** — wraps next-themes ThemeProvider |
| `src/components/landing/ThemeToggle.tsx` | **New** — Sun/Moon toggle button |
| `src/app/layout.tsx` | Add ThemeProvider wrapper |
| `src/app/globals.css` | Add `.light .landing-theme` var block, orbital ring var migration, transitions |
| `src/components/landing/ParticleCanvas.tsx` | Read particle color from CSS var, MutationObserver for theme changes |
| `src/components/landing/MediaCard.tsx` | Light-mode placeholder gradients via useTheme |
| `src/components/landing/Hero.tsx` | Mount ThemeToggle in top-right |
| `src/components/landing/Sidebar.tsx` | Mount ThemeToggle in footer area |

### Files NOT Changed

All other landing components (About, Skills, Experience, Contact, Projects, BentoHero, LandingShell) use CSS classes exclusively — they inherit theme changes automatically through CSS variable overrides.

## Component Details

### ThemeProvider (`src/components/ThemeProvider.tsx`)

```
'use client'
Wraps next-themes ThemeProvider with:
- attribute="class"
- defaultTheme="dark"
- themes={["dark", "light"]}
- disableTransitionOnChange={false}
```

Added to root `layout.tsx`, wrapping `{children}` and `<Toaster />`.

### ThemeToggle (`src/components/landing/ThemeToggle.tsx`)

- Client component using `useTheme()` from `next-themes`
- Renders `<Sun />` icon in dark mode, `<Moon />` icon in light mode (lucide-react)
- Click handler: `setTheme(theme === 'dark' ? 'light' : 'dark')`
- Styled with landing theme tokens (transparent bg, muted text color, border on hover)
- CSS rotation animation on toggle: 180° spin with spring easing
- `suppressHydrationWarning` to avoid SSR mismatch
- Renders `null` until `mounted` state is true (prevents hydration flash)

### Placement

**Hero (pre-scroll):** Absolute positioned, `top: 24px; right: 32px` within `.landing-hero`. Fades out with the hero section via existing scroll opacity logic.

**Sidebar (post-scroll):** Placed in the sidebar footer area, alongside the status indicator and social links. Visible once sidebar slides in.

Both instances are the same `<ThemeToggle />` component with different CSS classes for positioning.

### ParticleCanvas Theme Awareness

Current state: Hardcoded `rgba(224, 155, 108, ...)` in 3 draw operations.

Change:
1. On mount, read `--landing-particle-rgb` from `getComputedStyle(document.documentElement)`
2. Store in a ref (`colorRef`)
3. Use in draw loop: `` `rgba(${colorRef.current}, ${alpha})` ``
4. Set up `MutationObserver` on `<html>` element's `class` attribute to detect theme changes
5. When class changes, re-read the CSS variable and update the ref
6. Canvas redraws every frame — color change is immediate and smooth

### MediaCard Placeholder Gradients

Current state: `GRADIENTS` array with 3 hardcoded dark gradient strings.

Change:
- Add `LIGHT_GRADIENTS` array with warm, muted light-mode gradients
- Use `useTheme()` to select the correct array
- Example light gradients:
  - `linear-gradient(135deg, #E8E2D8 0%, #D4CCC0 40%, #E0D8CC 100%)`
  - `linear-gradient(135deg, #E5E0D8 0%, #D8D0C5 40%, #DDD5C8 100%)`
  - `linear-gradient(135deg, #EAE5DD 0%, #D6CFC3 40%, #E2DAD0 100%)`

### Orbital Ring CSS Migration

Current state: Hardcoded `rgba(224, 155, 108, ...)` values in ring border styles.

Change: Replace with CSS variable references:
- Ring 1 border: `1px solid color-mix(in srgb, var(--landing-accent) 16%, transparent)`
- Ring 2 border: `1px dashed color-mix(in srgb, var(--landing-accent) 8%, transparent)`
- Ring 3 border: `1px solid color-mix(in srgb, var(--landing-accent) 5%, transparent)`
- Orbit dot background: `var(--landing-accent)`
- Orbit dot box-shadow: uses `var(--landing-accent)` with opacity variants
- Avatar glow: references `var(--landing-accent)` instead of hardcoded rgba

## Transitions

- `.landing-theme` and descendants: `transition: background-color 0.4s ease, color 0.3s ease, border-color 0.3s ease`
- Applied at the `.landing-theme` level so all children inherit
- Toggle button: 180° icon rotation with `cubic-bezier(0.34, 1.56, 0.64, 1)`, scale pulse 1 → 1.15 → 1
- Canvas: no transition needed — redraws every frame

## What's NOT In Scope

- System preference detection (`prefers-color-scheme`) — can be added later
- Dashboard theme toggle — dashboard uses shadcn's own dark/light system, separate concern
- Theme transition overlay effects (clip-path reveal, etc.) — v2 consideration
- Per-page theme memory — single global toggle via localStorage

## Testing Strategy

- Unit test: ThemeToggle renders correct icon based on theme
- Unit test: ThemeProvider renders children
- Visual verification: both themes render correctly across all landing sections
- No-flash test: hard refresh in both themes shows correct theme immediately
- Mobile: toggle accessible and visible on small screens (hero toggle only — sidebar hidden on mobile)

## Mobile Considerations

The current site doesn't have explicit mobile styles for the sidebar (it's hidden off-screen on mobile). The hero ThemeToggle serves as the primary mobile toggle. If/when a mobile nav is added, the toggle should be included there.
