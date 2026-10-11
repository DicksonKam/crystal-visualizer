const { test, expect, upload } = require('./fixtures.cjs');
const fs = require('node:fs/promises');
const path = require('node:path');

test('ordinary atom numbers cannot paint over a nearer atom after rotation', async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width:1280, height:800 });
    await upload(page, await fs.readFile(path.join(__dirname,'../../examples/poscar/NaCl_rocksalt.poscar'),'utf8'), 'NaCl_rocksalt.poscar');
    await page.locator('#showLabels').check();
    await page.locator('#atomScale').focus();
    for(let i=0;i<6;i++) await page.keyboard.press('ArrowRight');
    await page.locator('#resetView').click();
    await page.waitForTimeout(400);
    const rect=await page.locator('canvas[aria-label^="3D structure"]').boundingBox();
    // Start with a known overlap. Bounded label sizes no longer guarantee
    // that every arbitrary rotation has an occluded glyph rectangle.
    await page.evaluate(()=>{
        cameraController.setPose(cameraMath.fit(getStructureBounds(),cameraMath.orientation([0,0,1],[0,1,0]),perspectiveCamera.aspect),'fit');
        clearManualCameraMotion();requestRender();
    });
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    let totalOccludedPixels=0;
    for(let view=0;view<8;view++) {
    for(let i=0;i<(view===0?0:2);i++) {
        const x=rect.x+rect.width*.85,y=rect.y+rect.height*.15;
        await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+15,y+35,{steps:8});await page.mouse.up();await page.waitForTimeout(250);
    }
    await page.screenshot({path:info.outputPath(`rotated-atom-numbers-${view}.png`)});
    const result=await page.evaluate(()=>{
        const labels=structureGroup.children.filter(o=>o.userData.isAtomLabel);
        const original=labels.map(o=>o.visible);
        const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
        const renderSize=renderer.getSize(new THREE.Vector2());
        camera.updateWorldMatrix(true,false);structureGroup.updateWorldMatrix(true,true);
        const draw=()=>{renderer.setViewport(0,0,renderSize.x,renderSize.y);renderer.render(scene,camera);const bytes=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return bytes;};
        labels.forEach(o=>o.visible=false);const plain=draw();
        const ray=new THREE.Raycaster(),point=new THREE.Vector3(),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
        let occludedPixels=0,paintedOccludedPixels=0,visibleNumberPixels=0;
        for(const label of labels){
            label.getWorldPosition(point);const center=point.clone().project(camera);const edge=point.clone().addScaledVector(right,label.scale.x/2).project(camera);
            const cx=(center.x+1)*w/2,cy=(1-center.y)*h/2,r=Math.ceil(Math.abs(edge.x-center.x)*w/2);
            label.visible=true;const numbered=draw();label.visible=false;
            for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(h,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(w,Math.ceil(cx+r));x++){
                ray.setFromCamera(new THREE.Vector2((x+.5)/w*2-1,1-(y+.5)/h*2),camera);
                const hit=ray.intersectObjects(atomMeshes,false)[0];if(!hit)continue;
                let nearer=hit.object.userData.atomIndex!==label.userData.atomIndex && hit.distance+1e-4 < point.clone().sub(ray.ray.origin).dot(ray.ray.direction);
                // Ignore the two-pixel antialias fringe: only count pixels fully inside
                // the nearer atom, where every neighboring ray is also occluded.
                if(nearer) for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]]) {
                    ray.setFromCamera(new THREE.Vector2((x+.5+dx)/w*2-1,1-(y+.5+dy)/h*2),camera);
                    const adjacent=ray.intersectObjects(atomMeshes,false)[0];
                    if(!adjacent || adjacent.object!==hit.object || adjacent.distance+1e-4 >= point.clone().sub(ray.ray.origin).dot(ray.ray.direction)) {nearer=false;break;}
                }
                const offset=((h-1-y)*w+x)*4;
                const changed=Math.abs(numbered[offset]-plain[offset])+Math.abs(numbered[offset+1]-plain[offset+1])+Math.abs(numbered[offset+2]-plain[offset+2])>6;
                if(nearer){occludedPixels++;if(changed)paintedOccludedPixels++;}else if(changed)visibleNumberPixels++;
            }
        }
        labels.forEach((o,i)=>o.visible=original[i]);requestRender();
        return{occludedPixels,paintedOccludedPixels,visibleNumberPixels};
    });
    await info.attach(`rendered-label-occlusion-${view}`,{body:JSON.stringify(result),contentType:'application/json'});
    totalOccludedPixels+=result.occludedPixels;
    expect(result.visibleNumberPixels).toBeGreaterThan(20);
    expect(result.paintedOccludedPixels).toBe(0);
    }
    expect(totalOccludedPixels).toBeGreaterThan(0);
});
