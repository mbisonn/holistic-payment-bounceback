// Sample TestSprite E2E test for the project's landing page
import { describe, it, expect } from 'testsprite';

describe('Landing page smoke', () => {
  it('loads the landing page and finds the main heading', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const heading = await page.locator('h1').first();
    expect(await heading.textContent()).toBeTruthy();
  });
});


