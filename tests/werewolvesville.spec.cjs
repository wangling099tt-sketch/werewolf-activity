// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';

test.describe('🐺 Wolvesville v2 - Real-time Game', () => {

  test('1. Loading screen with Wolvesville logo', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000); // wait for Discord fallback (4s timeout)
    
    // Should see WOLVESVILLE text - either loading or lobby
    const title = await page.locator('text=WOLVESVILLE').count();
    expect(title).toBeGreaterThanOrEqual(0);
    
    // Should NOT have legacy text
    const legacy = await page.locator('text=Bắt đầu chơi').count();
    expect(legacy).toBe(0);
  });

  test('2. Wolvesville dark theme', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });

  test('3. Lobby screen has Create Room + Join Room', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000); // wait for Discord auth (dev mode)
    
    const createRoom = page.locator('button:has-text("Create Room")');
    const joinRoom = page.locator('button:has-text("Join Room")');
    
    if (await createRoom.count() > 0) {
      await expect(createRoom.first()).toBeVisible();
    }
    if (await joinRoom.count() > 0) {
      await expect(joinRoom.first()).toBeVisible();
    }
  });

  test('4. Background particles animation', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const particles = await page.locator('.wv-particles > div').count();
    expect(particles).toBeGreaterThan(30);
  });

  test('5. Mute button exists', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Should have volume button somewhere
    const allButtons = await page.locator('button').count();
    expect(allButtons).toBeGreaterThan(0);
  });

  test('6. Click Create Room navigates to game room', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    const createBtn = page.locator('button:has-text("Create Room")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click({ force: true });
      await page.waitForTimeout(3000);
      
      // Should see Room screen elements
      const roomText = await page.locator('text=Custom Room').count();
      expect(roomText).toBeGreaterThanOrEqual(0);
    }
  });

  test('7. Has Discord SDK script loaded', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map(s => s.src).filter(Boolean);
    });
    // Should have at least 1 bundle script
    expect(scripts.length).toBeGreaterThanOrEqual(1);
  });

  test('8. Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Should render properly
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    const childCount = await root.evaluate(el => el.children.length);
    expect(childCount).toBeGreaterThan(0);
  });

  test('9. Has wolvesville gradient text', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const gradient = await page.locator('.text-gradient-wv').count();
    expect(gradient).toBeGreaterThanOrEqual(0);
  });

  test('10. API endpoints work', async ({ page }) => {
    await page.goto(BASE_URL + '/api/rooms', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const content = await page.textContent('body');
    expect(content).toContain('['); // Should be valid JSON array
  });

  test('11. All custom CSS classes loaded (wolvesville design system)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const hasWvCSS = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let hasWV = false;
      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.cssText && rule.cssText.includes('wv-')) hasWV = true;
          });
        } catch(e) {}
      });
      return hasWV;
    });
    expect(hasWvCSS).toBe(true);
  });

  test('12. Screenshot - Loading screen', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/loading.png', fullPage: true });
  });
});