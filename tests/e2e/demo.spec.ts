import { expect, test } from '@playwright/test'

test.describe('recording path', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('runs from intake to a conditional verdict without external traffic', async ({ page }) => {
    const consoleErrors: string[] = []
    const externalRequests: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))
    page.on('request', (request) => {
      const url = new URL(request.url())
      if (!['127.0.0.1', 'localhost'].includes(url.hostname) && !request.url().startsWith('data:')) {
        externalRequests.push(request.url())
      }
    })

    await page.goto('/?recording=1&speed=20')
    await expect(page.getByRole('heading', { name: /Make your best decisions/i })).toBeVisible()
    await page.getByRole('button', { name: 'Convene council' }).click()
    await expect(page.getByRole('heading', { name: /strongest current direction/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Adjust assumptions' }).click()
    await expect(page.locator('.leader-readout strong')).toHaveText('Exploration path, conditionally')

    await page.getByRole('button', { name: 'Review recommendation' }).click()
    await expect(page.getByRole('heading', { name: /strongest current direction/i })).toBeVisible()
    await expect(page.getByText(/assumption-based/i)).toBeVisible()

    expect(consoleErrors).toEqual([])
    expect(externalRequests).toEqual([])
  })

  test('lets all three paths lead through the shared controls', async ({ page }) => {
    await page.goto('/?recording=1&speed=20')
    await page.getByRole('button', { name: 'Convene council' }).click()
    await expect(page.getByRole('heading', { name: /strongest current direction/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Adjust assumptions' }).click()

    await page.getByRole('slider', { name: 'Risk tolerance' }).fill('0')
    await page.getByRole('checkbox', { name: 'Need high income now' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Continuity path, conditionally')

    await page.getByRole('checkbox', { name: 'Need high income now' }).uncheck()
    await page.getByRole('slider', { name: 'Growth & learning weight' }).fill('60')
    await page.getByRole('checkbox', { name: 'Exploration path is affordable' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Exploration path, conditionally')

    await page.getByRole('slider', { name: 'Risk tolerance' }).fill('100')
    await page.getByRole('slider', { name: 'Agency & upside weight' }).fill('60')
    await page.getByRole('checkbox', { name: 'Change path has strong evidence' }).check()
    await page.getByRole('checkbox', { name: 'Prefer greater agency' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Bold-change path, conditionally')
  })
})

test.describe('recording viewport', () => {
  test.use({ viewport: { width: 1440, height: 810 }, reducedMotion: 'reduce' })

  test('fits the short recording crop and honors reduced motion', async ({ page }) => {
    await page.goto('/?recording=1&speed=20')
    await page.getByRole('button', { name: 'Convene council' }).click()
    await expect(page.getByRole('heading', { name: /strongest current direction/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Adjust assumptions' }).click()

    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }))
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.height).toBeLessThanOrEqual(dimensions.viewportHeight)
    await expect(page.getByRole('button', { name: 'Review recommendation' })).toBeVisible()
  })
})

test.describe('live local handoff', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('shows evidence retrieval and independent agent progress before the deliberation', async ({ page }) => {
    await page.route('**/lmstudio/api/v1/models', (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ models: [
        { type: 'llm', key: 'downloaded/cold-model', loaded_instances: [] },
        { type: 'llm', key: 'qwen/qwen3.5-9b', loaded_instances: [{ id: 'qwen-loaded' }] },
        { type: 'llm', key: 'nvidia/nemotron-nano', loaded_instances: [{ id: 'nemotron-nano-loaded' }] },
      ] }),
    }))
    await page.route('**/lmstudio/v1/embeddings', (route) => route.abort())
    await page.route('**/lmstudio/v1/chat/completions', async (route) => {
      const body = route.request().postDataJSON() as { messages: Array<{ content: string }> }
      const system = body.messages[0].content
      const allowedEvidence = body.messages.at(-1)?.content.match(/ALLOWED EVIDENCE IDS\n([^\n]+)/)?.[1].split(', ') ?? []
      const evidenceId = allowedEvidence[0]
      const advocate = {
        optionLabel: system.includes('Harbor') ? 'Stay near home' : system.includes('Aster') ? 'Move for the opportunity' : 'Take a gap year',
        claim: { title: 'Grounded case', body: 'The retrieved evidence supports a conditional case.', evidenceIds: [evidenceId] },
        concession: { title: 'Important caveat', body: 'The path still depends on role quality.', evidenceIds: [] },
        ranges: [
          { low: 42, mode: 66, high: 84, confidence: 0.65, reason: 'First grounded range.', evidenceIds: [evidenceId] },
          { low: 48, mode: 71, high: 88, confidence: 0.68, reason: 'Second grounded range.', evidenceIds: [evidenceId] },
        ],
      }
      const vesper = {
        hidden: [
          { title: 'The change needs diligence', body: 'The imagined upside may differ from daily life.', evidenceIds: [allowedEvidence[0]] },
          { title: 'The exploration needs boundaries', body: 'Time, cost, and re-entry conditions matter.', evidenceIds: [allowedEvidence[1] ?? allowedEvidence[0]] },
        ],
        mutations: [
          { low: 8, mode: 27, high: 53, confidence: 0.36, reason: 'Change-path floor reduced.', evidenceIds: [allowedEvidence[0]] },
          { low: 50, mode: 75, high: 92, confidence: 0.41, reason: 'Change-path upside widened.', evidenceIds: [allowedEvidence[0]] },
          { low: 77, mode: 89, high: 97, confidence: 0.84, reason: 'Exploration growth supported.', evidenceIds: [allowedEvidence[1] ?? allowedEvidence[0]] },
          { low: 69, mode: 82, high: 92, confidence: 0.85, reason: 'Exploration options supported.', evidenceIds: [allowedEvidence[0]] },
        ],
      }
      await new Promise((resolve) => setTimeout(resolve, system.includes('Vesper') ? 350 : 700))
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ choices: [{ message: { content: JSON.stringify(system.includes('Vesper') ? vesper : advocate) } }] }),
      })
    })

    await page.goto('/?speed=20')
    await page.getByRole('button', { name: /Local model/i }).click()
    await expect(page.getByLabel('LM Studio model')).toHaveValue('nemotron-nano-loaded')
    await page.getByRole('button', { name: 'Convene council' }).click()

    await expect(page.getByText(/drafting independent grounded memos/i).first()).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /strongest current direction/i })).toBeVisible({ timeout: 10_000 })
  })
})
