const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765';

const PAGES = [
  '/',
  '/projects/air-con-remote/',
  '/projects/logbook/',
  '/projects/micrograd/',
  '/projects/moodletips/',
];

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

    // Wait for network to settle so all images/css/js have been requested
    await page.waitForLoadState('networkidle');

    expect(failures, `Failed resources:\n${failures.join('\n')}`).toHaveLength(0);
  });
}
