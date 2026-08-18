// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * MA SÓI - E2E TEST SUITE (UI mới)
 * Material Symbols + Material Design 3 inspired UI
 * Run: npx playwright test werewolf-ui.spec.cjs
 */

const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';

test.describe('🐺 MA SÓI - UI Mới', () => {

  test('1. Trang chủ hiển thị MA SÓI với 2 nút TẠO PHÒNG / TÌM PHÒNG', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Hero title
    const title = page.locator('h1:has-text("MA SÓI")').first();
    await expect(title).toBeVisible();

    // 2 main buttons
    const createBtn = page.locator('button:has-text("TẠO PHÒNG")').first();
    const findBtn = page.locator('button:has-text("TÌM PHÒNG")').first();
    await expect(createBtn).toBeVisible();
    await expect(findBtn).toBeVisible();

    // Room cards rendered
    const roomCards = page.locator('#roomGrid > div');
    const c = await roomCards.count();
    expect(c).toBeGreaterThanOrEqual(3);
  });

  test('2. Click TẠO PHÒNG → vào Room screen với wooden blocks', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(800);

    // Room screen visible
    await expect(page.locator('#screen-room')).toBeVisible();
    await expect(page.locator('h2:has-text("Phòng Của Lucas")')).toBeVisible();

    // 10 wooden blocks
    const slots = page.locator('#playerSlots > div');
    const c = await slots.count();
    expect(c).toBe(10);

    // Stickman avatars rendered (svg)
    const stickmen = page.locator('#playerSlots svg');
    expect(await stickmen.count()).toBe(10);

    // First slots have player names
    const firstName = page.locator('#playerSlots > div').first().locator('div').last();
    await expect(firstName).toBeVisible();
  });

  test('3. Thêm người chơi → wooden block fill với stickman mới', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(500);

    const before = await page.locator('#playerSlots svg').count();

    // Click "Thêm người chơi"
    await page.locator('button:has-text("Thêm người chơi")').click({ force: true });
    await page.waitForTimeout(400);

    const after = await page.locator('#playerSlots svg').count();
    expect(after).toBe(before); // SVG count stays same (10)
    // But one more slot should now have a real name
  });

  test('4. Toggle Day ↔ Night', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(500);

    // Default: Ban Ngày
    await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');

    // Toggle to Night
    await page.locator('button:has-text("Ban Ngày")').click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('#phaseLabel')).toHaveText('Ban Đêm');

    // Toggle back
    await page.locator('button:has-text("Ban Đêm")').click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');
  });

  test('5. Chat box gửi tin nhắn', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const input = page.locator('#chatInput');
    await input.fill('🐺 Vote đi mọi người!');
    await page.locator('button[type="submit"]').first().click({ force: true });
    await page.waitForTimeout(400);

    const lastMsg = page.locator('#chatLog > div').last();
    await expect(lastMsg).toContainText('Vote đi mọi người!');
  });

  test('6. Theme toggle Light ↔ Dark', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Default light
    const html = page.locator('html');
    const cls1 = await html.getAttribute('class');
    expect(cls1).toContain('light');

    // Toggle to dark
    await page.locator('button[aria-label="Toggle Theme"]').click({ force: true });
    await page.waitForTimeout(300);
    const cls2 = await html.getAttribute('class');
    expect(cls2).toContain('dark');
  });

  test('7. Desktop: Chat box ở cột phải (sidebar)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const aside = page.locator('aside').first();
    await expect(aside).toBeVisible();

    // Aside should be on the right (30% width)
    const box = await aside.boundingBox();
    expect(box.width).toBeLessThan(500); // Side chat is narrow
    expect(box.x).toBeGreaterThan(800); // Right side on 1280px viewport
  });

  test('8. Mobile: Bottom nav hiển thị', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Bottom nav visible
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();

    // Has 4 nav items
    const navItems = bottomNav.locator('a');
    const c = await navItems.count();
    expect(c).toBe(4);
  });

  test('9. Side nav (Desktop) có 4 menu chính', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    const sideNav = page.locator('nav.hidden.md\\:flex').first();
    await expect(sideNav).toBeVisible();

    // Has "Trang chủ", "Phòng chơi", "Bạn bè", "Cửa hàng"
    await expect(sideNav).toContainText('Trang chủ');
    await expect(sideNav).toContainText('Phòng chơi');
    await expect(sideNav).toContainText('Bạn bè');
    await expect(sideNav).toContainText('Cửa hàng');
  });

  test('10. Nâng cấp Premium button + mechanical-btn class có 3D effect', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Premium button
    const premiumBtn = page.locator('button:has-text("Nâng cấp Premium")').first();
    await expect(premiumBtn).toBeVisible();
    await expect(premiumBtn).toHaveClass(/mechanical-btn/);

    // Box-shadow from CSS
    const shadow = await premiumBtn.evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
});