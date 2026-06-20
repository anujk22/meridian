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
    await expect(page.getByRole('heading', { name: /Run the decision before you live it/i })).toBeVisible()
    await page.getByRole('button', { name: 'Run the council' }).click()
    await expect(page.getByRole('heading', { name: /Choose funded AI research/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Adjust assumptions' }).click()
    await expect(page.locator('.leader-readout strong')).toHaveText('Research')

    await page.getByRole('button', { name: 'Review recommendation' }).click()
    await expect(page.getByRole('heading', { name: /Choose funded AI research/i })).toBeVisible()
    await expect(page.getByText(/assumption-based/i)).toBeVisible()

    expect(consoleErrors).toEqual([])
    expect(externalRequests).toEqual([])
  })

  test('lets all three paths lead through the shared controls', async ({ page }) => {
    await page.goto('/?recording=1&speed=20')
    await page.getByRole('button', { name: 'Run the council' }).click()
    await expect(page.getByRole('heading', { name: /Choose funded AI research/i })).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Adjust assumptions' }).click()

    await page.getByRole('slider', { name: 'Risk tolerance' }).fill('0')
    await page.getByRole('checkbox', { name: 'Need high income now' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Stable')

    await page.getByRole('checkbox', { name: 'Need high income now' }).uncheck()
    await page.getByRole('slider', { name: 'AI growth weight' }).fill('60')
    await page.getByRole('checkbox', { name: 'Master’s fully funded' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Research')

    await page.getByRole('slider', { name: 'Risk tolerance' }).fill('100')
    await page.getByRole('slider', { name: 'Ownership weight' }).fill('60')
    await page.getByRole('checkbox', { name: 'Startup has traction' }).check()
    await page.getByRole('checkbox', { name: 'Prefer building' }).check()
    await expect(page.locator('.leader-readout strong')).toHaveText('Startup')
  })
})

test.describe('recording viewport', () => {
  test.use({ viewport: { width: 1440, height: 810 }, reducedMotion: 'reduce' })

  test('fits the short recording crop and honors reduced motion', async ({ page }) => {
    await page.goto('/?recording=1&speed=20')
    await page.getByRole('button', { name: 'Run the council' }).click()
    await expect(page.getByRole('heading', { name: /Choose funded AI research/i })).toBeVisible({ timeout: 5_000 })
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

  test('moves off intake immediately and prefers an already-loaded Nemotron model', async ({ page }) => {
    await page.route('**/lmstudio/api/v1/models', (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ models: [
        { type: 'llm', key: 'downloaded/cold-model', loaded_instances: [] },
        { type: 'llm', key: 'qwen/qwen3.5-9b', loaded_instances: [{ id: 'qwen-loaded' }] },
        { type: 'llm', key: 'nvidia/nemotron-nano', loaded_instances: [{ id: 'nemotron-nano-loaded' }] },
      ] }),
    }))
    await page.route('**/lmstudio/v1/chat/completions', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 4_000))
      await route.abort()
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Live local' }).click()
    await expect(page.getByLabel('LM Studio model')).toHaveValue('nemotron-nano-loaded')
    await page.getByRole('button', { name: 'Run the council' }).click()

    await expect(page.getByText(/Structuring local council/i)).toBeVisible()
    await expect(page.getByText(/model graph initializes/i)).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
  })
})
