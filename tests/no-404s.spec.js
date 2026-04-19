const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765';

const PAGES = [
  '/',
  '/projects/air-con-remote/',
  '/projects/keepsake/',
  '/projects/logbook/',
  '/projects/micrograd/',
  '/projects/moodletips/',
  '/projects/avalon-ai/',
];

// ── No 404s or console errors on any page ────────────────────────────────────

for (const path of PAGES) {
  test(`no 404s or errors on ${path}`, async ({ page }) => {
    const failures = [];

    page.on('response', response => {
      // Only check local resources — third-party embeds (GitHub cards, CDNs) may be unavailable in CI
      if (response.status() >= 400 && response.url().includes('localhost')) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');

    expect(failures, `Failed resources:\n${failures.join('\n')}`).toHaveLength(0);
  });
}

// ── Favicon present on all pages ─────────────────────────────────────────────

for (const path of PAGES) {
  test(`favicon is set on ${path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`);
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).toBeTruthy();
    expect(favicon).toContain('favicon.png');
  });
}

// ── Navbar brand present and correct on all pages ─────────────────────────────

for (const path of PAGES) {
  test(`navbar brand on ${path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`);
    const brand = page.locator('.navbar-brand');
    await expect(brand).toBeVisible();
    // Flaming K logo image
    const logo = brand.locator('img.brand-logo');
    await expect(logo).toBeVisible();
    // Full brand text includes "ristian Ringer" (may be split across spans)
    await expect(brand).toContainText('ristian');
    await expect(brand).toContainText('Ringer');
  });
}

// ── Landing page specific ─────────────────────────────────────────────────────

test('landing page: hero has avatar and typed subtitle', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  await expect(page.locator('.hero-avatar')).toBeVisible();
  await expect(page.locator('.hero-name')).toHaveText('Kristian Ringer');
  await expect(page.locator('#typed-subtitle')).toBeVisible();
});

test('landing page: about section has correct title and company', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  await expect(page.locator('.about-designation')).toHaveText('Tech Lead');
  await expect(page.locator('.about-company a')).toHaveText('NSW Department of Education');
});

test('landing page: skills section has AI & Agents as first card', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const firstSkill = page.locator('.skill-card').first().locator('.skill-name');
  await expect(firstSkill).toHaveText('AI & Agents');
});

test('landing page: projects grid renders project cards', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const projects = page.locator('.project-card');
  await expect(projects.first()).toBeVisible();
  expect(await projects.count()).toBeGreaterThan(0);
});

test('landing page: work experience has NSW DoE entry', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const companies = page.locator('.timeline-company a');
  await expect(companies.first()).toHaveText('NSW Department of Education');
});

test('landing page: LinkedIn link has correct href', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const linkedin = page.locator('a[href*="linkedin.com/in/kristian-ringer"]').first();
  await expect(linkedin).toBeVisible();
});

// ── Navbar consistency: all pages match landing page ─────────────────────────

test('all pages have identical navbar nav links', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const landingLinks = await page.locator('.navbar-nav a:not(.theme-opt)').allTextContents();

  for (const path of PAGES.slice(1)) {
    await page.goto(`${BASE_URL}${path}`);
    const links = await page.locator('.navbar-nav a:not(.theme-opt)').allTextContents();
    expect(links, `Navbar links on ${path} don't match landing page`).toEqual(landingLinks);
  }
});

test('all pages have theme switcher', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(`${BASE_URL}${path}`);
    await expect(page.locator('.theme-switcher'), `Missing theme switcher on ${path}`).toBeVisible();
  }
});

// ── Project pages: hero and author avatar ─────────────────────────────────────

const PROJECT_PAGES = [
  '/projects/air-con-remote/',
  '/projects/keepsake/',
  '/projects/logbook/',
  '/projects/micrograd/',
  '/projects/moodletips/',
  '/projects/avalon-ai/',
];

for (const path of PROJECT_PAGES) {
  test(`project page hero on ${path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`);
    await expect(page.locator('.project-hero-title')).toBeVisible();
    await expect(page.locator('.back-link')).toBeVisible();
  });
}

// ── Bug regression tests ──────────────────────────────────────────────────────

// Bug: Footer LinkedIn URL is broken (uses placeholder text instead of real URL)
test('footer LinkedIn link has valid URL (not placeholder text)', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const footerLinkedin = page.locator('footer a[href*="linkedin.com"]');
  await expect(footerLinkedin, 'Footer LinkedIn link is missing or has wrong href').toBeVisible();
  const href = await footerLinkedin.getAttribute('href');
  expect(href, 'LinkedIn URL should not contain apostrophes or spaces').not.toMatch(/['\s]/);
  expect(href, 'LinkedIn URL should point to a real profile path').toMatch(/linkedin\.com\/in\/[a-z0-9_-]+/i);
});

// Bug: All LinkedIn links across the page should use the same valid URL
test('all LinkedIn links use consistent valid URL', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const allLinkedin = page.locator('a[href*="linkedin.com"]');
  const count = await allLinkedin.count();
  expect(count, 'Expected at least one LinkedIn link').toBeGreaterThan(0);
  const hrefs = [];
  for (let i = 0; i < count; i++) {
    hrefs.push(await allLinkedin.nth(i).getAttribute('href'));
  }
  const unique = [...new Set(hrefs)];
  expect(unique, `LinkedIn links are inconsistent: ${hrefs.join(', ')}`).toHaveLength(1);
});

// Bug: micrograd hero image should load without a 404
test('micrograd project hero image loads (no broken img src)', async ({ page }) => {
  const failedResources = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      const url = response.url();
      // Only flag local resources (not third-party embeds like github cards)
      if (url.includes('localhost')) {
        failedResources.push(`${response.status()} ${url}`);
      }
    }
  });
  await page.goto(`${BASE_URL}/projects/micrograd/`);
  await page.waitForLoadState('networkidle');
  expect(failedResources, `Local resources returned errors:\n${failedResources.join('\n')}`).toHaveLength(0);
});

// Bug: logbook and moodletips use absolute /projects/images/... paths that 404 on GitHub Pages
test('logbook page has no images with broken absolute /projects/images/ paths', async ({ page }) => {
  await page.goto(`${BASE_URL}/projects/logbook/`);
  const imgs = page.locator('article img');
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src');
    expect(src, `Image src "${src}" uses a broken absolute /projects/images/ path`).not.toMatch(/^\/projects\/images\//);
  }
});

test('moodletips page has no images with broken absolute /projects/images/ paths', async ({ page }) => {
  await page.goto(`${BASE_URL}/projects/moodletips/`);
  const imgs = page.locator('article img');
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const src = await imgs.nth(i).getAttribute('src');
    expect(src, `Image src "${src}" uses a broken absolute /projects/images/ path`).not.toMatch(/^\/projects\/images\//);
  }
});

// Bug: "eachother" typo in micrograd page (should be "each other")
test('micrograd page has no "eachother" typo', async ({ page }) => {
  await page.goto(`${BASE_URL}/projects/micrograd/`);
  const body = await page.locator('article').textContent();
  expect(body, 'Found typo "eachother" — should be "each other"').not.toMatch(/eachother/i);
});

// Bug: micrograd page should not have unfinished placeholder text
test('micrograd page does not contain "Check back soon" placeholder text', async ({ page }) => {
  await page.goto(`${BASE_URL}/projects/micrograd/`);
  const body = await page.locator('article').textContent();
  expect(body, 'Micrograd page still contains placeholder "Check back soon" text').not.toMatch(/check back soon/i);
});

// ── All links across the site return non-404 responses ────────────────────────

test('all links across the site return non-404 responses', async ({ page, playwright }) => {
  test.setTimeout(120000);
  // Collect all hrefs from all pages
  const allHrefs = new Set();
  for (const path of PAGES) {
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');
    const hrefs = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => el.getAttribute('href'))
    );
    for (const href of hrefs) {
      if (!href) continue;
      try {
        const resolved = new URL(href, `${BASE_URL}${path}`).href;
        allHrefs.add(resolved);
      } catch {
        // ignore malformed hrefs
      }
    }
  }

  // Normalise and deduplicate URLs
  const toCheck = new Set();
  for (const url of allHrefs) {
    if (!url.startsWith('http')) continue;
    const urlObj = new URL(url);
    // Strip fragment
    urlObj.hash = '';
    // Normalise trailing index.html
    if (urlObj.pathname.endsWith('/index.html')) {
      urlObj.pathname = urlObj.pathname.replace(/index\.html$/, '');
    }
    toCheck.add(urlObj.href);
  }

  // Use a dedicated API request context so it isn't tied to the page lifecycle
  const requestContext = await playwright.request.newContext();
  const broken = [];
  try {
    for (const url of toCheck) {
      try {
        const response = await requestContext.head(url, { timeout: 10000 });
        if (response.status() === 404) {
          broken.push(`404 ${url}`);
        }
      } catch (e) {
        // Only fail on network errors for local URLs — external sites may be
        // unreachable in CI, but a 404 response is always a real failure.
        if (url.includes('localhost')) {
          broken.push(`ERROR ${url}: ${e.message}`);
        }
      }
    }
  } finally {
    await requestContext.dispose();
  }

  expect(broken, `Broken links found:\n${broken.join('\n')}`).toHaveLength(0);
});
