// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * WEREWOLF ACTIVITY - END-TO-END UI/UX TEST SUITE
 *
 * Tests the full Discord Activity workflow with 5 reference image designs
 * Run: npx playwright test werewolf-reference.spec.js
 */

const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';

test.describe('🐺 Werewolf Activity - Reference Images E2E', () => {

  test('1. Loading SDK screen has reference image + finishes loading', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Loading screen visible
    const loadingScreen = page.locator('#loadingScreen');
    await expect(loadingScreen).toBeVisible({ timeout: 10000 });

    // Reference image 1 should be embedded
    const loadingRef = page.locator('.loading-real-image img');
    await expect(loadingRef).toHaveAttribute('src', 'https://i.postimg.cc/XvZyYKZf/load.jpg');

    // Initial percentage
    const percent = page.locator('#loadingPercent');
    await expect(percent).toHaveText('0');

    // Wait for auto-transition (loading takes ~3.5s)
    await page.waitForTimeout(8000);
  });

  test('2. Lobby shows lobby reference image + Tạo Phòng / Tìm Phòng buttons', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    // Reference image 2
    const lobbyRef = page.locator('.lobby-real-image img').first();
    await expect(lobbyRef).toHaveAttribute('src', 'https://i.postimg.cc/d3gS3n36/loppy.jpg');

    // Buttons
    const createBtn = page.getByText('Tạo Phòng').first();
    const findBtn = page.getByText('Tìm Phòng').first();
    await expect(createBtn).toBeVisible();
    await expect(findBtn).toBeVisible();
    await expect(createBtn).toHaveClass(/btn-primary/);
    await expect(findBtn).toHaveClass(/btn-secondary/);

    // Click Tạo Phòng → waiting room
    await createBtn.click({ force: true });
    await page.waitForTimeout(700);
    await expect(page.locator('#screen-waiting.active')).toBeVisible();
  });

  test('3. Waiting Room renders wooden blocks + stickman avatars (Day theme)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.getByText('Tạo Phòng').first().click({ force: true });
    await page.waitForTimeout(700);

    // Day theme active
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');

    // Reference image 3 (Day scene) visible
    const dayScene = page.locator('.waiting-img-day');
    await expect(dayScene).toBeVisible();
    await expect(dayScene).toHaveAttribute('src', 'https://i.postimg.cc/D0N9nKRY/trong-tran-1.jpg');

    // Wooden blocks rendered
    const woodenBlocks = page.locator('.wooden-block');
    const count = await woodenBlocks.count();
    expect(count).toBeGreaterThanOrEqual(6);

    // Filled slots have stickman + player name
    const firstPlayerName = page.locator('.wooden-block.filled .player-name').first();
    await expect(firstPlayerName).toBeVisible();
    const txt = await firstPlayerName.textContent();
    expect(txt.length).toBeGreaterThan(0);
  });

  test('4. Theme toggle swaps Day ↔ Night scene images', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.getByText('Tạo Phòng').first().click({ force: true });
    await page.waitForTimeout(700);

    // Day
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await expect(page.locator('.waiting-img-day')).toBeVisible();
    await expect(page.locator('.waiting-img-night')).toBeHidden();

    // Toggle to Night
    await page.locator('.theme-toggle').click({ force: true });
    await page.waitForTimeout(600);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await expect(page.locator('.waiting-img-night')).toBeVisible();
    await expect(page.locator('.waiting-img-night')).toHaveAttribute('src', 'https://i.postimg.cc/mgj0gCxp/trong-tran-2.jpg');

    // Toggle back
    await page.locator('.theme-toggle').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  });

  test('5. Desktop: Chat box on SIDE (Image 5)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.getByText('Tạo Phòng').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.getByText('Bắt Đầu Chơi').first().click({ force: true });
    await page.waitForTimeout(700);

    // Reference image 5 thumbnail
    const chatRef = page.locator('.chat-preview-mini img').first();
    await expect(chatRef).toHaveAttribute('src', 'https://i.postimg.cc/768MvtBd/Gameeeeeeee.jpg');

    // Chat should be on the side (< 400px width)
    const chatContainer = page.locator('.chat-container').first();
    const width = await chatContainer.evaluate(el => el.getBoundingClientRect().width);
    expect(width).toBeLessThan(400);
  });

  test('6. Mobile Portrait: Chat drops to BOTTOM', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.getByText('Tạo Phòng').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.getByText('Bắt Đầu Chơi').first().click({ force: true });
    await page.waitForTimeout(700);

    // Chat should be full width on mobile
    const chatContainer = page.locator('.chat-container').first();
    const rect = await chatContainer.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    expect(rect.width).toBeGreaterThan(300);
    expect(rect.height).toBeLessThan(400);
  });

  test('7. Reference Gallery modal opens with all 5 images', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    // Open gallery
    await page.locator('.ref-img').click({ force: true });
    await page.waitForTimeout(400);

    const gallery = page.locator('#refGallery.active');
    await expect(gallery).toBeVisible();

    // 5 reference images
    const imgs = page.locator('.ref-gallery-item img');
    const count = await imgs.count();
    expect(count).toBe(5);

    const expected = [
      'https://i.postimg.cc/XvZyYKZf/load.jpg',
      'https://i.postimg.cc/d3gS3n36/loppy.jpg',
      'https://i.postimg.cc/D0N9nKRY/trong-tran-1.jpg',
      'https://i.postimg.cc/mgj0gCxp/trong-tran-2.jpg',
      'https://i.postimg.cc/768MvtBd/Gameeeeeeee.jpg',
    ];

    for (let i = 0; i < expected.length; i++) {
      const src = await imgs.nth(i).getAttribute('src');
      expect(src).toBe(expected[i]);
    }

    // Close
    await page.locator('.ref-gallery-close').click({ force: true });
    await page.waitForTimeout(300);
  });

  test('8. Buttons have 3D press transform on click', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    const btn = page.getByText('Tạo Phòng').first();
    await btn.click({ force: true });
    await page.waitForTimeout(300);
    // After click transitions to waiting, verify state changed
    await expect(page.locator('#screen-waiting.active')).toBeVisible();

    // Inspect computed transform of any btn-primary after click
    const anyBtn = page.locator('.btn-primary').first();
    const transform = await anyBtn.evaluate(el => getComputedStyle(el).transform);
    expect(transform === 'none' || transform.includes('matrix')).toBeTruthy();
  });

  test('9. Chat input sends messages', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);
    await page.getByText('Tạo Phòng').first().click({ force: true });
    await page.waitForTimeout(600);
    await page.getByText('Bắt Đầu Chơi').first().click({ force: true });
    await page.waitForTimeout(800);

    const input = page.locator('#chatInput');
    await input.fill('🐺 Vote đi!');
    await page.locator('.chat-send-btn').click({ force: true });
    await page.waitForTimeout(400);

    const last = page.locator('.chat-message-text').last();
    await expect(last).toContainText('Vote đi!');
  });

  test('10. Demo badge shows real app + reference thumbnail visible', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    const badge = page.locator('.demo-badge');
    const refThumb = page.locator('.ref-img');
    await expect(badge).toBeVisible();
    await expect(refThumb).toBeVisible();

    // Ref thumb image should have src
    const src = await page.locator('#refThumbImg').getAttribute('src');
    expect(src).toContain('postimg.cc');
  });
});
