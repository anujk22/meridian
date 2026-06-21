import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const appUrl = 'http://127.0.0.1:4173/?recording=1&speed=20'

const agentMeta = {
  stableAdvocate: { name: 'Harbor', role: 'Stability advocate', detail: 'Protects the financial floor', color: 'oklch(0.72 0.14 184)', file: 'harbor.svg' },
  startupAdvocate: { name: 'Aster', role: 'Possibility scout', detail: 'Explores upside and alternatives', color: 'oklch(0.72 0.17 304)', file: 'aster.svg' },
  researchAdvocate: { name: 'Lumen', role: 'Evidence guide', detail: 'Tests proof and learning depth', color: 'oklch(0.82 0.16 84)', file: 'lumen.svg' },
  skeptic: { name: 'Vesper', role: 'Risk challenger', detail: 'Surfaces blind spots and tradeoffs', color: 'oklch(0.73 0.18 27)', file: 'vesper.svg' },
}

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
    --analysis: ${tokens.analysis};
    --brass: ${tokens.synthesis};
    --brass-pale: ${tokens.synthesisPale};
    --ember: ${tokens.vesper};
    --stable: ${tokens.harbor};
    --startup: ${tokens.aster};
    --research: ${tokens.lumen};
    --axis-dim: ${tokens.track};
    --shadow-blue: ${tokens.shadow};
    --surface-solid: ${tokens.surface};
    --surface-card: ${tokens.surface};
    --surface-translucent: ${tokens.surface};
    --surface-subtle: ${tokens.surfaceSubtle};
    --surface-highlight: ${tokens.raised};
    --track: ${tokens.track};
    --on-accent: ${tokens.onAccent};
    --synthesis: ${tokens.synthesis};
  `
}

const light = {
  void: 'oklch(0.982 0.009 185)',
  voidDeep: 'oklch(0.955 0.018 185)',
  instrument: 'oklch(0.997 0.003 185)',
  raised: 'oklch(0.968 0.018 185)',
  soft: 'oklch(0.94 0.026 185)',
  ink: 'oklch(0.235 0.055 205)',
  inkSoft: 'oklch(0.35 0.055 205)',
  muted: 'oklch(0.48 0.048 205)',
  dim: 'oklch(0.64 0.035 205)',
  line: 'oklch(0.74 0.06 190 / 0.78)',
  lineSoft: 'oklch(0.82 0.04 190 / 0.56)',
  primary: 'oklch(0.50 0.13 184)',
  analysis: 'oklch(0.50 0.13 164)',
  synthesis: 'oklch(0.64 0.16 76)',
  synthesisPale: 'oklch(0.84 0.11 84)',
  harbor: 'oklch(0.50 0.13 184)',
  aster: 'oklch(0.52 0.17 304)',
  lumen: 'oklch(0.63 0.17 74)',
  vesper: 'oklch(0.56 0.19 27)',
  onAccent: 'oklch(0.99 0.004 185)',
  surface: 'oklch(0.997 0.003 185)',
  surfaceSubtle: 'oklch(0.958 0.017 185)',
  track: 'oklch(0.85 0.04 185)',
  shadow: '0 18px 60px oklch(0.35 0.07 190 / 0.12)',
}

const dark = {
  void: 'oklch(0.13 0.04 207)',
  voidDeep: 'oklch(0.09 0.032 210)',
  instrument: 'oklch(0.17 0.043 205)',
  raised: 'oklch(0.215 0.048 203)',
  soft: 'oklch(0.24 0.045 202)',
  ink: 'oklch(0.95 0.018 185)',
  inkSoft: 'oklch(0.83 0.035 185)',
  muted: 'oklch(0.71 0.042 188)',
  dim: 'oklch(0.58 0.042 190)',
  line: 'oklch(0.48 0.075 196 / 0.8)',
  lineSoft: 'oklch(0.39 0.065 198 / 0.54)',
  primary: 'oklch(0.74 0.14 184)',
  analysis: 'oklch(0.77 0.14 164)',
  synthesis: 'oklch(0.82 0.16 84)',
  synthesisPale: 'oklch(0.90 0.09 88)',
  harbor: 'oklch(0.74 0.14 184)',
  aster: 'oklch(0.74 0.17 304)',
  lumen: 'oklch(0.82 0.16 84)',
  vesper: 'oklch(0.74 0.18 27)',
  onAccent: 'oklch(0.12 0.04 207)',
  surface: 'oklch(0.17 0.043 205)',
  surfaceSubtle: 'oklch(0.15 0.038 207)',
  track: 'oklch(0.31 0.06 200)',
  shadow: '0 22px 72px oklch(0.03 0.03 210 / 0.48)',
}

const mockupCss = `
  html[data-theme='light'] { ${themeCss(light)} }
  html[data-theme='dark'] { ${themeCss(dark)} }

  html[data-theme='light'] .phase-zero {
    background:
      radial-gradient(circle at 64% 17%, color-mix(in oklch, var(--stable) 7%, transparent), transparent 24%),
      radial-gradient(circle at 91% 23%, color-mix(in oklch, var(--research) 7%, transparent), transparent 25%),
      radial-gradient(circle at 91% 82%, color-mix(in oklch, var(--ember) 6%, transparent), transparent 25%),
      radial-gradient(circle at 62% 86%, color-mix(in oklch, var(--startup) 6%, transparent), transparent 25%),
      linear-gradient(132deg, oklch(1 0 0), var(--void) 58%, oklch(0.965 0.018 185));
  }

  html[data-theme='dark'] .phase-zero {
    background:
      radial-gradient(circle at 61% 14%, color-mix(in oklch, var(--stable) 19%, transparent), transparent 25%),
      radial-gradient(circle at 94% 18%, color-mix(in oklch, var(--research) 16%, transparent), transparent 27%),
      radial-gradient(circle at 96% 88%, color-mix(in oklch, var(--ember) 18%, transparent), transparent 27%),
      radial-gradient(circle at 61% 91%, color-mix(in oklch, var(--startup) 17%, transparent), transparent 26%),
      linear-gradient(132deg, var(--void-deep), var(--void) 54%, oklch(0.15 0.055 200));
  }

  html[data-theme='light'] .simulation-shell {
    background:
      radial-gradient(circle at 12% 18%, color-mix(in oklch, var(--stable) 7%, transparent), transparent 27%),
      radial-gradient(circle at 87% 18%, color-mix(in oklch, var(--research) 7%, transparent), transparent 27%),
      radial-gradient(circle at 12% 82%, color-mix(in oklch, var(--startup) 6%, transparent), transparent 27%),
      radial-gradient(circle at 88% 82%, color-mix(in oklch, var(--ember) 6%, transparent), transparent 27%),
      linear-gradient(145deg, white, var(--void));
  }

  html[data-theme='dark'] .simulation-shell {
    background:
      radial-gradient(circle at 10% 15%, color-mix(in oklch, var(--stable) 16%, transparent), transparent 28%),
      radial-gradient(circle at 90% 15%, color-mix(in oklch, var(--research) 14%, transparent), transparent 29%),
      radial-gradient(circle at 10% 86%, color-mix(in oklch, var(--startup) 16%, transparent), transparent 28%),
      radial-gradient(circle at 90% 86%, color-mix(in oklch, var(--ember) 16%, transparent), transparent 29%),
      linear-gradient(145deg, var(--void-deep), var(--void));
  }

  .agent-glyph--stableAdvocate,
  .council-agent--stableAdvocate,
  .agent-memo--stableAdvocate,
  .standby-agent--stableAdvocate { --glyph-color: var(--stable); }
  .agent-glyph--startupAdvocate,
  .council-agent--startupAdvocate,
  .agent-memo--startupAdvocate,
  .standby-agent--startupAdvocate { --glyph-color: var(--startup); }
  .agent-glyph--researchAdvocate,
  .council-agent--researchAdvocate,
  .agent-memo--researchAdvocate,
  .standby-agent--researchAdvocate { --glyph-color: var(--research); }
  .agent-glyph--skeptic,
  .council-agent--skeptic,
  .agent-memo--skeptic,
  .standby-agent--skeptic { --glyph-color: var(--ember); }

  .agent-glyph img {
    filter: drop-shadow(0 0 12px color-mix(in oklch, var(--glyph-color) 48%, transparent)) drop-shadow(0 12px 18px color-mix(in oklch, var(--glyph-color) 22%, transparent));
  }
  html[data-theme='light'] .agent-glyph img {
    filter: drop-shadow(0 10px 15px color-mix(in oklch, var(--glyph-color) 20%, transparent));
  }

  .standby-agent__portrait,
  .orbit-agent__portrait {
    border-color: color-mix(in oklch, var(--glyph-color) 48%, transparent);
    background: color-mix(in oklch, var(--surface-solid) 94%, transparent);
  }

  .atlas-globe { background: radial-gradient(circle, color-mix(in oklch, var(--synthesis) 16%, transparent), transparent 62%); }
  .atlas-globe::before { box-shadow: 0 0 58px color-mix(in oklch, var(--synthesis) 25%, transparent); }
  .atlas-globe.is-active::before { box-shadow: 0 0 78px color-mix(in oklch, var(--synthesis) 34%, transparent); }
  .meridian-core__svg { filter: drop-shadow(0 16px 26px color-mix(in oklch, var(--synthesis) 16%, transparent)); }
  html[data-theme='light'] .meridian-core__glass { fill: color-mix(in oklch, var(--synthesis) 8%, white); stroke: color-mix(in oklch, var(--synthesis) 44%, transparent); }
  html[data-theme='dark'] .meridian-core__glass { fill: transparent; stroke: color-mix(in oklch, var(--synthesis) 50%, transparent); }
  .meridian-core__rim { stroke: color-mix(in oklch, var(--synthesis) 86%, transparent); }
  .meridian-core__grid { stroke: color-mix(in oklch, var(--synthesis) 21%, transparent); }
  .meridian-core__radials { stroke: color-mix(in oklch, var(--synthesis) 17%, transparent); }
  .meridian-core__orbit { stroke: color-mix(in oklch, var(--synthesis) 58%, transparent); }
  .meridian-core__orbit--two { stroke: color-mix(in oklch, var(--stable) 42%, transparent); }
  .meridian-core__orbit--three { stroke: color-mix(in oklch, var(--startup) 28%, transparent); }
  .meridian-core__axis { fill: var(--synthesis); stroke: color-mix(in oklch, var(--synthesis) 78%, black); }
  .meridian-core__pulse { fill: color-mix(in oklch, var(--synthesis) 9%, transparent); stroke: color-mix(in oklch, var(--synthesis) 40%, transparent); }
  .meridian-core__star { fill: color-mix(in oklch, var(--synthesis) 34%, transparent); stroke: color-mix(in oklch, var(--synthesis) 90%, black); }
  .meridian-core__center-ring,
  .meridian-core__center { stroke: var(--synthesis); }
  .meridian-core__shimmers { filter: drop-shadow(0 0 5px color-mix(in oklch, var(--synthesis) 72%, transparent)); }

  .decision-brief,
  .agent-memo,
  .outcome-panel { box-shadow: var(--shadow-blue); }
  html[data-theme='light'] .decision-brief,
  html[data-theme='light'] .agent-memo { background: color-mix(in oklch, white 96%, var(--glyph-color, var(--polar))); }

  .agent-glyph::after {
    content: '';
    position: absolute;
    inset: 8%;
    border: 1px solid color-mix(in oklch, var(--glyph-color) 22%, transparent);
    border-radius: 44%;
    pointer-events: none;
  }

  *, *::before, *::after { animation: none !important; caret-color: transparent !important; }
`

function svgDataUrl(source) {
  return `data:image/svg+xml;base64,${Buffer.from(source).toString('base64')}`
}

const agentImages = {}
for (const [id, agent] of Object.entries(agentMeta)) {
  const source = await readFile(join(outputDirectory, 'agents', agent.file), 'utf8')
  agentImages[id] = svgDataUrl(source)
}

async function captureTheme(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  await context.addInitScript((selectedTheme) => window.localStorage.setItem('meridian-theme', selectedTheme), theme)
  const page = await context.newPage()
  await page.goto(appUrl, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: mockupCss })
  await page.evaluate((images) => {
    for (const [id, source] of Object.entries(images)) {
      document.querySelectorAll(`.agent-glyph--${id} img`).forEach((image) => image.setAttribute('src', source))
    }
    document.querySelectorAll('.council-protocol small').forEach((node) => {
      node.innerHTML = node.innerHTML.replace('4 agents', '4 distinct AI agents')
    })
  }, agentImages)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(160)
  await page.screenshot({ path: join(outputDirectory, `${theme}-intake.png`) })

  await page.getByRole('button', { name: 'Convene council' }).click()
  await page.waitForTimeout(800)
  await page.evaluate((images) => {
    for (const [id, source] of Object.entries(images)) {
      document.querySelectorAll(`.agent-glyph--${id} img`).forEach((image) => image.setAttribute('src', source))
    }
  }, agentImages)
  await page.screenshot({ path: join(outputDirectory, `${theme}-council.png`) })
  await context.close()
}

function pngDataUrl(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`
}

const browser = await chromium.launch({ headless: true })
try {
  await captureTheme(browser, 'light')
  await captureTheme(browser, 'dark')

  const screenshots = {}
  for (const theme of ['light', 'dark']) {
    for (const view of ['intake', 'council']) {
      screenshots[`${theme}-${view}`] = pngDataUrl(await readFile(join(outputDirectory, `${theme}-${view}.png`)))
    }
  }

  const board = await browser.newPage({ viewport: { width: 1900, height: 1580 }, deviceScaleFactor: 1 })
  await board.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #17343a; background: #f1f5f4; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          main { width: 1900px; min-height: 1580px; padding: 48px 58px 58px; }
          header { display: grid; grid-template-columns: 1fr auto; gap: 50px; align-items: end; margin-bottom: 26px; }
          .concept { margin: 0 0 7px; color: #4f7779; font-size: 18px; font-weight: 700; }
          h1 { margin: 0; font-family: Georgia, serif; font-size: 56px; font-weight: 500; letter-spacing: -0.035em; line-height: 1; }
          header p { max-width: 940px; margin: 12px 0 0; color: #4b6468; font-size: 20px; line-height: 1.4; }
          .swatches { display: flex; gap: 12px; padding-bottom: 4px; }
          .swatches i { display: block; width: 58px; height: 58px; border: 7px solid white; border-radius: 50%; box-shadow: 0 5px 18px rgb(20 53 57 / 14%); }
          .agents { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 26px; }
          .agent { display: grid; grid-template-columns: 112px 1fr; gap: 12px; align-items: center; min-height: 132px; padding: 12px 18px 12px 10px; overflow: hidden; border: 1px solid color-mix(in oklch, var(--agent) 34%, white); border-radius: 20px; background: color-mix(in oklch, var(--agent) 7%, white); }
          .agent img { width: 112px; height: 112px; object-fit: contain; filter: drop-shadow(0 10px 13px color-mix(in oklch, var(--agent) 20%, transparent)); }
          .agent strong { display: block; color: color-mix(in oklch, var(--agent) 58%, #16333a); font-size: 20px; }
          .agent span { display: block; margin-top: 3px; color: #2f4d51; font-size: 15px; font-weight: 720; }
          .agent small { display: block; margin-top: 5px; color: #64777a; font-size: 13px; line-height: 1.3; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          figure { position: relative; overflow: hidden; margin: 0; border: 8px solid white; border-radius: 22px; background: white; box-shadow: 0 20px 55px rgb(24 56 62 / 11%); }
          figure img { display: block; width: 100%; height: 500px; object-fit: cover; object-position: center; }
          figcaption { position: absolute; left: 22px; top: 20px; padding: 9px 13px; color: #17343a; border-radius: 9px; background: rgb(255 255 255 / 92%); box-shadow: 0 5px 14px rgb(25 45 49 / 12%); font-size: 15px; font-weight: 780; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
              <div class="concept">Meridian concept: The Council of Four</div>
              <h1>Four minds, four jobs, one decision.</h1>
              <p>A vivid night council paired with a crisp daylight workspace. Each AI agent has its own silhouette, expression, role symbol, and semantic color.</p>
            </div>
            <div class="swatches">
              ${Object.values(agentMeta).map((agent) => `<i style="background:${agent.color}"></i>`).join('')}
            </div>
          </header>
          <section class="agents">
            ${Object.entries(agentMeta).map(([id, agent]) => `
              <article class="agent" style="--agent:${agent.color}">
                <img src="${agentImages[id]}" />
                <div><strong>${agent.name}</strong><span>${agent.role}</span><small>${agent.detail}</small></div>
              </article>
            `).join('')}
          </section>
          <section class="grid">
            <figure><img src="${screenshots['light-intake']}" /><figcaption>Light · Intake</figcaption></figure>
            <figure><img src="${screenshots['dark-intake']}" /><figcaption>Dark · Intake</figcaption></figure>
            <figure><img src="${screenshots['light-council']}" /><figcaption>Light · Council</figcaption></figure>
            <figure><img src="${screenshots['dark-council']}" /><figcaption>Dark · Council</figcaption></figure>
          </section>
        </main>
      </body>
    </html>
  `, { waitUntil: 'load' })
  await board.screenshot({ path: join(outputDirectory, 'council-of-four-board.png'), fullPage: true })
  await board.close()
} finally {
  await browser.close()
}

console.log(`Generated Council of Four mockups in ${outputDirectory}`)
