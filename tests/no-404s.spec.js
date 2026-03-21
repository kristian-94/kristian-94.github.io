const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765';

const PAGES = [
  '/',
  '/projects/air-con-remote/',
  '/projects/logbook/',
  '/projects/micrograd/',
  '/projects/moodletips/',
];

// ── No 404s or console errors on any page ────────────────────────────────────

for (const path of PAGES) {
  test(`no 404s or errors on ${path}`, async ({ page }) => {
    const failures = [];

    page.on('response', response => {
      if (response.status() >= 400) {
        failures.push(`${response.status()} ${response.url()}`);
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        failures.push(`Console error: ${msg.text()}`);
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
    // Text reads "ristian Ringer"
    const text = brand.locator('.brand-text');
    await expect(text).toHaveText('ristian Ringer');
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

test('landing page: projects grid has Avalon AI first', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const firstProject = page.locator('.project-card').first().locator('.project-name');
  await expect(firstProject).toHaveText('Avalon AI');
});

test('landing page: work experience has NSW DoE entry', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const companies = page.locator('.timeline-company a');
  await expect(companies.first()).toHaveText('NSW Department of Education');
});

test('landing page: LinkedIn link has correct href', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
  const linkedin = page.locator('a[href*="linkedin.com/in/kristian-ringer"]');
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
  '/projects/logbook/',
  '/projects/micrograd/',
  '/projects/moodletips/',
];

for (const path of PROJECT_PAGES) {
  test(`project page hero and author on ${path}`, async ({ page }) => {
    await page.goto(`${BASE_URL}${path}`);
    await expect(page.locator('.project-hero-title')).toBeVisible();
    await expect(page.locator('.project-hero-author img')).toBeVisible();
    await expect(page.locator('.project-hero-author span')).toHaveText('Kristian Ringer');
    await expect(page.locator('.back-link')).toBeVisible();
  });
}
