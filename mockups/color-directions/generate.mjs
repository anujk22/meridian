import { chromium } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const appUrl = 'http://127.0.0.1:4173/?recording=1&speed=20'

const directions = [
  {
    id: 'garden-club',
    name: 'Garden Club',
    note: 'Grounded and generous. Leaf green leads; marigold, berry, and tomato make each path feel distinct.',
    swatches: ['oklch(0.61 0.16 145)', 'oklch(0.78 0.15 82)', 'oklch(0.61 0.19 20)', 'oklch(0.61 0.16 338)'],
    agentHue: { stable: 84, startup: 18, research: -10, skeptic: 88 },
    light: {
      void: 'oklch(0.975 0.018 145)',
      voidDeep: 'oklch(0.945 0.035 145)',
      instrument: 'oklch(0.995 0.008 145)',
      raised: 'oklch(0.965 0.026 145)',
      soft: 'oklch(0.94 0.042 145)',
      ink: 'oklch(0.24 0.055 145)',
      inkSoft: 'oklch(0.36 0.06 145)',
      muted: 'oklch(0.48 0.055 145)',
      dim: 'oklch(0.63 0.045 145)',
      line: 'oklch(0.72 0.075 145 / 0.78)',
      lineSoft: 'oklch(0.79 0.055 145 / 0.48)',
      primary: 'oklch(0.55 0.16 145)',
      primaryPale: 'oklch(0.84 0.10 145)',
      analysis: 'oklch(0.55 0.13 184)',
      risk: 'oklch(0.58 0.20 25)',
      stable: 'oklch(0.52 0.15 330)',
      startup: 'oklch(0.69 0.16 66)',
      research: 'oklch(0.54 0.14 180)',
      onAccent: 'oklch(0.99 0.004 145)',
      surface: 'oklch(0.995 0.006 145)',
      surfaceSubtle: 'oklch(0.955 0.03 145)',
      track: 'oklch(0.84 0.055 145)',
      shadow: '0 18px 60px oklch(0.40 0.08 145 / 0.13)',
    },
    dark: {
      void: 'oklch(0.15 0.035 145)',
      voidDeep: 'oklch(0.105 0.028 145)',
      instrument: 'oklch(0.19 0.04 145)',
      raised: 'oklch(0.23 0.045 145)',
      soft: 'oklch(0.25 0.042 145)',
      ink: 'oklch(0.95 0.018 145)',
      inkSoft: 'oklch(0.82 0.035 145)',
      muted: 'oklch(0.71 0.045 145)',
      dim: 'oklch(0.58 0.045 145)',
      line: 'oklch(0.49 0.075 145 / 0.78)',
      lineSoft: 'oklch(0.41 0.065 145 / 0.52)',
      primary: 'oklch(0.73 0.16 145)',
      primaryPale: 'oklch(0.86 0.095 145)',
      analysis: 'oklch(0.76 0.13 180)',
      risk: 'oklch(0.72 0.18 27)',
      stable: 'oklch(0.74 0.14 333)',
      startup: 'oklch(0.80 0.15 76)',
      research: 'oklch(0.76 0.13 180)',
      onAccent: 'oklch(0.13 0.035 145)',
      surface: 'oklch(0.19 0.04 145)',
      surfaceSubtle: 'oklch(0.17 0.035 145)',
      track: 'oklch(0.32 0.06 145)',
      shadow: '0 22px 72px oklch(0.04 0.03 145 / 0.45)',
    },
  },
  {
    id: 'fruit-stand',
    name: 'Fruit Stand',
    note: 'Warm, optimistic, and a little cheeky. Persimmon is the action color, balanced by blackberry ink and fresh mint.',
    swatches: ['oklch(0.64 0.20 35)', 'oklch(0.60 0.18 350)', 'oklch(0.72 0.13 165)', 'oklch(0.80 0.14 84)'],
    agentHue: { stable: 45, startup: -18, research: -24, skeptic: 52 },
    light: {
      void: 'oklch(0.976 0.018 18)',
      voidDeep: 'oklch(0.946 0.034 18)',
      instrument: 'oklch(0.995 0.007 18)',
      raised: 'oklch(0.965 0.026 18)',
      soft: 'oklch(0.94 0.042 18)',
      ink: 'oklch(0.25 0.075 345)',
      inkSoft: 'oklch(0.37 0.07 345)',
      muted: 'oklch(0.50 0.06 345)',
      dim: 'oklch(0.65 0.045 345)',
      line: 'oklch(0.75 0.075 18 / 0.78)',
      lineSoft: 'oklch(0.82 0.055 18 / 0.5)',
      primary: 'oklch(0.59 0.20 35)',
      primaryPale: 'oklch(0.83 0.105 38)',
      analysis: 'oklch(0.55 0.13 165)',
      risk: 'oklch(0.55 0.18 350)',
      stable: 'oklch(0.50 0.14 290)',
      startup: 'oklch(0.65 0.20 38)',
      research: 'oklch(0.53 0.13 165)',
      onAccent: 'oklch(0.99 0.004 35)',
      surface: 'oklch(0.995 0.006 18)',
      surfaceSubtle: 'oklch(0.958 0.026 18)',
      track: 'oklch(0.86 0.05 18)',
      shadow: '0 18px 60px oklch(0.42 0.09 20 / 0.13)',
    },
    dark: {
      void: 'oklch(0.15 0.045 345)',
      voidDeep: 'oklch(0.105 0.034 345)',
      instrument: 'oklch(0.19 0.05 345)',
      raised: 'oklch(0.23 0.055 345)',
      soft: 'oklch(0.25 0.05 345)',
      ink: 'oklch(0.95 0.02 18)',
      inkSoft: 'oklch(0.83 0.038 18)',
      muted: 'oklch(0.72 0.045 18)',
      dim: 'oklch(0.59 0.045 18)',
      line: 'oklch(0.48 0.09 345 / 0.8)',
      lineSoft: 'oklch(0.40 0.075 345 / 0.54)',
      primary: 'oklch(0.72 0.19 35)',
      primaryPale: 'oklch(0.86 0.10 38)',
      analysis: 'oklch(0.78 0.13 165)',
      risk: 'oklch(0.73 0.17 350)',
      stable: 'oklch(0.75 0.14 290)',
      startup: 'oklch(0.78 0.17 52)',
      research: 'oklch(0.78 0.13 165)',
      onAccent: 'oklch(0.16 0.045 345)',
      surface: 'oklch(0.19 0.05 345)',
      surfaceSubtle: 'oklch(0.17 0.043 345)',
      track: 'oklch(0.32 0.07 345)',
      shadow: '0 22px 72px oklch(0.04 0.03 345 / 0.46)',
    },
  },
  {
    id: 'art-class',
    name: 'Art Class',
    note: 'The most expressive direction. Inky violet gives structure while poppy, lilac, and aqua make the council feel collaborative.',
    swatches: ['oklch(0.59 0.20 300)', 'oklch(0.65 0.20 24)', 'oklch(0.75 0.13 190)', 'oklch(0.80 0.13 92)'],
    agentHue: { stable: 48, startup: -18, research: 0, skeptic: 88 },
    light: {
      void: 'oklch(0.975 0.018 300)',
      voidDeep: 'oklch(0.945 0.034 300)',
      instrument: 'oklch(0.995 0.006 300)',
      raised: 'oklch(0.965 0.026 300)',
      soft: 'oklch(0.94 0.04 300)',
      ink: 'oklch(0.24 0.075 300)',
      inkSoft: 'oklch(0.37 0.07 300)',
      muted: 'oklch(0.50 0.06 300)',
      dim: 'oklch(0.65 0.045 300)',
      line: 'oklch(0.74 0.08 300 / 0.78)',
      lineSoft: 'oklch(0.81 0.055 300 / 0.5)',
      primary: 'oklch(0.54 0.20 300)',
      primaryPale: 'oklch(0.83 0.10 300)',
      analysis: 'oklch(0.55 0.13 190)',
      risk: 'oklch(0.58 0.20 24)',
      stable: 'oklch(0.53 0.18 300)',
      startup: 'oklch(0.64 0.20 31)',
      research: 'oklch(0.53 0.13 190)',
      onAccent: 'oklch(0.99 0.004 300)',
      surface: 'oklch(0.995 0.006 300)',
      surfaceSubtle: 'oklch(0.958 0.027 300)',
      track: 'oklch(0.85 0.055 300)',
      shadow: '0 18px 60px oklch(0.40 0.10 300 / 0.13)',
    },
    dark: {
      void: 'oklch(0.15 0.05 300)',
      voidDeep: 'oklch(0.105 0.038 300)',
      instrument: 'oklch(0.19 0.055 300)',
      raised: 'oklch(0.23 0.06 300)',
      soft: 'oklch(0.25 0.055 300)',
      ink: 'oklch(0.95 0.018 300)',
      inkSoft: 'oklch(0.83 0.038 300)',
      muted: 'oklch(0.72 0.045 300)',
      dim: 'oklch(0.59 0.045 300)',
      line: 'oklch(0.49 0.095 300 / 0.8)',
      lineSoft: 'oklch(0.41 0.08 300 / 0.54)',
      primary: 'oklch(0.72 0.18 300)',
      primaryPale: 'oklch(0.86 0.095 300)',
      analysis: 'oklch(0.78 0.13 190)',
      risk: 'oklch(0.73 0.18 24)',
      stable: 'oklch(0.74 0.17 300)',
      startup: 'oklch(0.77 0.18 40)',
      research: 'oklch(0.78 0.13 190)',
      onAccent: 'oklch(0.15 0.05 300)',
      surface: 'oklch(0.19 0.055 300)',
      surfaceSubtle: 'oklch(0.17 0.048 300)',
      track: 'oklch(0.32 0.075 300)',
      shadow: '0 22px 72px oklch(0.04 0.035 300 / 0.46)',
    },
  },
]

function themeCss(tokens) {
  return `
    --void: ${tokens.void};
    --void-deep: ${tokens.voidDeep};
    --instrument: ${tokens.instrument};
    --instrument-raised: ${tokens.raised};
    --instrument-soft: ${tokens.soft};
    --ink: ${tokens.ink};
    --ink-soft: ${tokens.inkSoft};
    --muted: ${tokens.muted};
    --dim: ${tokens.dim};
    --line: ${tokens.line};
    --line-soft: ${tokens.lineSoft};
    --polar: ${tokens.primary};
    --brass: ${tokens.primary};
    --brass-pale: ${tokens.primaryPale};
    --analysis: ${tokens.analysis};
    --ember: ${tokens.risk};
    --stable: ${tokens.stable};
    --startup: ${tokens.startup};
    --research: ${tokens.research};
    --axis-dim: ${tokens.track};
    --shadow-blue: ${tokens.shadow};
    --surface-solid: ${tokens.surface};
    --surface-card: ${tokens.surface};
    --surface-translucent: ${tokens.surface};
    --surface-subtle: ${tokens.surfaceSubtle};
    --surface-highlight: ${tokens.raised};
    --track: ${tokens.track};
    --on-accent: ${tokens.onAccent};
    --landing-background: linear-gradient(128deg, ${tokens.voidDeep}, ${tokens.void} 52%, color-mix(in oklch, ${tokens.void} 86%, ${tokens.primary}));
    --simulation-background: radial-gradient(circle at 16% 18%, color-mix(in oklch, ${tokens.primary} 11%, transparent), transparent 29%), radial-gradient(circle at 82% 68%, color-mix(in oklch, ${tokens.analysis} 9%, transparent), transparent 32%), linear-gradient(150deg, ${tokens.voidDeep}, ${tokens.void});
    --verdict-background: radial-gradient(circle at 12% 18%, color-mix(in oklch, ${tokens.primary} 12%, transparent), transparent 28%), radial-gradient(circle at 86% 76%, color-mix(in oklch, ${tokens.analysis} 9%, transparent), transparent 32%), linear-gradient(135deg, ${tokens.voidDeep}, ${tokens.void});
  `
}

function directionCss(direction) {
  return `
    html[data-theme='light'] { ${themeCss(direction.light)} }
    html[data-theme='dark'] { ${themeCss(direction.dark)} }
    html[data-theme='dark'] .phase-zero,
    html[data-theme='light'] .phase-zero {
      background:
        radial-gradient(circle at 72% 43%, color-mix(in oklch, var(--polar) 17%, transparent), transparent 26%),
        radial-gradient(circle at 94% 80%, color-mix(in oklch, var(--analysis) 9%, transparent), transparent 29%),
        linear-gradient(128deg, var(--void-deep), var(--void) 50%, color-mix(in oklch, var(--void) 87%, var(--polar)));
    }
    .agent-glyph--stableAdvocate,
    .council-agent--stableAdvocate,
    .agent-memo--stableAdvocate,
    .orbit-agent--stableAdvocate,
    .standby-agent--stableAdvocate { --glyph-color: var(--stable); --orbit-color: var(--stable); }
    .agent-glyph--startupAdvocate,
    .council-agent--startupAdvocate,
    .agent-memo--startupAdvocate,
    .orbit-agent--startupAdvocate,
    .standby-agent--startupAdvocate { --glyph-color: var(--startup); --orbit-color: var(--startup); }
    .agent-glyph--researchAdvocate,
    .council-agent--researchAdvocate,
    .agent-memo--researchAdvocate,
    .orbit-agent--researchAdvocate,
    .standby-agent--researchAdvocate { --glyph-color: var(--research); --orbit-color: var(--research); }
    .agent-glyph--skeptic,
    .council-agent--skeptic,
    .agent-memo--skeptic,
    .orbit-agent--skeptic,
    .standby-agent--skeptic { --glyph-color: var(--ember); --orbit-color: var(--ember); }
    .agent-glyph--stableAdvocate img { filter: hue-rotate(${direction.agentHue.stable}deg) drop-shadow(0 0 12px color-mix(in oklch, var(--stable) 48%, transparent)) drop-shadow(0 12px 18px color-mix(in oklch, var(--stable) 22%, transparent)); }
    .agent-glyph--startupAdvocate img { filter: hue-rotate(${direction.agentHue.startup}deg) drop-shadow(0 0 12px color-mix(in oklch, var(--startup) 48%, transparent)) drop-shadow(0 12px 18px color-mix(in oklch, var(--startup) 22%, transparent)); }
    .agent-glyph--researchAdvocate img { filter: hue-rotate(${direction.agentHue.research}deg) drop-shadow(0 0 12px color-mix(in oklch, var(--research) 48%, transparent)) drop-shadow(0 12px 18px color-mix(in oklch, var(--research) 22%, transparent)); }
    .agent-glyph--skeptic img { filter: hue-rotate(${direction.agentHue.skeptic}deg) drop-shadow(0 0 12px color-mix(in oklch, var(--ember) 48%, transparent)) drop-shadow(0 12px 18px color-mix(in oklch, var(--ember) 22%, transparent)); }
    .atlas-globe { background: radial-gradient(circle, color-mix(in oklch, var(--polar) 16%, transparent), transparent 62%); }
    .atlas-globe::before { box-shadow: 0 0 54px color-mix(in oklch, var(--polar) 24%, transparent); }
    .atlas-globe.is-active::before,
    .atlas-globe.is-preparing::before { box-shadow: 0 0 72px color-mix(in oklch, var(--polar) 34%, transparent); }
    .meridian-core__svg { filter: drop-shadow(0 16px 26px color-mix(in oklch, var(--polar) 14%, transparent)); }
    html[data-theme='light'] .meridian-core__glass { fill: color-mix(in oklch, var(--polar) 9%, white); stroke: color-mix(in oklch, var(--polar) 44%, transparent); }
    html[data-theme='dark'] .meridian-core__glass { fill: transparent; stroke: color-mix(in oklch, var(--polar) 52%, transparent); }
    .meridian-core__rim { stroke: color-mix(in oklch, var(--polar) 84%, transparent); }
    .meridian-core__grid { stroke: color-mix(in oklch, var(--polar) 20%, transparent); }
    .meridian-core__radials { stroke: color-mix(in oklch, var(--polar) 16%, transparent); }
    .meridian-core__orbit { stroke: color-mix(in oklch, var(--polar) 58%, transparent); }
    .meridian-core__orbit--two { stroke: color-mix(in oklch, var(--analysis) 46%, transparent); }
    .meridian-core__orbit--three { stroke: color-mix(in oklch, var(--polar) 28%, transparent); }
    .meridian-core__axis { fill: var(--polar); stroke: color-mix(in oklch, var(--polar) 78%, black); }
    .meridian-core__pulse { fill: color-mix(in oklch, var(--polar) 9%, transparent); stroke: color-mix(in oklch, var(--polar) 38%, transparent); }
    .meridian-core__star { fill: color-mix(in oklch, var(--polar) 34%, transparent); stroke: color-mix(in oklch, var(--polar) 88%, black); }
    .meridian-core__center-ring { stroke: var(--polar); }
    .meridian-core__center { stroke: var(--polar); }
    .meridian-core__shimmers { filter: drop-shadow(0 0 5px color-mix(in oklch, var(--polar) 70%, transparent)); }
    *, *::before, *::after { animation: none !important; caret-color: transparent !important; }
  `
}

async function dataUrl(path) {
  return `data:image/png;base64,${(await readFile(path)).toString('base64')}`
}

async function captureDirection(browser, direction) {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    await context.addInitScript((selectedTheme) => {
      window.localStorage.setItem('meridian-theme', selectedTheme)
    }, theme)
    const page = await context.newPage()
    await page.goto(appUrl, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: directionCss(direction) })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(120)
    await page.screenshot({ path: join(outputDirectory, `${direction.id}-${theme}-intake.png`) })

    await page.getByRole('button', { name: 'Convene council' }).click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(outputDirectory, `${direction.id}-${theme}-council.png`) })
    await context.close()
  }

  const images = {}
  for (const theme of ['light', 'dark']) {
    for (const view of ['intake', 'council']) {
      images[`${theme}-${view}`] = await dataUrl(join(outputDirectory, `${direction.id}-${theme}-${view}.png`))
    }
  }

  const board = await browser.newPage({ viewport: { width: 1900, height: 1360 }, deviceScaleFactor: 1 })
  await board.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #211f26; background: #f2f0f4; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          main { width: 1900px; min-height: 1360px; padding: 54px 58px 62px; }
          header { display: grid; grid-template-columns: 1fr auto; gap: 50px; align-items: end; margin-bottom: 38px; }
          .eyebrow { margin: 0 0 8px; color: #6e6976; font-size: 18px; font-weight: 650; }
          h1 { margin: 0; font-size: 58px; letter-spacing: -0.045em; line-height: 1; }
          p { max-width: 880px; margin: 14px 0 0; color: #5d5865; font-size: 21px; line-height: 1.42; }
          .swatches { display: flex; gap: 12px; padding-bottom: 4px; }
          .swatches i { display: block; width: 64px; height: 64px; border: 7px solid white; border-radius: 50%; box-shadow: 0 5px 18px rgb(45 37 52 / 14%); }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
          figure { position: relative; overflow: hidden; margin: 0; border: 8px solid white; border-radius: 22px; background: white; box-shadow: 0 20px 55px rgb(45 37 52 / 12%); }
          figure img { display: block; width: 100%; height: 500px; object-fit: cover; object-position: center; }
          figcaption { position: absolute; left: 22px; top: 20px; padding: 9px 13px; color: #211f26; border-radius: 9px; background: rgb(255 255 255 / 90%); box-shadow: 0 5px 14px rgb(25 20 30 / 12%); font-size: 15px; font-weight: 750; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
              <div class="eyebrow">Meridian color direction</div>
              <h1>${direction.name}</h1>
              <p>${direction.note}</p>
            </div>
            <div class="swatches">${direction.swatches.map((color) => `<i style="background:${color}"></i>`).join('')}</div>
          </header>
          <section class="grid">
            <figure><img src="${images['light-intake']}" /><figcaption>Light · Intake</figcaption></figure>
            <figure><img src="${images['dark-intake']}" /><figcaption>Dark · Intake</figcaption></figure>
            <figure><img src="${images['light-council']}" /><figcaption>Light · Council</figcaption></figure>
            <figure><img src="${images['dark-council']}" /><figcaption>Dark · Council</figcaption></figure>
          </section>
        </main>
      </body>
    </html>
  `, { waitUntil: 'load' })
  await board.screenshot({ path: join(outputDirectory, `${direction.id}-board.png`), fullPage: true })
  await board.close()
}

await mkdir(outputDirectory, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  for (const direction of directions) await captureDirection(browser, direction)
} finally {
  await browser.close()
}

console.log(`Generated ${directions.length} color direction boards in ${outputDirectory}`)
