---
name: Meridian
description: A cinematic decision observatory where assumptions visibly move the outcome.
colors:
  observatory: "oklch(0.115 0.012 178)"
  instrument: "oklch(0.16 0.014 178)"
  instrument-raised: "oklch(0.205 0.018 178)"
  ink: "oklch(0.93 0.012 92)"
  muted: "oklch(0.69 0.022 185)"
  polar-blue: "oklch(0.72 0.10 256)"
  analysis-teal: "oklch(0.75 0.105 188)"
  true-north-brass: "oklch(0.76 0.105 82)"
  skeptic-ember: "oklch(0.65 0.17 34)"
typography:
  display:
    fontFamily: "Sora Variable, sans-serif"
    fontSize: "clamp(2.8rem, 5.8vw, 5.75rem)"
    fontWeight: 420
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Instrument Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 430
    lineHeight: 1.5
  data:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  control: "8px"
  surface: "16px"
  stage: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.true-north-brass}"
    textColor: "{colors.observatory}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  instrument-panel:
    backgroundColor: "{colors.instrument}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "16px"
---

# Design System: Meridian

## 1. Overview

**Creative North Star: "The Decision Observatory"**

Meridian is a scientific instrument used after dark. Its near-black green room, fine meridian grid, cool analytical light, and rare brass indicators make the interface feel measured rather than futuristic. The product uses staged focus instead of a wall of panels: the current reasoning artifact receives space, contrast, and motion while the rest of the instrument recedes.

The design rejects chatbot chronology and dashboard sameness. Agents are represented by original geometric seals, claims become physical artifacts, and the Meridian Axis is the signature object. Depth comes from occlusion, tonal planes, narrow highlights, and controlled camera drift rather than decorative glass.

**Key Characteristics:**

- Dark environmental stage with restrained full-palette instrumentation
- Asymmetric, phase-responsive desktop composition
- Brass reserved for the current leader and decisive actions
- Teal for analysis, ember for red-team interventions
- Motion concentrated at decomposition, challenge, recomputation, and verdict

## 2. Colors

The palette behaves like low-light navigation equipment: mostly dark mineral surfaces, cool data light, and two scarce material signals.

### Primary

- **Polar Optic** (`oklch(0.72 0.10 256)`): focus rings, active paths, and secondary analytical emphasis.
- **Analysis Phosphor** (`oklch(0.75 0.105 188)`): model output, confidence, citations, and live calculation.

### Secondary

- **True North Brass** (`oklch(0.76 0.105 82)`): the leader, the meridian needle, and the primary action. Its rarity creates authority.

### Tertiary

- **Skeptic Ember** (`oklch(0.65 0.17 34)`): challenges, hidden tradeoffs, and downside pressure.

### Neutral

- **Observatory Void** (`oklch(0.115 0.012 178)`): environmental background.
- **Instrument Face** (`oklch(0.16 0.014 178)`): primary working plane.
- **Raised Instrument** (`oklch(0.205 0.018 178)`): focused controls and artifacts.
- **Luminous Ink** (`oklch(0.93 0.012 92)`): primary text.
- **Patina Label** (`oklch(0.69 0.022 185)`): secondary labels with AA contrast.

**The Brass Rule.** Brass marks true north, not decoration. Keep it below ten percent of the visible surface.

## 3. Typography

**Display Font:** Sora Variable (with sans-serif fallback)  
**Body Font:** Instrument Sans Variable (with sans-serif fallback)  
**Label/Mono Font:** IBM Plex Mono

**Character:** Sora gives the opening and verdict a geometric, navigational authority. Instrument Sans stays quiet and legible during the dense reasoning stage. IBM Plex Mono is confined to inputs, modeled values, timestamps, and factor readouts.

### Hierarchy

- **Display** (420, up to 5.75rem, 0.98): intake and verdict only.
- **Headline** (520, 1.65rem, 1.08): phase titles and dominant findings.
- **Title** (560, 1rem, 1.2): paths, agents, and artifacts.
- **Body** (430, 0.95rem, 1.5): explanatory copy, capped near 70 characters.
- **Label** (500, 0.72rem, 0.04em): short instrument labels only.

**The Two-Voices Rule.** Display type announces a phase; body type operates the product. Never use display type for controls or data labels.

## 4. Elevation

Meridian uses tonal layering and narrow light instead of floating-card shadows. Surfaces remain attached to the observatory. A focused artifact may receive a faint colored ambient shadow, while the Skeptic intervention casts a brief ember wash across the stage.

### Shadow Vocabulary

- **Instrument Well** (`inset 0 1px 0 color-mix(in oklch, white 6%, transparent), 0 24px 70px rgba(0,0,0,.28)`): major stage planes.
- **Analytical Signal** (`0 0 32px color-mix(in oklch, var(--analysis) 18%, transparent)`): active analytical output.
- **True North Signal** (`0 0 42px color-mix(in oklch, var(--brass) 20%, transparent)`): current leader only.

**The Attached Surface Rule.** Panels belong to one machine. Lift only the active artifact, never every container.

## 5. Components

### Buttons

- **Shape:** compact machined rectangle (8px radius), never a pill.
- **Primary:** brass fill, dark text, 12px by 18px padding.
- **Hover / Focus:** brighter material response, 2px polar-blue focus ring, slight upward translation.
- **Ghost:** transparent with a quiet full border and luminous text.

### Chips

- **Style:** low-chroma tonal fill, full 1px border, mono or compact body label.
- **State:** selected values use an icon and stronger border so meaning does not depend on color.

### Cards / Containers

- **Corner Style:** 16px for artifacts, 24px for the full stage.
- **Background:** Instrument Face or Raised Instrument.
- **Shadow Strategy:** attached at rest, ambient signal only while active.
- **Border:** one-pixel mineral line around the complete object.
- **Internal Padding:** 14–20px depending on information density.

### Inputs / Fields

- **Style:** dark inset field with one-pixel border and 8px radius.
- **Focus:** polar-blue border and visible outline.
- **Error / Disabled:** ember with explicit copy; reduced opacity plus disabled cursor.

### Navigation

The stable stage uses a compact top instrument rail rather than conventional navigation. Recording mode removes developer controls but preserves the Meridian mark and local/private status.

### Meridian Axis

A custom SVG instrument with three path markers, a brass true-north needle, confidence traces, and a labeled zero-to-one-hundred scale. Marker movement uses spring-like easing without bounce. The current leader is stated in text as well as color.

## 6. Do's and Don'ts

### Do:

- **Do** stage attention so one reasoning artifact dominates each phase.
- **Do** use phase-driven transforms to create depth without a scrolling presentation.
- **Do** preserve readable contrast and visible keyboard focus throughout the dark theme.
- **Do** use original SVG seals and instrument geometry instead of stock avatars.
- **Do** keep every recording-runtime asset and request local.

### Don't:

- **Don't** use a generic purple AI gradient.
- **Don't** build a boring SaaS dashboard or plain chatbot transcript.
- **Don't** imitate a cyberpunk terminal or childish cartoon game UI.
- **Don't** create a cluttered analytics interface with equal-weight panels.
- **Don't** use gradient text, decorative glassmorphism, side-stripe cards, or repeated icon-card grids.
- **Don't** add random parallax, bounce easing, stock agent portraits, remote fonts, or runtime image URLs.
