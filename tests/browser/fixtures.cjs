const { test: base, expect } = require('@playwright/test');

const test = base.extend({
    appSetup: [async ({ page }, use) => {
        // Exercise the pinned renderer and controls without depending on CDNs.
        await page.route('https://cdnjs.cloudflare.com/**/three.min.js', route => route.fulfill({ path: require.resolve('three/build/three.min.js'), contentType: 'text/javascript' }));
        await page.route('https://cdn.jsdelivr.net/**/OrbitControls.js', route => route.fulfill({ path: require.resolve('three/examples/js/controls/OrbitControls.js'), contentType: 'text/javascript' }));
        await page.route('https://cdn.jsdelivr.net/**/TrackballControls.js', route => route.fulfill({ path: require.resolve('three/examples/js/controls/TrackballControls.js'), contentType: 'text/javascript' }));
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

module.exports = { test, expect, upload };
