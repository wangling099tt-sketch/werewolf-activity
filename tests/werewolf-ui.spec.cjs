// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * MA SÓI - E2E TEST SUITE (UI mới - Material Symbols)
 * Run: npx playwright test werewolf-ui.spec.cjs
 */

const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';

test.describe('🐺 MA SÓI - UI Mới', () => {

  // Helper: wait for Tailwind + JS init
  async function waitForReady(page) {
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  test('1. Trang chủ MA SÓI với TẠO PHÒNG / TÌM PHÒNG', async ({ page }) => {
    await waitForReady(page);

    await expect(page.locator('h1:has-text("MA SÓI")').first()).toBeVisible();
    await expect(page.locator('button:has-text("TẠO PHÒNG")').first()).toBeVisible();
    await expect(page.locator('button:has-text("TÌM PHÒNG")').first()).toBeVisible();

    // Room cards
    const cards = page.locator('#roomGrid > div');
    await expect(cards).toHaveCount(4);
  });

  test('2. Click TẠO PHÒNG → Room screen với wooden blocks', async ({ page }) => {
    await waitForReady(page);
    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(1500);

    await expect(page.locator('#screen-room')).toBeVisible();
    await expect(page.locator('h2:has-text("Phòng Của Lucas")')).toBeVisible();

    // 10 player slots
    const slots = page.locator('#playerSlots > div');
    await expect(slots).toHaveCount(10);

    // Stickmen rendered
    await expect(page.locator('#playerSlots svg')).toHaveCount(10);
  });

  test('3. Thêm người chơi → fill wooden block', async ({ page }) => {
    await waitForReady(page);
    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(1500);

    await page.locator('#screen-room button:has-text("Thêm người chơi")').click({ force: true });
    await page.waitForTimeout(800);

    // Should still have 10 slots
    await expect(page.locator('#playerSlots > div')).toHaveCount(10);
  });

  test('4. Toggle Day ↔ Night', async ({ page }) => {
    await waitForReady(page);
    await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
    await page.waitForTimeout(1500);

    await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');
    await page.locator('#phaseLabel').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('#phaseLabel')).toHaveText('Ban Đêm');

    await page.locator('#phaseLabel').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');
  });

  test('5. Chat box gửi tin nhắn', async ({ page }) => {
    await waitForReady(page);
    const input = page.locator('#chatInput');
    await input.fill('🐺 Vote đi mọi người!');
    await page.locator('button[type="submit"]').first().click({ force: true });
    await page.waitForTimeout(600);
    const last = page.locator('#chatLog > div').last();
    await expect(last).toContainText('Vote đi mọi người!');
  });

  test('6. Theme toggle Light ↔ Dark', async ({ page }) => {
    await waitForReady(page);
    const html = page.locator('html');
    await expect(html).toHaveClass(/light/);
    await page.locator('button[aria-label="Toggle Theme"]').click({ force: true });
    await page.waitForTimeout(500);
    await expect(html).toHaveClass(/dark/);
  });

  test('7. Desktop: Chat sidebar (right column)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await waitForReady(page);
    const aside = page.locator('aside').first();
    await expect(aside).toBeVisible();
    const box = await aside.boundingBox();
    expect(box.x).toBeGreaterThan(800);
  });

  test('8. Mobile: Bottom nav 4 items', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForReady(page);
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('a')).toHaveCount(4);
  });

  test('9. Side nav Desktop 4 menu chính', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await waitForReady(page);
    const sideNav = page.locator('nav.hidden').first();
    await expect(sideNav).toBeVisible();
    await expect(sideNav).toContainText('Trang chủ');
    await expect(sideNav).toContainText('Phòng chơi');
    await expect(sideNav).toContainText('Bạn bè');
    await expect(sideNav).toContainText('Cửa hàng');
  });

  test('10. Premium button có 3D effect (box-shadow)', async ({ page }) => {
    await waitForReady(page);
    const btn = page.locator('button:has-text("Nâng cấp Premium")').first();
    await expect(btn).toBeVisible();
    await expect(btn).toHaveClass(/mechanical-btn/);
    const shadow = await btn.evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
});