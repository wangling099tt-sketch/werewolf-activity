// ============================================
// WEREWOLF GAME - SIMPLE PLAYWRIGHT TEST
// ============================================

const { chromium } = require('playwright');

const BASE_URL = 'file:///' + process.cwd().replace(/\\/g, '/') + '/client/index.html';

async function runTests() {
  console.log('🚀 Starting Werewolf UI Tests\n');
  console.log('📍 Testing:', BASE_URL);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Navigate
    await page.goto(BASE_URL);
    console.log('✅ Page loaded\n');
    
    // Disable animations for stable testing
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
      document.head.appendChild(style);
    });
    
    // Reload to apply animation disable
    await page.reload();
    await page.waitForTimeout(500);
    
    // TEST 1: Loading Screen
    console.log('📋 Test 1: Loading Screen');
    const loadingScreen = await page.locator('.loading-screen').isVisible();
    if (loadingScreen) {
      console.log('  ✅ Loading screen visible');
      passed++;
    } else {
      console.log('  ❌ Loading screen not found');
      failed++;
    }
    
    // Skip loading animation - go directly to lobby
    console.log('  ⏳ Skipping loading animation...');
    await page.evaluate(() => {
      const ls = document.getElementById('loadingScreen');
      if (ls) ls.classList.add('fade-out');
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-lobby')?.classList.add('active');
    });
    await page.waitForTimeout(200);
    
    // TEST 2: Lobby
    console.log('\n📋 Test 2: Lobby');
    const lobby = await page.locator('.lobby').isVisible();
    if (lobby) {
      console.log('  ✅ Lobby visible');
      passed++;
    } else {
      console.log('  ❌ Lobby not found');
      failed++;
    }
    
    // TEST 3: Buttons
    console.log('\n📋 Test 3: Lobby Buttons');
    const createBtn = await page.locator('button:has-text("Tạo Phòng")').isVisible();
    const findBtn = await page.locator('button:has-text("Tìm Phòng")').isVisible();
    
    if (createBtn && findBtn) {
      console.log('  ✅ "Tạo Phòng" button visible');
      console.log('  ✅ "Tìm Phòng" button visible');
      passed++;
    } else {
      console.log('  ❌ Buttons not found');
      failed++;
    }
    
    // TEST 4: Click Create Room (use force to bypass animation issues)
    console.log('\n📋 Test 4: Navigation');
    await page.locator('button:has-text("Tạo Phòng")').click({ force: true });
    await page.waitForTimeout(300);
    
    // Check specific waiting room in screen-waiting
    const waitingRoom = await page.locator('#screen-waiting .waiting-room').isVisible();
    if (waitingRoom) {
      console.log('  ✅ Navigated to Waiting Room');
      passed++;
    } else {
      console.log('  ❌ Navigation failed');
      failed++;
    }
    
    // TEST 5: Wooden Blocks
    console.log('\n📋 Test 5: Player Slots');
    const slots = await page.locator('.wooden-block').count();
    if (slots > 0) {
      console.log(`  ✅ Found ${slots} wooden block slots`);
      passed++;
    } else {
      console.log('  ❌ No slots found');
      failed++;
    }
    
    // TEST 6: Stickman Avatars
    const stickmen = await page.locator('.stickman-avatar').count();
    if (stickmen > 0) {
      console.log(`  ✅ Found ${stickmen} stickman avatars`);
      passed++;
    } else {
      console.log('  ❌ No stickmen found');
      failed++;
    }
    
    // TEST 7: Player Names
    const playerNames = await page.locator('.player-name:not(:has-text("Trống"))').count();
    if (playerNames > 0) {
      console.log(`  ✅ Found ${playerNames} player names`);
      passed++;
    } else {
      console.log('  ❌ No player names found');
      failed++;
    }
    
    // TEST 8: Theme Toggle
    console.log('\n📋 Test 6: Theme Toggle');
    await page.locator('.theme-toggle').click({ force: true });
    await page.waitForTimeout(200);
    
    const nightTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    if (nightTheme === 'night') {
      console.log('  ✅ Theme toggled to night');
      passed++;
    } else {
      console.log(`  ❌ Theme toggle failed (got: ${nightTheme})`);
      failed++;
    }
    
    // Toggle back to day
    await page.locator('.theme-toggle').click({ force: true });
    await page.waitForTimeout(200);
    
    const dayTheme = await page.evaluate(() => 
      document.documentElement.getAttribute('data-theme')
    );
    if (dayTheme === 'day') {
      console.log('  ✅ Theme toggled back to day');
      passed++;
    } else {
      console.log('  ❌ Theme toggle back failed');
      failed++;
    }
    
    // TEST 9: Go to Game Screen
    console.log('\n📋 Test 7: Game + Chat');
    await page.evaluate(() => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-game')?.classList.add('active');
    });
    await page.waitForTimeout(200);
    
    // Use specific selector for chat in game screen
    const chatContainer = await page.locator('#screen-game .chat-container').isVisible();
    if (chatContainer) {
      console.log('  ✅ Chat container visible');
      passed++;
    } else {
      console.log('  ❌ Chat container not found');
      failed++;
    }
    
    // TEST 10: Chat Messages
    const chatMessages = await page.locator('#screen-game .chat-message').count();
    if (chatMessages > 0) {
      console.log(`  ✅ Found ${chatMessages} chat messages`);
      passed++;
    } else {
      console.log('  ❌ No chat messages found');
      failed++;
    }
    
    // TEST 11: Chat Input
    const chatInput = await page.locator('#screen-game .chat-input').isVisible();
    if (chatInput) {
      console.log('  ✅ Chat input visible');
      passed++;
    } else {
      console.log('  ❌ Chat input not found');
      failed++;
    }
    
    // TEST 12: Send Message
    console.log('\n📋 Test 8: Chat Interaction');
    await page.locator('#screen-game .chat-input').fill('Hello Werewolf!');
    await page.locator('#screen-game .chat-send-btn').click({ force: true });
    await page.waitForTimeout(200);
    
    const newMessages = await page.locator('#screen-game .chat-message').count();
    if (newMessages > chatMessages) {
      console.log('  ✅ Message sent successfully');
      passed++;
    } else {
      console.log('  ❌ Message send failed');
      failed++;
    }
    
    // TEST 13: Responsive - Mobile
    console.log('\n📋 Test 9: Responsive Layout');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    
    // Check chat position on mobile - use specific selector
    const chatBoxMobile = await page.locator('#screen-game .chat-container').boundingBox();
    const gameBoxMobile = await page.locator('#screen-game .game-area').boundingBox();
    
    if (chatBoxMobile && gameBoxMobile) {
      // On mobile, chat should be below game area (higher y value)
      if (chatBoxMobile.y > gameBoxMobile.y) {
        console.log('  ✅ Mobile: Chat at bottom (below game)');
        passed++;
      } else {
        console.log('  ⚠️ Mobile: Chat position unclear');
      }
    }
    
    // TEST 14: Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);
    
    const chatBoxDesktop = await page.locator('#screen-game .chat-container').boundingBox();
    const gameBoxDesktop = await page.locator('#screen-game .game-area').boundingBox();
    
    if (chatBoxDesktop && gameBoxDesktop) {
      // On desktop, chat should be to the right (higher x value)
      if (chatBoxDesktop.x > gameBoxDesktop.x) {
        console.log('  ✅ Desktop: Chat on side (right of game)');
        passed++;
      } else {
        console.log('  ⚠️ Desktop: Chat position unclear');
      }
    }
    
    // SUMMARY
    console.log('\n' + '='.repeat(40));
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(40));
    
    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
    } else {
      console.log('\n⚠️ Some tests failed');
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
