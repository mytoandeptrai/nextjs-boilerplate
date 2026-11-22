/**
 * Capture full-page screenshots of the key routes into `docs/screenshots/`.
 *
 *   pnpm exec playwright install chromium   # once
 *   pnpm dev                                # in another terminal (or `pnpm build && pnpm start`)
 *   pnpm screenshots                        # storefront + admin
 *   pnpm screenshots --submit               # also send two test leads (one Zalo, one home survey)
 *
 * Environment: `SCREENSHOT_BASE_URL` (default http://localhost:3000), `ADMIN_EMAIL` and `ADMIN_PASSWORD` (an
 * account made with `pnpm admin:create`). Without admin credentials the admin screenshots are skipped.
 *
 * Without `--submit` nothing is written to the database: the checkout form is filled in but not sent.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, type BrowserContext, chromium, type Page } from 'playwright';
import sharp from 'sharp';

const BASE_URL = (process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SUBMIT = process.argv.includes('--submit');
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots');

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};

/** Development-only overlays (Next.js indicator, React Query devtools) do not belong in the evidence. */
const HIDE_DEV_TOOLS = 'nextjs-portal, .tsqd-parent-container { display: none !important; }';
/** The app's own open dialog or sheet (the Next.js development overlay also uses `role="dialog"`). */
const DIALOG = '[role="dialog"][data-state="open"]';

const saved: string[] = [];

/** Scroll through the page so lazy images start loading, then wait until every image has finished. */
const settle = async (page: Page) => {
  await page.addStyleTag({ content: HIDE_DEV_TOOLS }).catch(() => undefined);
  await page.evaluate(async () => {
    await document.fonts.ready;

    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    window.scrollTo(0, 0);
  });
  await page
    .waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, {
      timeout: 30_000,
    })
    .catch(() => console.warn(`  some images did not finish loading on ${page.url()}`));
  await page.waitForTimeout(400);
};

/**
 * The admin sidebar is as tall as the viewport, so a stitched full-page capture would cut it off below the first
 * screen. Growing the viewport to the height of the content gives one coherent frame instead.
 */
const fitViewportToContent = async (page: Page) => {
  const height = await page.evaluate(() =>
    Math.max(...[...document.querySelectorAll('main, [data-slot="sidebar-inset"]')].map((node) => node.scrollHeight))
  );

  await page.setViewportSize({ width: DESKTOP.viewport.width, height: Math.max(DESKTOP.viewport.height, height) });
  await page.waitForTimeout(250);
};

const shot = async (page: Page, name: string, { fullPage = true } = {}) => {
  const broken = await page.evaluate(
    () => [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length
  );

  if (broken) console.warn(`  ${name}: ${broken} broken image(s)`);

  // Sticky elements (header, product gallery) are drawn where the viewport is: start a full-page capture at the top.
  if (fullPage) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
  }

  // Palette PNG: a full-page capture of a photo-heavy page is several times smaller, with no visible difference.
  const png = await page.screenshot({ fullPage, animations: 'disabled' });

  await sharp(png).png({ palette: true, quality: 90, effort: 8 }).toFile(join(OUT_DIR, `${name}.png`));
  saved.push(name);
  console.log(`  ${name}.png`);
};

const open = async (page: Page, path: string) => {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await settle(page);
};

/** The slug of the first product on the catalogue page (works with any data, not just the seed). */
const firstProductPath = async (page: Page): Promise<string> => {
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle', timeout: 120_000 });

  const href = await page.locator('a[href^="/products/"]').first().getAttribute('href');

  if (!href) throw new Error('No product found on /products. Run `pnpm assets:ingest` first.');

  return href;
};

/** Pick the last option of every option group, so the screenshot shows a non-default configuration. */
const configure = async (page: Page) => {
  await page.locator('input[name="width"]').fill('320');
  await page.locator('input[name="height"]').fill('270');

  const groups = page.locator('[data-testid="configurator"] [role="radiogroup"]');

  for (let index = 0; index < (await groups.count()); index += 1) {
    await groups.nth(index).locator('[role="radio"]').last().click();
  }

  await page.locator('[data-testid="configurator"] button[aria-label]').last().click(); // quantity + 1
  await page.waitForTimeout(200);
};

const fillCheckout = async (page: Page, name: string) => {
  await page.locator('input[name="customerName"]').fill(name);
  await page.locator('input[name="customerPhone"]').fill('0912 345 678');
  await page.locator('input[name="customerAddress"]').fill('123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng');
  await page.locator('textarea[name="notes"]').fill('Đơn thử nghiệm từ script chụp màn hình. Vui lòng bỏ qua.');
};

const storefront = async (browser: Browser) => {
  console.log('Storefront (desktop)');

  const context = await browser.newContext({ ...DESKTOP, locale: 'vi-VN' });
  const page = await context.newPage();

  await open(page, '/');
  await shot(page, '01-home-desktop');

  await open(page, '/products');
  await shot(page, '03-products-desktop');

  const productPath = await firstProductPath(page);

  await open(page, productPath);
  await configure(page);
  await shot(page, '04-configurator-desktop');

  await page.locator('[data-testid="configurator"] button', { hasText: /giỏ hàng|cart/i }).click();
  await page.locator('[data-testid="cart-drawer"]').waitFor();
  await settle(page);
  await shot(page, '06-cart-drawer', { fullPage: false });

  await page.locator('[data-testid="cart-drawer"] button', { hasText: /báo giá|quote/i }).click();
  await page.locator('input[name="customerName"]').waitFor();
  await fillCheckout(page, 'Khách thử nghiệm (Zalo)');
  await page.waitForTimeout(400);
  await shot(page, '07-checkout-modal-zalo-cta', { fullPage: false });

  if (SUBMIT) {
    // The Zalo button opens zalo.me in a new tab with the order text prefilled: record the link, close the tab.
    const [popup] = await Promise.all([
      context.waitForEvent('page', { timeout: 15_000 }).catch(() => null),
      page.locator(`${DIALOG} button`, { hasText: /Zalo/ }).click(),
    ]);

    if (popup) {
      console.log(`  Zalo link opened: ${popup.url().slice(0, 90)}...`);
      await popup.close();
    }

    await page.locator('[data-testid="checkout-success"]').waitFor({ timeout: 30_000 });
    await shot(page, '08-checkout-success-zalo', { fullPage: false });
  }

  await page.keyboard.press('Escape');

  if (SUBMIT) {
    // Second lead through the other button: saved to the inbox and announced by email.
    await open(page, productPath);
    await page.locator('[data-testid="configurator"] button', { hasText: /giỏ hàng|cart/i }).click();
    await page.locator('[data-testid="cart-drawer"]').waitFor();
    await page.keyboard.press('Escape');
  }

  await open(page, '/cart');
  await shot(page, '09-cart-page');

  if (SUBMIT) {
    await page.locator('main button', { hasText: /báo giá|quote/i }).click();
    await page.locator('input[name="customerName"]').waitFor();
    await fillCheckout(page, 'Khách thử nghiệm (khảo sát)');
    await page.locator(`${DIALOG} button`, { hasText: /khảo sát|survey/i }).click();
    await page.locator('[data-testid="checkout-success"]').waitFor({ timeout: 30_000 });
    await shot(page, '10-checkout-success-survey', { fullPage: false });
    await page.keyboard.press('Escape');
  }

  await open(page, '/lookbook');
  await shot(page, '11-lookbook-desktop');
  await page.locator('main ul button').first().click();
  await page.locator(DIALOG).last().waitFor();
  await settle(page);
  await shot(page, '12-lookbook-photo-with-products', { fullPage: false });
  await page.keyboard.press('Escape');

  await open(page, '/blog');
  await shot(page, '13-guides-desktop');

  const postPath = await page.locator('a[href^="/blog/"]').first().getAttribute('href');

  if (postPath) {
    await open(page, postPath);
    await shot(page, '14-guide-article');
  }

  await context.close();

  console.log('Storefront (mobile)');

  const mobile = await browser.newContext({ ...MOBILE, locale: 'vi-VN' });
  const phone = await mobile.newPage();

  await open(phone, '/');
  await shot(phone, '02-home-mobile');
  await open(phone, productPath);
  await configure(phone);
  await shot(phone, '05-configurator-mobile');
  await open(phone, '/lookbook');
  await shot(phone, '15-lookbook-mobile');
  await mobile.close();
};

const signIn = async (context: BrowserContext): Promise<Page> => {
  const page = await context.newPage();

  await open(page, '/admin/login');
  await shot(page, '16-admin-login', { fullPage: false });
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL ?? '');
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD ?? '');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => url.pathname.endsWith('/admin'), { timeout: 60_000 });

  return page;
};

const admin = async (browser: Browser) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('Admin: skipped (set ADMIN_EMAIL and ADMIN_PASSWORD)');

    return;
  }

  console.log('Admin');

  const context = await browser.newContext({ ...DESKTOP, locale: 'vi-VN' });
  const page = await signIn(context);
  const ready = async () => {
    await page.setViewportSize(DESKTOP.viewport);
    await page.waitForLoadState('networkidle');
    await page.locator('[aria-busy="true"]').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => undefined);
    await settle(page);
    await fitViewportToContent(page);
  };

  await ready();
  await shot(page, '17-admin-dashboard');

  await open(page, '/admin/products');
  await ready();
  await shot(page, '18-admin-products');

  const editPath = await page.locator('a[href^="/admin/products/"]:not([href$="/new"])').first().getAttribute('href');

  if (editPath) {
    await open(page, editPath);
    await ready();
    await shot(page, '19-admin-product-edit');
  }

  await open(page, '/admin/quotes');
  await ready();
  await shot(page, '20-admin-quotes');

  const view = page.locator('[data-testid="quote-view"]').first();

  if (await view.count()) {
    await view.click();
    await page.locator(DIALOG).last().waitFor();
    await settle(page);
    await shot(page, '21-admin-quote-detail', { fullPage: false });
    await page.keyboard.press('Escape');
  }

  await open(page, '/admin/lookbooks');
  await ready();
  await shot(page, '22-admin-lookbooks');

  await open(page, '/admin/posts');
  await ready();
  await shot(page, '23-admin-guides');

  await open(page, '/admin/settings');
  await ready();
  await shot(page, '24-admin-settings');

  await context.close();
};

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

try {
  await storefront(browser);
  await admin(browser);
  console.log(`\n${saved.length} screenshots saved to docs/screenshots/`);
} finally {
  await browser.close();
}
