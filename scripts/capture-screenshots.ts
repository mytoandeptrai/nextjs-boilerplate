/**
 * Capture every screen of the storefront and the admin portal (desktop and phone) into `docs/screenshots/`.
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

/** An optional screen: a missing element is reported and the run goes on with the next screen. */
const optional = async (label: string, run: () => Promise<void>) => {
  try {
    await run();
  } catch (error) {
    console.warn(`  skipped ${label}: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
  }
};

/** The first active product priced per square metre, read with the public key (blinds; the rest are per metre). */
const squareMeterProductPath = async (): Promise<string | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  const response = await fetch(
    `${url}/rest/v1/products?select=slug&pricing_type=eq.square_meter&is_active=eq.true&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  ).catch(() => null);
  const rows = response?.ok ? ((await response.json()) as { slug: string }[]) : [];

  return rows[0] ? `/products/${rows[0].slug}` : null;
};

const addToCart = async (page: Page) => {
  await page.locator('[data-testid="configurator"] button', { hasText: /giỏ hàng|cart/i }).click();
  await page.locator('[data-testid="cart-drawer"]').waitFor();
  await settle(page);
};

const openCheckout = async (page: Page, scope: string) => {
  await page.locator(`${scope} button`, { hasText: /báo giá|quote/i }).click();
  await page.locator('input[name="customerName"]').waitFor();
  await page.waitForTimeout(300);
};

const storefront = async (browser: Browser) => {
  console.log('Storefront (desktop)');

  const context = await browser.newContext({ ...DESKTOP, locale: 'vi-VN' });
  const page = await context.newPage();

  await open(page, '/');
  await shot(page, '01-home-desktop');

  // Empty states first, while the cart of this browser context holds nothing.
  await open(page, '/cart');
  await shot(page, '13-cart-empty');
  await page.locator('[data-testid="cart-button"]').click();
  await page.locator('[data-testid="cart-drawer"]').waitFor();
  await page.waitForTimeout(400);
  await shot(page, '14-cart-drawer-empty', { fullPage: false });
  await page.keyboard.press('Escape');

  await open(page, '/products');
  await shot(page, '02-products-desktop');

  await optional('category filter', async () => {
    const category = await page.locator('a[href*="/products?category="]').first().getAttribute('href');

    await open(page, category!);
    await shot(page, '03-products-category');
  });

  const productPath = await firstProductPath(page);
  const squarePath = await squareMeterProductPath();

  await open(page, productPath);
  await shot(page, '04-product-detail');
  await configure(page);
  await shot(page, '05-configurator-linear-meter');
  await addToCart(page);
  await page.keyboard.press('Escape');

  if (squarePath && squarePath !== productPath) {
    await open(page, squarePath);
    await configure(page);
    await shot(page, '06-configurator-square-meter');
    await addToCart(page);
  } else {
    await page.locator('[data-testid="cart-button"]').click();
    await page.locator('[data-testid="cart-drawer"]').waitFor();
    await settle(page);
  }

  await shot(page, '07-cart-drawer', { fullPage: false });

  await openCheckout(page, '[data-testid="cart-drawer"]');
  // Both buttons validate before anything is sent: an empty form only shows the field errors.
  await page.locator(`${DIALOG} button`, { hasText: /Zalo/ }).click();
  await page.waitForTimeout(500);
  await shot(page, '09-checkout-validation', { fullPage: false });
  await fillCheckout(page, 'Khách thử nghiệm (Zalo)');
  await page.waitForTimeout(400);
  await shot(page, '08-checkout-dialog', { fullPage: false });

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
    await shot(page, '10-checkout-success-zalo', { fullPage: false });
  }

  await page.keyboard.press('Escape');

  if (SUBMIT) {
    // A sent order empties the cart: add a product again for the cart page and the second lead.
    await open(page, productPath);
    await configure(page);
    await addToCart(page);
    await page.keyboard.press('Escape');
  }

  await open(page, '/cart');
  await shot(page, '11-cart-page');

  if (SUBMIT) {
    // Second lead through the other button: saved to the inbox and announced by email.
    await openCheckout(page, 'main');
    await fillCheckout(page, 'Khách thử nghiệm (khảo sát)');
    await page.locator(`${DIALOG} button`, { hasText: /khảo sát|survey/i }).click();
    await page.locator('[data-testid="checkout-success"]').waitFor({ timeout: 30_000 });
    await shot(page, '12-checkout-success-survey', { fullPage: false });
    await page.keyboard.press('Escape');
  }

  await open(page, '/lookbook');
  await shot(page, '15-lookbook');
  await page.locator('main ul button').first().click();
  await page.locator(DIALOG).last().waitFor();
  await settle(page);
  await shot(page, '16-lookbook-photo', { fullPage: false });
  await page.keyboard.press('Escape');

  await open(page, '/blog');
  await shot(page, '17-guides');

  const postPath = await page.locator('a[href^="/blog/"]').first().getAttribute('href');

  if (postPath) {
    await open(page, postPath);
    await shot(page, '18-guide-article');
  }

  await open(page, '/trang-khong-ton-tai');
  await shot(page, '19-not-found');

  await open(page, '/en');
  await shot(page, '20-home-english');
  await open(page, `/en${productPath}`);
  await shot(page, '21-product-english');

  await context.close();

  console.log('Storefront (mobile)');

  const mobile = await browser.newContext({ ...MOBILE, locale: 'vi-VN' });
  const phone = await mobile.newPage();

  await open(phone, '/');
  await shot(phone, '22-home-mobile');

  await optional('mobile menu', async () => {
    await phone.locator('header button[aria-haspopup="dialog"]').first().click();
    await phone.locator(DIALOG).last().waitFor();
    await phone.waitForTimeout(500);
    await shot(phone, '23-menu-mobile', { fullPage: false });
    await phone.keyboard.press('Escape');
  });

  await open(phone, '/products');
  await shot(phone, '24-products-mobile');
  await open(phone, productPath);
  await configure(phone);
  await shot(phone, '25-configurator-mobile');
  await addToCart(phone);
  await shot(phone, '26-cart-drawer-mobile', { fullPage: false });
  await openCheckout(phone, '[data-testid="cart-drawer"]');
  await fillCheckout(phone, 'Khách thử nghiệm');
  await phone.waitForTimeout(400);
  await shot(phone, '27-checkout-dialog-mobile', { fullPage: false });
  await phone.keyboard.press('Escape');
  await open(phone, '/cart');
  await shot(phone, '28-cart-page-mobile');
  await open(phone, '/lookbook');
  await shot(phone, '29-lookbook-mobile');
  await open(phone, '/blog');
  await shot(phone, '30-guides-mobile');

  if (postPath) {
    await open(phone, postPath);
    await shot(phone, '31-guide-article-mobile');
  }

  await mobile.close();
};

const signIn = async (context: BrowserContext): Promise<Page> => {
  const page = await context.newPage();

  await open(page, '/admin/login');
  await shot(page, '32-admin-login', { fullPage: false });

  await optional('login error', async () => {
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL ?? '');
    await page.locator('input[name="password"]').fill('mat-khau-sai');
    await page.locator('button[type="submit"]').click();
    await page.locator('form [role="alert"]').first().waitFor({ timeout: 30_000 });
    await shot(page, '33-admin-login-error', { fullPage: false });
  });

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
  const idle = async (target: Page) => {
    await target.waitForLoadState('networkidle');
    await target.locator('[aria-busy="true"]').waitFor({ state: 'detached', timeout: 30_000 }).catch(() => undefined);
    await settle(target);
  };
  const ready = async () => {
    await page.setViewportSize(DESKTOP.viewport);
    await idle(page);
    await fitViewportToContent(page);
  };
  /** A dialog is centred in the viewport: capture it at the normal desktop size, not the stretched one. */
  const dialogShot = async (name: string) => {
    await page.setViewportSize(DESKTOP.viewport);
    await page.locator(DIALOG).last().waitFor();
    await idle(page);
    await shot(page, name, { fullPage: false });
    await page.keyboard.press('Escape');
    await page.locator(DIALOG).waitFor({ state: 'detached', timeout: 10_000 }).catch(() => undefined);
  };
  const capture = async (path: string, name: string) => {
    await open(page, path);
    await ready();
    await shot(page, name);
  };

  await ready();
  await shot(page, '34-admin-dashboard');

  await capture('/admin/products', '35-admin-products');

  const editPath = await page.locator('a[href^="/admin/products/"]:not([href$="/new"])').first().getAttribute('href');

  await optional('delete confirmation', async () => {
    await page.setViewportSize(DESKTOP.viewport);
    await page.locator('table tbody tr').first().locator('button[aria-haspopup="dialog"]').last().click();
    await dialogShot('38-admin-delete-confirmation'); // closed with Escape: nothing is deleted
  });

  await capture('/admin/products/new', '36-admin-product-new');

  if (editPath) await capture(editPath, '37-admin-product-edit');

  await capture('/admin/quotes', '39-admin-quotes');

  await optional('quote status filter', async () => {
    await page.locator('[role="tablist"] [role="tab"]').nth(1).click();
    await ready();
    await shot(page, '40-admin-quotes-filtered');
    await page.locator('[role="tablist"] [role="tab"]').first().click();
    await ready();
  });

  await optional('quote detail', async () => {
    await page.setViewportSize(DESKTOP.viewport);
    await page.locator('[data-testid="quote-view"]').first().click();
    await dialogShot('41-admin-quote-detail');
  });

  await capture('/admin/lookbooks', '42-admin-lookbooks');

  await optional('lookbook dialogs', async () => {
    await page.setViewportSize(DESKTOP.viewport);
    await page.locator('button:has(svg.lucide-plus)').first().click();
    await dialogShot('43-admin-lookbook-new');
    await page.locator('ul.grid > li').first().locator('button').first().click();
    await dialogShot('44-admin-lookbook-edit');
  });

  await capture('/admin/posts', '45-admin-guides');

  const postEditPath = await page.locator('a[href^="/admin/posts/"]:not([href$="/new"])').first().getAttribute('href');

  await capture('/admin/posts/new', '46-admin-guide-new');

  if (postEditPath) await capture(postEditPath, '47-admin-guide-edit');

  await capture('/admin/settings', '48-admin-settings');

  await capture('/admin/categories', '52-admin-categories');

  await optional('category dialogs', async () => {
    const row = page.locator('[data-testid="category-row"]').first();

    await page.setViewportSize(DESKTOP.viewport);
    await page.locator('button:has(svg.lucide-plus)').first().click();
    await page.locator(`${DIALOG} input[name="title"]`).fill('Rèm sáo nhôm'); // shows the generated slug; not saved
    await dialogShot('53-admin-category-new');
    await row.locator('button').first().click();
    await dialogShot('54-admin-category-edit');
    await row.locator('button[aria-haspopup="dialog"]').last().click();
    await dialogShot('55-admin-category-delete-confirmation'); // closed with Escape: nothing is deleted
  });

  // The same session on a phone: the sidebar collapses into a sheet.
  const mobile = await browser.newContext({ ...MOBILE, locale: 'vi-VN', storageState: await context.storageState() });
  const phone = await mobile.newPage();

  await open(phone, '/admin');
  await idle(phone);
  await shot(phone, '49-admin-dashboard-mobile');

  await optional('admin mobile menu', async () => {
    await phone.locator('[data-sidebar="trigger"]').first().click();
    await phone.locator(DIALOG).last().waitFor();
    await phone.waitForTimeout(500);
    await shot(phone, '50-admin-menu-mobile', { fullPage: false });
  });

  await open(phone, '/admin/quotes');
  await idle(phone);
  await shot(phone, '51-admin-quotes-mobile');

  await open(phone, '/admin/categories');
  await idle(phone);
  await shot(phone, '56-admin-categories-mobile');

  await mobile.close();
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
