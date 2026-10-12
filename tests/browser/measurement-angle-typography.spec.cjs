const { test, expect, upload } = require('./fixtures.cjs');

for (const angle of [90,109.5,175]) test(`ordinary ${angle} degree captions retain comparable text size`, async ({page}, info) => {
    if (process.env.CRYSTAL_CAPTION_CANDIDATE) {
        await page.route('**/app.js?*', route => route.fulfill({path:process.env.CRYSTAL_CAPTION_CANDIDATE,contentType:'text/javascript'}));
        await page.reload();
    }
    const radians=angle*Math.PI/180;
    await upload(page, `3\nordinary angle caption\nC -1 0 0\nC 0 0 0\nC ${-Math.cos(radians)} ${Math.sin(radians)} 0\n`, 'angle.xyz');
    for(const n of [1,2,3]) { await page.locator('#atomJumpInput').fill(String(n)); await page.locator('#atomJumpInput').press('Enter'); }
    await page.evaluate(()=>{
        const pose=cameraMath.fit(getStructureBounds(),cameraMath.orientation([0,0,1],[0,1,0]),perspectiveCamera.aspect);
        cameraController.setPose({...pose,zoom:pose.zoom*.12},'fit'); requestRender();
    });
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.screenshot({path:info.outputPath('caption-comparison.png')});
    const sizes=await page.evaluate(angle=>measurementGroup.children.filter(s=>s.userData.isMeasurementLabel).map((s,index)=>{
        const canvas=s.material.map.image,ctx=canvas.getContext('2d');
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        // Compare numeric glyphs, excluding Å's accent and the raised degree
        // symbol; those units naturally have different ink bounds.
        const text=index===2 ? `${angle.toFixed(1)}°` : '1.000 Å';
        const numeric=index===2 ? text.slice(0,-1) : '1.000';
        const left=Math.floor(canvas.width/2-ctx.measureText(text).width/2);
        const right=Math.ceil(left+ctx.measureText(numeric).width);
        let low=canvas.height,high=-1;
        for(let y=0;y<canvas.height;y++)for(let x=Math.max(0,left);x<Math.min(canvas.width,right);x++){
            const i=(y*canvas.width+x)*4;
            if(data[i]>220&&data[i+1]>220&&data[i+2]>220&&data[i+3]>220){low=Math.min(low,y);high=Math.max(high,y);}
        }
        const cssHeight=s.scale.y/getAnnotationWorldPerPixel(s.getWorldPosition(new THREE.Vector3()),renderer.domElement.clientHeight);
        return {font:ctx.font,fontPixels:parseFloat(ctx.font.match(/([0-9.]+)px/)[1]),inkCSS:cssHeight*(high-low+1)/canvas.height,canvas:[canvas.width,canvas.height]};
    }),angle);
    await info.attach('rendered-text-sizes',{body:JSON.stringify(sizes),contentType:'application/json'});
    expect(sizes).toHaveLength(3);
    expect(sizes[2].fontPixels).toBeGreaterThanOrEqual(sizes[0].fontPixels-1);
    expect(sizes[2].inkCSS).toBeGreaterThanOrEqual(sizes[0].inkCSS-1.5);
});
