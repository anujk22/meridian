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
    await expect(page.getByRole('heading', { name: /Find what your decision depends on/i })).toBeVisible()
    await page.getByRole('button', { name: 'Enter the observatory' }).click()
    await expect(page.getByText('What-if exploration')).toBeVisible({ timeout: 4_000 })
    await expect(page.locator('.leader-readout strong')).toHaveText('Research')
    await expect(page.getByText('Research optionality raised')).toBeVisible()

    await page.getByRole('button', { name: 'Open decision brief' }).click()
    await expect(page.getByRole('heading', { name: /Choose funded AI research/i })).toBeVisible()
    await expect(page.getByText(/assumption-based/i)).toBeVisible()

    expect(consoleErrors).toEqual([])
    expect(externalRequests).toEqual([])
  })

  test('lets all three paths lead through the shared controls', async ({ page }) => {
    await page.goto('/?recording=1&speed=20')
    await page.getByRole('button', { name: 'Enter the observatory' }).click()
    await expect(page.getByText('What-if exploration')).toBeVisible({ timeout: 4_000 })

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
    await page.getByRole('button', { name: 'Enter the observatory' }).click()
    await expect(page.getByText('What-if exploration')).toBeVisible({ timeout: 4_000 })

    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }))
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.height).toBeLessThanOrEqual(dimensions.viewportHeight)
    await expect(page.getByRole('button', { name: 'Open decision brief' })).toBeVisible()
  })
})
