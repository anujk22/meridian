---
target: Meridian front page intake
total_score: 24
p0_count: 0
p1_count: 3
timestamp: 2026-06-21T19-26-09Z
slug: src-components-intake-tsx
---
# Meridian Intake Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | The launch state does not preview what the council will do or how the selected mode changes the run. |
| 2 | Match System / Real World | 3 | Decision language is clear, but “Curated council” and “Live local” require product knowledge. |
| 3 | User Control and Freedom | 3 | The decision remains editable and modes are selectable, but three launch-adjacent actions compete. |
| 4 | Consistency and Standards | 2 | Intake uses a marketing-hero grammar while deliberation uses an operational instrument grammar. |
| 5 | Error Prevention | 3 | Character limits, disabled submission, and model selection prevent common invalid states. |
| 6 | Recognition Rather Than Recall | 3 | Main actions are visible, but the difference between the two modes is not explained in context. |
| 7 | Flexibility and Efficiency | 2 | A useful default is present, but duplicate launch controls and no direct accelerator slow expert use. |
| 8 | Aesthetic and Minimalist Design | 2 | The giant headline, decorative council preview, path list, hero CTAs, and composer compete for primacy. |
| 9 | Error Recovery | 3 | Errors are announced and the draft is preserved, though recovery guidance is limited. |
| 10 | Help and Documentation | 1 | No contextual help explains the council process, modes, or expected output. |
| **Total** | | **24/40** | **Acceptable, significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment:** Yes, the intake reads as AI-generated more readily than the council. It uses a saturated landing-page formula: tiny tracked eyebrow, oversized generic promise, explanatory paragraph, path-name row, primary and secondary hero buttons, decorative diagram, and a full-width form card. Each element is polished, but the composition is category-generic and does not express Meridian’s causal reasoning model.

**Deterministic scan:** The detector returned zero findings for `src/components/Intake.tsx`. This is not a contradiction. The implementation avoids mechanically detectable bans; the weakness is product architecture and visual narrative.

**Visual overlays:** Browser injection was attempted after mutation preflight succeeded, but the page CSP blocked `http://localhost:8400/detect.js` under `script-src 'self' 'unsafe-inline'`. No reliable user-visible overlay is available.

## Overall Impression

The intake looks like an advertisement for Meridian. The council looks like Meridian. The biggest opportunity is to make intake the first operational state of the Decision Observatory rather than a landing page placed before it.

## What’s Working

- The custom atlas and agent glyphs establish a recognizable visual world.
- The palette, typography, and dark-room atmosphere already match the council.
- The decision draft, local mode, character limit, and direct launch action provide a sound functional base.

## Priority Issues

### [P1] Intake and deliberation feel like different products

**Why it matters:** The council promises an inspectable instrument, while intake presents a generic hero. The transition feels like entering a better product after dismissing its marketing page.

**Fix:** Reuse the council shell and phase language on intake. Introduce a compact three-step rail such as “Frame decision”, “Council deliberation”, and “Test assumptions”. Treat intake as phase zero of the same observatory.

**Suggested command:** `/impeccable shape`

### [P1] The composer is visually subordinate to decorative content

**Why it matters:** The user’s real task is entering or accepting a decision brief, yet the headline and static orbit consume most of the first impression.

**Fix:** Make a “Decision Brief” the dominant artifact near the center-left. Reduce the headline to a compact stage title and one line of guidance. Keep the atlas adjacent as a responsive preview of what the brief will activate.

**Suggested command:** `/impeccable layout`

### [P1] Three launch-adjacent actions create false choice

**Why it matters:** “Convene my council”, “Enter my own decision”, and “Run council” imply different paths even though two submit and one only focuses the existing composer.

**Fix:** Keep one primary action, “Convene council”, attached to the Decision Brief. Replace the hero buttons with a quiet “Use example decision” utility and let focusing the composer happen naturally.

**Suggested command:** `/impeccable clarify`

### [P2] The atlas is beautiful but non-informative on intake

**Why it matters:** In the council, lines, agents, assumptions, memos, and motion communicate state. On intake, the same object is ornamental, which makes the surface feel like a mockup.

**Fix:** Give the preview operational state. Show “Council standing by”, highlight which four questions each agent will test, and let prompt focus or mode changes alter the instrument. On submission, preserve the atlas position and transition it into the council scene.

**Suggested command:** `/impeccable animate`

### [P2] The mode control exposes implementation before value

**Why it matters:** “Curated council” and “Live local” describe execution, not user outcome. First-time users cannot predict the tradeoff.

**Fix:** Default to the reliable path, move mode selection into a compact “Run settings” disclosure, and add one-line outcomes such as “Prepared demo” and “Local model, private on this device”.

**Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Jordan, first-time user:** Sees three plausible starting actions and two unexplained reasoning modes. The static agent orbit does not explain what the council produces, so the most distinctive product promise remains abstract.

**Hackathon judge, silent evaluator:** The opening resembles a familiar AI landing page and does not immediately demonstrate inspectable reasoning. The stronger product thesis only becomes visible after launch.

**Graduating CS student:** The sample decision is useful, but the interface does not show how goals, constraints, evidence, and assumptions will be separated. They are asked to trust the process before seeing its structure.

## Cognitive Load

Moderate, with three checklist failures: no single task focus, weak hierarchy around the composer, and unnecessary simultaneous choices. Working-memory load is not excessive, but the user must interpret several elements that appear equally relevant to starting.

## Minor Observations

- “Four-agent decision council” is a classic tracked eyebrow and contributes to the landing-template feeling.
- The stable/startup/research row looks like navigation but is not interactive.
- The top-level promise describes the outcome abstractly instead of showing the product’s concrete decomposition model.
- The front-page atlas should either carry state or be simplified; its current middle ground reads decorative.

## Questions to Consider

- What if intake opened directly inside the observatory shell, already labeled “Phase 0: Frame the decision”?
- What if the central artifact were the user’s decision brief, with the atlas reacting around it?
- Can the transition into deliberation preserve spatial continuity so the front page visibly becomes the council rather than navigating to it?
