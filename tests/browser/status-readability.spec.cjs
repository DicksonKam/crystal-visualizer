const { test, expect } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

for (const viewport of [{width:390,height:844},{width:641,height:480},{width:844,height:390}]) {
    test(`loaded filename and coordinates remain readable at ${viewport.width}×${viewport.height}`, async ({page}, info) => {
        await page.setViewportSize(viewport);
        const content=await fs.readFile(path.resolve(__dirname,'../../examples/xdatcar/H2_vibration.xdatcar'),'utf8');
        const filename='hydrogen_vibration_with_a_long_descriptive_structure_filename.xdatcar';
        await page.locator('#fileInput').setInputFiles({name:filename,mimeType:'text/plain',buffer:Buffer.from(content)});
        await expect(page.locator('#statusText')).toContainText(filename);
        const layout=await page.evaluate(()=>{
            const rectangles=selector=>{
                const range=document.createRange();range.selectNodeContents(document.querySelector(selector));
                return [...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}));
            };
            return {status:rectangles('#statusText'),coordinates:rectangles('#coordInfo'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
        });
        await page.screenshot({path:info.outputPath('status-readability.png')});
        expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
        for(const text of layout.status) {
            expect(text.left).toBeGreaterThanOrEqual(0);
            expect(text.right).toBeLessThanOrEqual(layout.width);
            for(const coordinates of layout.coordinates) {
                const overlaps=text.left<coordinates.right && text.right>coordinates.left && text.top<coordinates.bottom && text.bottom>coordinates.top;
                expect(overlaps,'status text must not paint over coordinates').toBe(false);
            }
        }
    });
}
