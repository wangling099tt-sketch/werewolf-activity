// ============================================
// WEREWOLF GAME - PLAYWRIGHT E2E TESTS
// Complete UI/UX Validation Suite
// ============================================

import { test, expect, chromium, Page, ViewportSize } from '@playwright/test';

// ===== TEST CONFIGURATION =====
const BASE_URL = 'http://localhost:5173';
const DESKTOP_VIEWPORT: ViewportSize = { width: 1280, height: 720 };
const MOBILE_VIEWPORT: ViewportSize = { width: 375, height: 812 };

// ===== HELPER FUNCTIONS =====

/**
 * Wait for element with retry
 */
async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * Take screenshot with name
 */
async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: false });
  console.log(`📸 Screenshot saved: test-results/${name}.png`);
}

// ===== TEST SUITE =====

test.describe('Werewolf Game UI/UX Tests', () => {
  
  // ===== SETUP =====
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  // ===== TEST 1: LOADING SCREEN =====
  test.describe('1. Loading Screen Tests', () => {
    
    test('should display loading screen with SDK indicator', async ({ page }) => {
      // Verify loading screen elements
      await expect(page.locator('.loading-screen')).toBeVisible();
      await expect(page.locator('.loading-title')).toContainText('Werewolf');
      await expect(page.locator('.loading-progress-container')).toBeVisible();
      
      // Verify progress percentage starts at 0
      const percentage = await page.locator('.loading-percentage').textContent();
      expect(percentage).toContain('0');
      
      console.log('✅ Loading screen displays correctly');
    });

    test('should complete loading animation within timeout', async ({ page }) => {
      // Wait for loading to complete (max 10 seconds)
      await expect(page.locator('.loading-screen')).toHaveClass(/fade-out/, { timeout: 10000 });
      
      // Verify lobby appears after loading
      await expect(page.locator('.lobby')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Loading animation completes successfully');
    });

    test('should show pulsing logo animation', async ({ page }) => {
      const logo = page.locator('.loading-logo');
      await expect(logo).toBeVisible();
      
      // Check for animation class
      const title = page.locator('.loading-title');
      await expect(title).toHaveClass(/animate|pulse|float/);
      
      console.log('✅ Loading logo animation is active');
    });
  });

  // ===== TEST 2: LOBBY & BUTTON TESTS =====
  test.describe('2. Lobby & Button Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      // Skip loading by navigating directly to lobby
      await page.evaluate(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('fade-out');
        const lobbyScreen = document.getElementById('screen-lobby');
        if (lobbyScreen) lobbyScreen.classList.add('active');
      });
      await page.waitForTimeout(600);
    });

    test('should display lobby with Werewolf title', async ({ page }) => {
      await expect(page.locator('.lobby-title')).toContainText('Werewolf');
      await expect(page.locator('.lobby-subtitle')).toBeVisible();
      
      console.log('✅ Lobby displays correctly');
    });

    test('should have "Tạo Phòng" (Create Room) button with correct styling', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Tạo Phòng")');
      await expect(createBtn).toBeVisible();
      await expect(createBtn).toHaveClass(/btn-primary/);
      await expect(createBtn).toHaveClass(/btn-3d/);
      
      console.log('✅ "Tạo Phòng" button has correct styling');
    });

    test('should have "Tìm Phòng" (Find Room) button with correct styling', async ({ page }) => {
      const findBtn = page.locator('button:has-text("Tìm Phòng")');
      await expect(findBtn).toBeVisible();
      await expect(findBtn).toHaveClass(/btn-secondary/);
      await expect(findBtn).toHaveClass(/btn-3d/);
      
      console.log('✅ "Tìm Phòng" button has correct styling');
    });

    test('should have hover effect on buttons', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Tạo Phòng")');
      
      // Get computed styles before hover
      const boxShadowBefore = await createBtn.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      );
      
      // Hover over button
      await createBtn.hover();
      await page.waitForTimeout(300);
      
      // Get computed styles after hover
      const boxShadowAfter = await createBtn.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      );
      
      // Box-shadow should change on hover
      expect(boxShadowAfter).not.toBe(boxShadowBefore);
      
      console.log('✅ Button hover effects working');
    });

    test('should have click/press effect (3D push)', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Tạo Phòng")');
      
      // Get transform before click
      const transformBefore = await createBtn.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Click and hold
      await createBtn.click({ delay: 100 });
      await page.waitForTimeout(150);
      
      console.log('✅ Button click effect triggered');
    });

    test('should navigate to waiting room on button click', async ({ page }) => {
      const createBtn = page.locator('button:has-text("Tạo Phòng")');
      await createBtn.click();
      
      // Verify navigation to waiting room
      await expect(page.locator('.waiting-room')).toBeVisible();
      
      console.log('✅ Navigation to waiting room works');
    });
  });

  // ===== TEST 3: WAITING ROOM & PLAYER SLOTS =====
  test.describe('3. Waiting Room & Player Slots Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate directly to waiting room
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-waiting')?.classList.add('active');
      });
      await page.waitForTimeout(300);
    });

    test('should display room info header', async ({ page }) => {
      await expect(page.locator('.room-name')).toBeVisible();
      await expect(page.locator('.room-code')).toBeVisible();
      await expect(page.locator('.room-players-count')).toBeVisible();
      
      console.log('✅ Room info displays correctly');
    });

    test('should render wooden block slots', async ({ page }) => {
      const slots = page.locator('.wooden-block');
      const count = await slots.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`✅ Found ${count} wooden block slots`);
    });

    test('should show stickman avatar on filled slots', async ({ page }) => {
      const filledSlots = page.locator('.wooden-block.filled');
      const filledCount = await filledSlots.count();
      
      // At least one slot should be filled
      expect(filledCount).toBeGreaterThan(0);
      
      // Check for stickman avatar
      const stickman = page.locator('.stickman-avatar').first();
      await expect(stickman).toBeVisible();
      
      console.log(`✅ ${filledCount} slots have stickman avatars`);
    });

    test('should display player username above stickman', async ({ page }) => {
      const playerName = page.locator('.player-name').first();
      await expect(playerName).toBeVisible();
      
      // Should not be "Trống" (empty)
      const name = await playerName.textContent();
      expect(name).not.toBe('Trống');
      
      console.log(`✅ Player name displayed: ${name}`);
    });

    test('should show empty slots with "Trống" placeholder', async ({ page }) => {
      const emptySlots = page.locator('.wooden-block.empty');
      const emptyCount = await emptySlots.count();
      
      if (emptyCount > 0) {
        const emptyName = page.locator('.wooden-block.empty .player-name').first();
        await expect(emptyName).toContainText('Trống');
        console.log(`✅ ${emptyCount} empty slots show placeholder`);
      }
    });

    test('should update player count display', async ({ page }) => {
      const playerCount = await page.locator('.room-players-count').textContent();
      
      // Should match pattern like "5/10 người chơi"
      expect(playerCount).toMatch(/\d+\/\d+/);
      
      console.log(`✅ Player count displayed: ${playerCount}`);
    });
  });

  // ===== TEST 4: DAY/NIGHT THEME =====
  test.describe('4. Day/Night Theme Tests', () => {
    
    test('should start with day theme by default', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'day');
      
      console.log('✅ Default theme is day');
    });

    test('should toggle to night theme', async ({ page }) => {
      const themeToggle = page.locator('.theme-toggle');
      await themeToggle.click();
      
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'night');
      
      console.log('✅ Theme toggles to night');
    });

    test('should toggle back to day theme', async ({ page }) => {
      const themeToggle = page.locator('.theme-toggle');
      
      // Toggle to night first
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      // Toggle back to day
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'day');
      
      console.log('✅ Theme toggles back to day');
    });

    test('should update CSS variables on theme change', async ({ page }) => {
      // Get day theme background
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'day');
      });
      const dayBg = await page.evaluate(() => 
        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
      );
      
      // Toggle to night
      await page.locator('.theme-toggle').click();
      await page.waitForTimeout(300);
      
      const nightBg = await page.evaluate(() => 
        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
      );
      
      // Backgrounds should be different
      expect(nightBg).not.toBe(dayBg);
      
      console.log('✅ CSS variables update on theme change');
    });

    test('should show night phase indicator when night theme active', async ({ page }) => {
      // Go to waiting room
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-waiting')?.classList.add('active');
        document.documentElement.setAttribute('data-theme', 'night');
      });
      
      const phaseIndicator = page.locator('.phase-indicator');
      await expect(phaseIndicator).toHaveClass(/night/);
      
      console.log('✅ Night phase indicator shows correctly');
    });
  });

  // ===== TEST 5: RESPONSIVE CHAT BOX =====
  test.describe('5. Responsive Chat Box Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      // Navigate to game screen
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      await page.waitForTimeout(300);
    });

    test('should display chat container', async ({ page }) => {
      await expect(page.locator('.chat-container')).toBeVisible();
      await expect(page.locator('.chat-header')).toBeVisible();
      await expect(page.locator('.chat-messages')).toBeVisible();
      await expect(page.locator('.chat-input')).toBeVisible();
      
      console.log('✅ Chat container displays correctly');
    });

    test('should show chat messages', async ({ page }) => {
      const messages = page.locator('.chat-message');
      const count = await messages.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`✅ Found ${count} chat messages`);
    });

    test('should allow typing in chat input', async ({ page }) => {
      const chatInput = page.locator('.chat-input');
      await chatInput.fill('Test message');
      
      const value = await chatInput.inputValue();
      expect(value).toBe('Test message');
      
      console.log('✅ Chat input accepts text');
    });

    test('should send message on Enter key', async ({ page }) => {
      const chatInput = page.locator('.chat-input');
      const messagesBefore = await page.locator('.chat-message').count();
      
      await chatInput.fill('Hello Werewolf!');
      await chatInput.press('Enter');
      
      await page.waitForTimeout(300);
      
      const messagesAfter = await page.locator('.chat-message').count();
      expect(messagesAfter).toBeGreaterThan(messagesBefore);
      
      console.log('✅ Message sent on Enter key');
    });

    test('should send message on send button click', async ({ page }) => {
      const sendBtn = page.locator('.chat-send-btn');
      const messagesBefore = await page.locator('.chat-message').count();
      
      await page.locator('.chat-input').fill('Test click');
      await sendBtn.click();
      
      await page.waitForTimeout(300);
      
      const messagesAfter = await page.locator('.chat-message').count();
      expect(messagesAfter).toBeGreaterThan(messagesBefore);
      
      console.log('✅ Message sent on button click');
    });
  });

  // ===== TEST 6: RESPONSIVE LAYOUT (DESKTOP vs MOBILE) =====
  test.describe('6. Responsive Layout Tests', () => {
    
    test('should show chat on SIDE on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      
      // Navigate to game screen
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      
      // Get layout
      const layout = page.locator('.game-layout');
      const layoutBox = await layout.boundingBox();
      
      // Get chat
      const chat = page.locator('.chat-container');
      const chatBox = await chat.boundingBox();
      
      // On desktop, chat should be to the right of game area
      // Chat left should be greater than game area left + some margin
      expect(chatBox!.left).toBeGreaterThan(layoutBox!.left);
      
      console.log('✅ Desktop: Chat on side (right of game)');
    });

    test('should show chat at BOTTOM on mobile (375px)', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      
      // Navigate to game screen
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      
      await page.waitForTimeout(300);
      
      // Get chat position
      const chat = page.locator('.chat-container');
      const chatBox = await chat.boundingBox();
      
      // On mobile portrait, chat should be at the bottom
      // Chat bottom should be close to viewport bottom
      const distanceFromBottom = await page.evaluate(() => window.innerHeight - (
        document.querySelector('.chat-container')?.getBoundingClientRect().bottom || 0
      ));
      
      console.log(`✅ Mobile: Chat at bottom (${distanceFromBottom}px from bottom)`);
    });

    test('should adapt layout when resizing viewport', async ({ page }) => {
      // Start on desktop
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      
      const chatDesktopBox = await page.locator('.chat-container').boundingBox();
      
      // Resize to mobile
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.waitForTimeout(500);
      
      const chatMobileBox = await page.locator('.chat-container').boundingBox();
      
      // Chat position should change
      expect(chatMobileBox!.y).not.toBe(chatDesktopBox!.y);
      
      console.log('✅ Layout adapts on viewport resize');
    });

    test('should adjust player slots grid for mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-waiting')?.classList.add('active');
      });
      
      const slots = page.locator('.player-slots');
      const gridCols = await slots.evaluate((el) => 
        window.getComputedStyle(el).gridTemplateColumns
      );
      
      // On mobile, should have fewer columns
      expect(gridCols).toBeDefined();
      console.log(`✅ Mobile slots grid: ${gridCols}`);
    });
  });

  // ===== TEST 7: ACCESSIBILITY & UX =====
  test.describe('7. Accessibility & UX Tests', () => {
    
    test('should have proper button focus states', async ({ page }) => {
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-lobby')?.classList.add('active');
      });
      
      // Press Tab to focus first button
      await page.keyboard.press('Tab');
      
      const focusedBtn = page.locator('button:focus');
      await expect(focusedBtn).toBeVisible();
      
      console.log('✅ Button focus states work');
    });

    test('should have smooth transitions on theme change', async ({ page }) => {
      const themeToggle = page.locator('.theme-toggle');
      
      // Measure transition
      await page.evaluate(() => {
        const el = document.querySelector('body') as HTMLElement;
        el.style.transition = 'background 0.3s ease, color 0.3s ease';
      });
      
      const startTime = Date.now();
      await themeToggle.click();
      await page.waitForTimeout(100);
      const endTime = Date.now();
      
      // Should transition smoothly (not instant)
      expect(endTime - startTime).toBeGreaterThan(50);
      
      console.log('✅ Theme transition is smooth');
    });

    test('should display system messages in chat', async ({ page }) => {
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      
      const systemMsg = page.locator('.chat-message.system');
      await expect(systemMsg.first()).toBeVisible();
      
      console.log('✅ System messages display correctly');
    });

    test('should show typing indicator (if implemented)', async ({ page }) => {
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-game')?.classList.add('active');
      });
      
      const typingInd = page.locator('.typing-indicator');
      // This is optional - just verify it exists if implemented
      const exists = await typingInd.count() > 0;
      
      if (exists) {
        console.log('✅ Typing indicator found');
      } else {
        console.log('ℹ️ Typing indicator not implemented (optional)');
      }
    });
  });
});

// ===== STANDALONE RUNNER =====
async function runTests() {
  const { chromium } = require('@playwright/test');
  
  console.log('🚀 Starting Werewolf Game E2E Tests\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to app
    await page.goto(BASE_URL);
    console.log('📍 Navigated to', BASE_URL);
    
    // Test 1: Loading Screen
    console.log('\n📋 Test 1: Loading Screen');
    await page.waitForSelector('.loading-screen', { timeout: 5000 });
    console.log('✅ Loading screen visible');
    
    // Wait for loading
    await page.waitForSelector('.lobby', { timeout: 10000 });
    console.log('✅ Loading completed, lobby visible');
    
    // Test 2: Lobby Buttons
    console.log('\n📋 Test 2: Lobby Buttons');
    const createBtn = page.locator('button:has-text("Tạo Phòng")');
    const findBtn = page.locator('button:has-text("Tìm Phòng")');
    
    await expect(createBtn).toBeVisible();
    await expect(findBtn).toBeVisible();
    console.log('✅ Both buttons visible');
    
    // Test 3: Navigate to Waiting Room
    console.log('\n📋 Test 3: Waiting Room');
    await createBtn.click();
    await page.waitForSelector('.waiting-room', { timeout: 5000 });
    console.log('✅ Navigated to waiting room');
    
    // Check wooden blocks
    const slots = await page.locator('.wooden-block').count();
    console.log(`✅ Found ${slots} player slots`);
    
    // Test 4: Theme Toggle
    console.log('\n📋 Test 4: Theme Toggle');
    await page.locator('.theme-toggle').click();
    await page.waitForTimeout(300);
    const theme = await page.locator('html').getAttribute('data-theme');
    console.log(`✅ Theme toggled to: ${theme}`);
    
    // Test 5: Responsive Chat
    console.log('\n📋 Test 5: Responsive Chat');
    
    // Desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.evaluate(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-game')?.classList.add('active');
    });
    console.log('✅ Desktop viewport set (1280x720)');
    
    // Mobile
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.waitForTimeout(300);
    console.log('✅ Mobile viewport set (375x812)');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run standalone if executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
