# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\werewolvesville.spec.cjs >> 🐺 Wolvesville v2 - Real-time Game >> 1. Loading screen with Wolvesville logo
- Location: tests\werewolvesville.spec.cjs:8:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Mute" [ref=e4] [cursor=pointer]
  - generic [ref=e9]:
    - generic [ref=e10]: Connected
    - generic [ref=e13]:
      - button "DevPlayer Tap to view profile" [ref=e14] [cursor=pointer]:
        - img "DevPlayer" [ref=e17]
        - generic [ref=e19]: Tap to view profile
      - heading "Dev Player" [level=2] [ref=e20]
      - paragraph [ref=e21]: "@DevPlayer"
      - generic [ref=e22]:
        - generic [ref=e23]: Level 42
        - generic [ref=e27]: 1500 XP
    - generic [ref=e31]:
      - button "Create Room" [ref=e32] [cursor=pointer]
      - button "Join Room" [ref=e46] [cursor=pointer]
      - button "Browse Rooms" [ref=e53] [cursor=pointer]
      - button "How to Play" [ref=e61] [cursor=pointer]
      - button "Settings" [ref=e66] [cursor=pointer]
    - generic [ref=e71]:
      - generic [ref=e72]:
        - paragraph [ref=e79]: "247"
        - paragraph [ref=e80]: Games Won
      - generic [ref=e81]:
        - paragraph [ref=e87]: 89%
        - paragraph [ref=e88]: Win Rate
      - generic [ref=e89]:
        - paragraph [ref=e92]: "15"
        - paragraph [ref=e93]: Roles
```

# Test source

```ts
  1   | // @ts-check
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | const BASE_URL = process.env.BASE_URL || 'https://werewolf-activity-production.up.railway.app';
  5   | 
  6   | test.describe('🐺 Wolvesville v2 - Real-time Game', () => {
  7   | 
  8   |   test('1. Loading screen with Wolvesville logo', async ({ page }) => {
  9   |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  10  |     await page.waitForTimeout(3000);
  11  |     
  12  |     // Should see WOLVESVILLE text
  13  |     const title = await page.locator('text=WOLVESVILLE').count();
> 14  |     expect(title).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  15  |   });
  16  | 
  17  |   test('2. Wolvesville dark theme', async ({ page }) => {
  18  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  19  |     await page.waitForTimeout(3000);
  20  |     
  21  |     const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  22  |     expect(bg).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  23  |   });
  24  | 
  25  |   test('3. Lobby screen has Create Room + Join Room', async ({ page }) => {
  26  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  27  |     await page.waitForTimeout(5000); // wait for Discord auth (dev mode)
  28  |     
  29  |     const createRoom = page.locator('button:has-text("Create Room")');
  30  |     const joinRoom = page.locator('button:has-text("Join Room")');
  31  |     
  32  |     if (await createRoom.count() > 0) {
  33  |       await expect(createRoom.first()).toBeVisible();
  34  |     }
  35  |     if (await joinRoom.count() > 0) {
  36  |       await expect(joinRoom.first()).toBeVisible();
  37  |     }
  38  |   });
  39  | 
  40  |   test('4. Background particles animation', async ({ page }) => {
  41  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  42  |     await page.waitForTimeout(3000);
  43  |     
  44  |     const particles = await page.locator('.wv-particles > div').count();
  45  |     expect(particles).toBeGreaterThan(30);
  46  |   });
  47  | 
  48  |   test('5. Mute button exists', async ({ page }) => {
  49  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  50  |     await page.waitForTimeout(3000);
  51  |     
  52  |     // Should have volume button somewhere
  53  |     const allButtons = await page.locator('button').count();
  54  |     expect(allButtons).toBeGreaterThan(0);
  55  |   });
  56  | 
  57  |   test('6. Click Create Room navigates to game room', async ({ page }) => {
  58  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  59  |     await page.waitForTimeout(5000);
  60  |     
  61  |     const createBtn = page.locator('button:has-text("Create Room")');
  62  |     if (await createBtn.count() > 0) {
  63  |       await createBtn.first().click({ force: true });
  64  |       await page.waitForTimeout(3000);
  65  |       
  66  |       // Should see Room screen elements
  67  |       const roomText = await page.locator('text=Custom Room').count();
  68  |       expect(roomText).toBeGreaterThanOrEqual(0);
  69  |     }
  70  |   });
  71  | 
  72  |   test('7. Has Discord SDK script loaded', async ({ page }) => {
  73  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  74  |     
  75  |     const scripts = await page.evaluate(() => {
  76  |       return Array.from(document.querySelectorAll('script')).map(s => s.src).filter(Boolean);
  77  |     });
  78  |     // Should have at least 1 bundle script
  79  |     expect(scripts.length).toBeGreaterThanOrEqual(1);
  80  |   });
  81  | 
  82  |   test('8. Mobile viewport', async ({ page }) => {
  83  |     await page.setViewportSize({ width: 390, height: 844 });
  84  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  85  |     await page.waitForTimeout(5000);
  86  |     
  87  |     // Should render properly
  88  |     const root = page.locator('#root');
  89  |     await expect(root).toBeVisible();
  90  |     
  91  |     const childCount = await root.evaluate(el => el.children.length);
  92  |     expect(childCount).toBeGreaterThan(0);
  93  |   });
  94  | 
  95  |   test('9. Has wolvesville gradient text', async ({ page }) => {
  96  |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  97  |     await page.waitForTimeout(3000);
  98  |     
  99  |     const gradient = await page.locator('.text-gradient-wv').count();
  100 |     expect(gradient).toBeGreaterThanOrEqual(0);
  101 |   });
  102 | 
  103 |   test('10. API endpoints work', async ({ page }) => {
  104 |     await page.goto(BASE_URL + '/api/rooms', { waitUntil: 'domcontentloaded', timeout: 30000 });
  105 |     const content = await page.textContent('body');
  106 |     expect(content).toContain('['); // Should be valid JSON array
  107 |   });
  108 | 
  109 |   test('11. All custom CSS classes loaded (wolvesville design system)', async ({ page }) => {
  110 |     await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  111 |     await page.waitForTimeout(2000);
  112 |     
  113 |     const hasWvCSS = await page.evaluate(() => {
  114 |       const sheets = Array.from(document.styleSheets);
```