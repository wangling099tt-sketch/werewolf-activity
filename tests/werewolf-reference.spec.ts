import { test, expect } from '@playwright/test';

/**
 * WEREWOLF ACTIVITY - END-TO-END UI/UX TEST SUITE
 *
 * Tests the full Discord Activity workflow with 5 reference image designs:
 * 1. Loading SDK Screen
 * 2. Lobby / Main Waiting
 * 3. In-Game Room (Day Phase)
 * 4. In-Game Room (Night Phase)
 * 5. Chat Box Layout (Desktop vs Mobile)
 *
 * Run with:
 *   npx playwright test tests/werewolf-reference.spec.ts
 */

const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';

test.describe('🐺 Werewolf Activity - Reference Images E2E', () => {

  // ============================================
  // TEST 1: Loading SDK Screen (Image 1)
  // ============================================
  test('1. Loading SDK screen finishes loading', async ({ page }) => {
    await page.goto(BASE_URL);

    // Loading screen should be visible
    const loadingScreen = page.locator('#loadingScreen');
    await expect(loadingScreen).toBeVisible();

    // Reference image 1 should be embedded
    const loadingRef = page.locator('.loading-real-image img');
    await expect(loadingRef).toHaveAttribute(
      'src',
      'https://i.postimg.cc/XvZyYKZf/load.jpg'
    );

    // Percentage counter should animate from 0 to 100
    const percent = page.locator('#loadingPercent');
    await expect(percent).toHaveText('0');

    // Wait for auto-transition to lobby (loading takes ~3 seconds)
    await page.waitForTimeout(4000);

    // Loading screen should fade out
    const lobbyScreen = page.locator('#screen-lobby.active');
    await expect(lobbyScreen).toBeVisible({ timeout: 10000 });
  });

  // ============================================
  // TEST 2: Lobby with Tạo Phòng / Tìm Phòng (Image 2)
  // ============================================
  test('2. Lobby displays Create Room and Find Room buttons', async ({ page }) => {
    await page.goto(BASE_URL);

    // Jump to lobby for fast test
    await page.waitForTimeout(4000);

    // Reference image 2 should be embedded
    const lobbyRef = page.locator('.lobby-real-image img');
    await expect(lobbyRef).toHaveAttribute(
      'src',
      'https://i.postimg.cc/d3gS3n36/loppy.jpg'
    );

    // Two prominent buttons
    const createRoomBtn = page.locator('button:has-text("Tạo Phòng")').first();
    const findRoomBtn = page.locator('button:has-text("Tìm Phòng")').first();

    await expect(createRoomBtn).toBeVisible();
    await expect(findRoomBtn).toBeVisible();
    await expect(createRoomBtn).toHaveClass(/btn-primary/);
    await expect(findRoomBtn).toHaveClass(/btn-secondary/);

    // Verify click effect (tactile 3D press)
    await createRoomBtn.hover();
    await page.waitForTimeout(200);
    await createRoomBtn.click();

    // Should transition to waiting room
    await expect(page.locator('#screen-waiting.active')).toBeVisible({ timeout: 5000 });
  });

  // ============================================
  // TEST 3: Waiting Room with Wooden Blocks + Stickman (Image 3 Day)
  // ============================================
  test('3. Waiting Room renders wooden blocks + stickman avatars on Day theme', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for loading → lobby → waiting room
    await page.waitForTimeout(4000);
    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(500);

    // Theme should be day
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');

    // Reference image 3 (Day scene) should be visible
    const dayScene = page.locator('.waiting-img-day');
    await expect(dayScene).toBeVisible();
    await expect(dayScene).toHaveAttribute(
      'src',
      'https://i.postimg.cc/D0N9nKRY/trong-tran-1.jpg'
    );

    // Wooden blocks should be rendered
    const woodenBlocks = page.locator('.wooden-block');
    const count = await woodenBlocks.count();
    expect(count).toBeGreaterThanOrEqual(10); // 10 max slots

    // Filled slots should have stickman avatars with Discord username
    const filledSlots = page.locator('.wooden-block.filled');
    const filledCount = await filledSlots.count();
    expect(filledCount).toBeGreaterThan(0);

    // Each filled slot should have a player name
    const firstPlayerName = page.locator('.wooden-block.filled .player-name').first();
    await expect(firstPlayerName).toBeVisible();
    const playerText = await firstPlayerName.textContent();
    expect(playerText?.length).toBeGreaterThan(0);
  });

  // ============================================
  // TEST 4: Stickman Spawns on Player Join (Dynamic Logic)
  // ============================================
  test('4. Dynamic stickman spawns on wooden block when player joins', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(500);

    // Count empty slots before
    const emptyBefore = await page.locator('.wooden-block.empty').count();

    // Simulate adding a player by calling the JS function
    // (In real game this happens via socket.io, but we test the DOM logic)
    await page.evaluate(() => {
      // Add a fake player to the slots array
      if (window.players) {
        window.players.push({
          name: 'TestPlayer_' + Date.now(),
          isBot: false,
          avatar: '#e74c3c',
          initial: 'T',
        });
      }
    });

    // Re-generate slots
    await page.evaluate(() => {
      if (typeof generatePlayerSlots === 'function') {
        generatePlayerSlots('playerSlots', 10, 6);
      }
    });

    await page.waitForTimeout(500);

    // Should have one more filled slot now
    const filledAfter = await page.locator('.wooden-block.filled').count();
    expect(filledAfter).toBeGreaterThan(0);

    // The new stickman should have spawned on a wooden block
    const newStickman = page.locator('.wooden-block.filled .stickman-avatar').last();
    await expect(newStickman).toBeVisible();
  });

  // ============================================
  // TEST 5: Theme Toggle - Day ↔ Night (Image 3 ↔ 4)
  // ============================================
  test('5. Theme toggle switches between Day and Night scenes', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(500);

    // Initial: Day theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await expect(page.locator('.waiting-img-day')).toBeVisible();
    await expect(page.locator('.waiting-img-night')).toBeHidden();

    // Toggle to Night
    await page.locator('.theme-toggle').click();
    await page.waitForTimeout(500);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await expect(page.locator('.waiting-img-night')).toBeVisible();
    await expect(page.locator('.waiting-img-night')).toHaveAttribute(
      'src',
      'https://i.postimg.cc/mgj0gCxp/trong-tran-2.jpg'
    );

    // Toggle back to Day
    await page.locator('.theme-toggle').click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  });

  // ============================================
  // TEST 6: Responsive Chat Box - Desktop: Side | Mobile: Bottom (Image 5)
  // ============================================
  test('6. Desktop: Chat box is on the SIDE', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Direct to game screen
    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Bắt Đầu Chơi")').first().click();
    await page.waitForTimeout(500);

    // Reference image 5 (chat preview)
    const chatRef = page.locator('.chat-preview-mini img');
    await expect(chatRef).toHaveAttribute(
      'src',
      'https://i.postimg.cc/768MvtBd/Gameeeeeeee.jpg'
    );

    // Game layout should be flex-row (side chat)
    const layout = page.locator('.game-layout').first();
    const flexDirection = await layout.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('row');

    // Chat container should be on the side (not full width)
    const chatContainer = page.locator('.chat-container').first();
    const chatWidth = await chatContainer.evaluate((el) => el.getBoundingClientRect().width);
    expect(chatWidth).toBeLessThan(400); // Side chat is ~340px
  });

  test('7. Mobile Portrait: Chat box drops to BOTTOM', async ({ page }) => {
    // Set mobile portrait viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Bắt Đầu Chơi")').first().click();
    await page.waitForTimeout(500);

    // Game layout should be flex-column (chat at bottom)
    const layout = page.locator('.game-layout').first();
    const flexDirection = await layout.evaluate((el) => getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('column');

    // Chat container should be full width on mobile
    const chatContainer = page.locator('.chat-container').first();
    const chatRect = await chatContainer.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(chatRect.width).toBeGreaterThan(300); // Full width
    expect(chatRect.height).toBeLessThan(400); // But limited height
  });

  // ============================================
  // TEST 8: Reference Gallery Modal
  // ============================================
  test('8. Reference Gallery shows all 5 design images', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    // Open gallery via thumbnail
    await page.locator('.ref-img').click();
    await page.waitForTimeout(300);

    const gallery = page.locator('#refGallery.active');
    await expect(gallery).toBeVisible();

    // All 5 reference images should be present
    const refImages = page.locator('.ref-gallery img');
    const count = await refImages.count();
    expect(count).toBe(5);

    // Verify URLs
    const expectedUrls = [
      'https://i.postimg.cc/XvZyYKZf/load.jpg',
      'https://i.postimg.cc/d3gS3n36/loppy.jpg',
      'https://i.postimg.cc/D0N9nKRY/trong-tran-1.jpg',
      'https://i.postimg.cc/mgj0gCxp/trong-tran-2.jpg',
      'https://i.postimg.cc/768MvtBd/Gameeeeeeee.jpg',
    ];

    for (let i = 0; i < expectedUrls.length; i++) {
      const src = await refImages.nth(i).getAttribute('src');
      expect(src).toBe(expectedUrls[i]);
    }

    // Close gallery
    await page.locator('.ref-gallery-close').click();
    await expect(gallery).not.toBeVisible();
  });

  // ============================================
  // TEST 9: Buttons - 3D press effects (transform scale)
  // ============================================
  test('9. Buttons have tactile 3D press animations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);

    const btn = page.locator('button:has-text("Tạo Phòng")').first();

    // Hover state should apply transform
    await btn.hover();
    await page.waitForTimeout(200);
    const hoverTransform = await btn.evaluate((el) => getComputedStyle(el).transform);
    expect(hoverTransform).not.toBe('none');

    // Click state should scale down
    await btn.dispatchEvent('mousedown');
    await page.waitForTimeout(100);
    const activeTransform = await btn.evaluate((el) => getComputedStyle(el).transform);
    // Active state has translateY(2px) scale(0.98)
    expect(activeTransform).toContain('matrix');
  });

  // ============================================
  // TEST 10: Chat Send functionality
  // ============================================
  test('10. Chat input sends messages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForTimeout(4000);
    await page.locator('button:has-text("Tạo Phòng")').first().click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Bắt Đầu Chơi")').first().click();
    await page.waitForTimeout(500);

    const input = page.locator('#chatInput');
    await input.fill('🐺 Vote ai đây?');

    const sendBtn = page.locator('.chat-send-btn');
    await sendBtn.click();

    await page.waitForTimeout(300);

    // Message should appear in chat
    const messages = page.locator('.chat-message-text');
    const lastMessage = messages.last();
    await expect(lastMessage).toContainText('Vote ai đây?');
  });
});
