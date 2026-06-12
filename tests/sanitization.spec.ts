import { test, expect } from '@playwright/test';
import { startTour } from './helpers';

/**
 * RichText HTML sanitization (components/RichText.tsx → DOMPurify).
 *
 * Authors put HTML/markdown in stop content, transcriptions, and captions, so
 * the player must render a safe allowlist (`strong`, `em`, `a`, `tooltip`, …)
 * and strip everything else (`script`, `img`, inline event handlers), forcing
 * `target="_blank" rel="noopener noreferrer"` on links.
 *
 * The `_fixture` tour's text stop (`text-2`) embeds a known XSS payload:
 *   <strong>SAFE-STRONG</strong> … <a href=…>SAFE-LINK</a> <tooltip>…</tooltip>
 *   <script>window.__xssFired=true</script><img src=x onerror=…>
 */

test.use({ viewport: { width: 430, height: 1100 } });

test.describe('RichText sanitization', () => {
  test('renders the allowed tags and strips dangerous ones', async ({ page }) => {
    await startTour(page, '_fixture');

    const textCard = page.locator('[data-stop-type="text"]').first();
    await textCard.scrollIntoViewIfNeeded();

    // Allowed formatting survives as real elements.
    await expect(textCard.locator('strong', { hasText: 'SAFE-STRONG' })).toBeVisible();

    // Links survive AND are hardened with target/rel.
    const link = textCard.getByRole('link', { name: 'SAFE-LINK' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);

    // Disallowed/dangerous nodes are removed entirely.
    await expect(textCard.locator('script')).toHaveCount(0);
    await expect(textCard.locator('img')).toHaveCount(0);
  });

  test('the embedded script/onerror payload never executes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await startTour(page, '_fixture');
    await page.locator('[data-stop-type="text"]').first().scrollIntoViewIfNeeded();
    // Give any (sanitized-away) handler a chance to have fired.
    await page.waitForTimeout(300);

    const xssFired = await page.evaluate(() => (window as unknown as { __xssFired?: boolean }).__xssFired === true);
    expect(xssFired, 'XSS payload executed — sanitization failed').toBe(false);
    expect(errors).toEqual([]);
  });
});
