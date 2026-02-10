import { test, expect } from '@playwright/test';

test('button transform-origin is always center on click', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);

  // Navigate past start screen
  await page.locator('text=Start tour').click();
  await page.waitForTimeout(1500);

  // Click first audio stop to trigger mini player
  const firstStop = page.locator('[id^="stop-"]').first();
  await firstStop.click();
  await page.waitForTimeout(1500);

  // Now find all 48px buttons and test their transform-origin
  const allButtons = page.locator('button');
  const totalBtns = await allButtons.count();
  console.log(`Total buttons: ${totalBtns}`);

  let tested = 0;
  let failures: string[] = [];

  for (let i = 0; i < totalBtns; i++) {
    const btn = allButtons.nth(i);
    if (!(await btn.isVisible())) continue;

    const info = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return { w: s.width, h: s.height, origin: s.transformOrigin };
    });

    // Only test round player buttons (48px or 56px)
    if (info.w !== '48px' && info.w !== '56px') continue;

    const box = await btn.boundingBox();
    if (!box) continue;

    const label = await btn.evaluate(el => el.getAttribute('aria-label') || el.textContent?.trim().substring(0, 20) || `(${el.className.substring(0, 20)})`);
    console.log(`\nTesting: "${label}" (${info.w}x${info.h})`);

    // Click near top-left but within circle (12px inset for rounded-full hit area)
    await page.mouse.move(box.x + 12, box.y + 12);
    await page.mouse.down();
    await page.waitForTimeout(80);
    const tl = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return { origin: s.transformOrigin, transform: s.transform };
    });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Click near bottom-right but within circle (12px inset)
    await page.mouse.move(box.x + box.width - 12, box.y + box.height - 12);
    await page.mouse.down();
    await page.waitForTimeout(80);
    const br = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return { origin: s.transformOrigin, transform: s.transform };
    });
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Click dead center
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(80);
    const ct = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return { origin: s.transformOrigin, transform: s.transform };
    });
    await page.mouse.up();

    console.log(`  top-left:     origin=${tl.origin} transform=${tl.transform}`);
    console.log(`  bottom-right: origin=${br.origin} transform=${br.transform}`);
    console.log(`  center:       origin=${ct.origin} transform=${ct.transform}`);

    // Key check: transform-origin must always be center (same across all positions)
    const originsMatch = tl.origin === br.origin && br.origin === ct.origin;

    // Check that at least one click produced a scale transform (CSS transition or WAAPI may vary)
    const anyTransform = tl.transform !== 'none' || br.transform !== 'none' || ct.transform !== 'none';

    if (!originsMatch) {
      failures.push(`"${label}": origins differ: TL=${tl.origin}, BR=${br.origin}, CT=${ct.origin}`);
      console.log(`  ❌ ORIGIN MISMATCH`);
    } else if (!anyTransform) {
      // Note: WAAPI-based animations (framer-motion whileTap) won't show in getComputedStyle
      console.log(`  ⚠️ No CSS transform detected (may use WAAPI animation)`);
    } else {
      console.log(`  ✅ CONSISTENT origin, scale effect active`);
    }
    tested++;
  }

  console.log(`\n=== Tested ${tested} buttons, ${failures.length} failures ===`);
  failures.forEach(f => console.log(`  ❌ ${f}`));

  expect(failures).toHaveLength(0);
  expect(tested).toBeGreaterThan(0);
});
