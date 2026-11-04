const { test: base, expect } = require('@playwright/test');

const test = base.extend({
    appSetup: [async ({ page }, use) => {
        // three.js is served from vendor/three; only the web fonts are external, and the app must not need them.
        await page.route('https://fonts.googleapis.com/**', route => route.abort());
        await page.route('https://fonts.gstatic.com/**', route => route.abort());
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('/');
        await expect(page.locator('canvas[aria-label^="3D structure"]')).toBeVisible();
        await use();
        expect(errors).toEqual([]);
    }, { auto: true }]
});

async function upload(page, content, name) {
    await page.locator('#fileInput').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(content) });
    await expect(page.locator('#statusText')).toContainText('Loaded');
}

// A Bond Length of 0 draws no bonds.
async function hideBonds(page) {
    await page.locator('#bondThreshold').fill('0');
}

// Edit is one toggle, so a test sets a mode rather than clicking a mode button.
// Asking for the mode the viewer is already in does nothing, as clicking the
// old Measure or Edit button did.
async function setMode(page, mode) {
    const toggle = page.locator('#editToggle');
    const editing = await toggle.getAttribute('aria-pressed') === 'true';
    if (editing !== (mode === 'edit')) await toggle.click();
}

module.exports = { test, expect, upload, hideBonds, setMode };
