# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: werewolf-ui.spec.cjs >> 🐺 MA SÓI - UI Mới >> 6. Theme toggle Light ↔ Dark
- Location: werewolf-ui.spec.cjs:85:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('html')
Expected pattern: /dark/
Received string:  "light"

Call log:
  - Expect "toHaveClass" with timeout 10000ms
  - waiting for locator('html')
    12 × locator resolved to <html lang="vi" class="light">…</html>
       - unexpected value "light"
  - Test timeout of 60000ms exceeded.

```

```yaml
- document:
  - banner
  - navigation
  - main
```

# Test source

```ts
  1   | // @ts-check
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | /**
  5   |  * MA SÓI - E2E TEST SUITE (UI mới - Material Symbols)
  6   |  * Run: npx playwright test werewolf-ui.spec.cjs
  7   |  */
  8   | 
  9   | const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';
  10  | 
  11  | test.describe('🐺 MA SÓI - UI Mới', () => {
  12  | 
  13  |   // Helper: wait for Tailwind + JS init
  14  |   async function waitForReady(page) {
  15  |     await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });
  16  |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  17  |     await page.waitForTimeout(2000);
  18  |   }
  19  | 
  20  |   test('1. Trang chủ MA SÓI với TẠO PHÒNG / TÌM PHÒNG', async ({ page }) => {
  21  |     await waitForReady(page);
  22  | 
  23  |     await expect(page.locator('h1:has-text("MA SÓI")').first()).toBeVisible();
  24  |     await expect(page.locator('button:has-text("TẠO PHÒNG")').first()).toBeVisible();
  25  |     await expect(page.locator('button:has-text("TÌM PHÒNG")').first()).toBeVisible();
  26  | 
  27  |     // Room cards
  28  |     const cards = page.locator('#roomGrid > div');
  29  |     await expect(cards).toHaveCount(4);
  30  |   });
  31  | 
  32  |   test('2. Click TẠO PHÒNG → Room screen với wooden blocks', async ({ page }) => {
  33  |     await waitForReady(page);
  34  |     await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
  35  |     await page.waitForTimeout(1500);
  36  | 
  37  |     await expect(page.locator('#screen-room')).toBeVisible();
  38  |     await expect(page.locator('h2:has-text("Phòng Của Lucas")')).toBeVisible();
  39  | 
  40  |     // 10 player slots
  41  |     const slots = page.locator('#playerSlots > div');
  42  |     await expect(slots).toHaveCount(10);
  43  | 
  44  |     // Stickmen rendered
  45  |     await expect(page.locator('#playerSlots svg')).toHaveCount(10);
  46  |   });
  47  | 
  48  |   test('3. Thêm người chơi → fill wooden block', async ({ page }) => {
  49  |     await waitForReady(page);
  50  |     await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
  51  |     await page.waitForTimeout(1500);
  52  | 
  53  |     await page.locator('#screen-room button:has-text("Thêm người chơi")').click({ force: true });
  54  |     await page.waitForTimeout(800);
  55  | 
  56  |     // Should still have 10 slots
  57  |     await expect(page.locator('#playerSlots > div')).toHaveCount(10);
  58  |   });
  59  | 
  60  |   test('4. Toggle Day ↔ Night', async ({ page }) => {
  61  |     await waitForReady(page);
  62  |     await page.locator('button:has-text("TẠO PHÒNG")').first().click({ force: true });
  63  |     await page.waitForTimeout(1500);
  64  | 
  65  |     await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');
  66  |     await page.locator('#phaseLabel').click({ force: true });
  67  |     await page.waitForTimeout(500);
  68  |     await expect(page.locator('#phaseLabel')).toHaveText('Ban Đêm');
  69  | 
  70  |     await page.locator('#phaseLabel').click({ force: true });
  71  |     await page.waitForTimeout(500);
  72  |     await expect(page.locator('#phaseLabel')).toHaveText('Ban Ngày');
  73  |   });
  74  | 
  75  |   test('5. Chat box gửi tin nhắn', async ({ page }) => {
  76  |     await waitForReady(page);
  77  |     const input = page.locator('#chatInput');
  78  |     await input.fill('🐺 Vote đi mọi người!');
  79  |     await page.locator('button[type="submit"]').first().click({ force: true });
  80  |     await page.waitForTimeout(600);
  81  |     const last = page.locator('#chatLog > div').last();
  82  |     await expect(last).toContainText('Vote đi mọi người!');
  83  |   });
  84  | 
  85  |   test('6. Theme toggle Light ↔ Dark', async ({ page }) => {
  86  |     await waitForReady(page);
  87  |     const html = page.locator('html');
  88  |     await expect(html).toHaveClass(/light/);
  89  |     await page.locator('button[aria-label="Toggle Theme"]').click({ force: true });
  90  |     await page.waitForTimeout(500);
> 91  |     await expect(html).toHaveClass(/dark/);
      |                        ^ Error: expect(locator).toHaveClass(expected) failed
  92  |   });
  93  | 
  94  |   test('7. Desktop: Chat sidebar (right column)', async ({ page }) => {
  95  |     await page.setViewportSize({ width: 1280, height: 800 });
  96  |     await waitForReady(page);
  97  |     const aside = page.locator('aside').first();
  98  |     await expect(aside).toBeVisible();
  99  |     const box = await aside.boundingBox();
  100 |     expect(box.x).toBeGreaterThan(800);
  101 |   });
  102 | 
  103 |   test('8. Mobile: Bottom nav 4 items', async ({ page }) => {
  104 |     await page.setViewportSize({ width: 390, height: 844 });
  105 |     await waitForReady(page);
  106 |     const bottomNav = page.locator('nav.fixed.bottom-0');
  107 |     await expect(bottomNav).toBeVisible();
  108 |     await expect(bottomNav.locator('a')).toHaveCount(4);
  109 |   });
  110 | 
  111 |   test('9. Side nav Desktop 4 menu chính', async ({ page }) => {
  112 |     await page.setViewportSize({ width: 1280, height: 800 });
  113 |     await waitForReady(page);
  114 |     const sideNav = page.locator('nav.hidden').first();
  115 |     await expect(sideNav).toBeVisible();
  116 |     await expect(sideNav).toContainText('Trang chủ');
  117 |     await expect(sideNav).toContainText('Phòng chơi');
  118 |     await expect(sideNav).toContainText('Bạn bè');
  119 |     await expect(sideNav).toContainText('Cửa hàng');
  120 |   });
  121 | 
  122 |   test('10. Premium button có 3D effect (box-shadow)', async ({ page }) => {
  123 |     await waitForReady(page);
  124 |     const btn = page.locator('button:has-text("Nâng cấp Premium")').first();
  125 |     await expect(btn).toBeVisible();
  126 |     await expect(btn).toHaveClass(/mechanical-btn/);
  127 |     const shadow = await btn.evaluate(el => getComputedStyle(el).boxShadow);
  128 |     expect(shadow).not.toBe('none');
  129 |   });
  130 | });
```