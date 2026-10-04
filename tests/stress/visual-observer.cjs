const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { capture } = require('./edit-scenario.cjs');

function createVisualObserver(page, directory, seed, every = 12) {
    const observations = [];
    async function observe(event) {
        if (event.stage === 'after' && event.step % every &&
            !['replace','reset','viewport','panel','playback','display'].includes(event.action)) return null;
        const snapshot = await capture(page);
        assert.deepEqual(snapshot.violations, [], `visual checkpoint ${seed}/${event.step}/${event.stage}`);
        // Layout observation runs after animation-frame callbacks. Allow it to
        // settle before evaluating an image; persistent mismatches still fail.
        await page.waitForFunction(() => {
            const rect = renderer.domElement.getBoundingClientRect();
            return rect.width === viewport.clientWidth && rect.height === viewport.clientHeight;
        }, null, { timeout: 2000 });
        const metrics = await page.evaluate(() => new Promise((resolve, reject) => {
            const original = renderer.render;
            const timeout = setTimeout(() => { renderer.render = original; reject(new Error('No scene render at visual checkpoint')); }, 5000);
            renderer.render = function(subject, view) {
                const result = original.call(this, subject, view);
                if (subject !== scene) return result;
                renderer.render = original; clearTimeout(timeout);
                const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
                const pixels = new Uint8Array(w*h*4); gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
                let content=0, cyan=0, transparent=0, checksum=0, nonBackground=0;
                const clear=Array.from(gl.getParameter(gl.COLOR_CLEAR_VALUE)).map(v=>Math.round(v*255));
                for(let i=0;i<pixels.length;i+=4) {
                    const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
                    if(Math.abs(r-clear[0])>1||Math.abs(g-clear[1])>1||Math.abs(b-clear[2])>1)nonBackground++;
                    if(Math.max(r,g,b)>40)content++;
                    if(g>45&&b>45&&r<g*.6)cyan++;
                    if(pixels[i+3]!==255)transparent++;
                    checksum=(checksum+r+g*3+b*7)>>>0;
                }
                const copies=[];
                for(const mesh of atomMeshes) if(mesh.userData.isGhost) {
                    const expected=currentStructure.atoms[mesh.userData.originalIndex].position.clone();
                    ['a','b','c'].forEach((a,i)=>expected.addScaledVector(new THREE.Vector3(...currentStructure.lattice[i]),mesh.userData.cellOffset[a]));
                    if(mesh.position.distanceTo(expected)>1e-8)copies.push(mesh.userData.atomIndex);
                }
                const rect=renderer.domElement.getBoundingClientRect();
                const panel=document.querySelector('.sidebar');
                const panelLayout={collapsed:panel.inert,left:panel.scrollLeft,width:panel.clientWidth,content:panel.scrollWidth};
                const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
                let maxAtomRadiusPixels=0;
                for(const mesh of atomMeshes) {
                    if(!mesh.geometry.boundingSphere)mesh.geometry.computeBoundingSphere();
                    const world=mesh.getWorldPosition(new THREE.Vector3());
                    const radius=mesh.geometry.boundingSphere.radius*mesh.scale.x;
                    const center=world.clone().project(camera),edge=world.addScaledVector(right,radius).project(camera);
                    maxAtomRadiusPixels=Math.max(maxAtomRadiusPixels,Math.hypot((edge.x-center.x)*w/2,(edge.y-center.y)*h/2));
                }
                queueMicrotask(()=>resolve({content,cyan,transparent,checksum,nonBackground,maxAtomRadiusPixels,panelLayout,width:w,height:h,
                    canvasCSS:[rect.width,rect.height],viewportCSS:[viewport.clientWidth,viewport.clientHeight],
                    autoClear:renderer.autoClear,scissor:renderer.getScissorTest(),staleCopies:copies,
                    atomCount:currentStructure.atoms.length,showCell:settings.showCell,showBonds:settings.showBonds,
                    phase:cameraController.phase}));
                return result;
            };
            requestRender();
        }));
        assert.equal(metrics.transparent,0,'scene drawing buffer must remain opaque');
        assert.equal(metrics.autoClear,true,'axes must restore clear state');
        assert.equal(metrics.scissor,false,'axes must restore scissor state');
        assert.deepEqual(metrics.canvasCSS,metrics.viewportCSS,'canvas must follow panel/window sizing');
        assert.deepEqual(metrics.staleCopies,[],'periodic copies must follow live geometry');
        if(!metrics.panelLayout.collapsed) {
            assert.equal(metrics.panelLayout.left,0,'panel was scrolled horizontally by an interaction');
            assert.ok(metrics.panelLayout.content<=metrics.panelLayout.width+1,'panel controls overflow their available width');
        }
        if (metrics.atomCount && (event.stage==='initial' || event.action==='reset' || event.action==='replace')) {
            // Subpixel atoms at the explicitly selected minimum size may be
            // imperceptible. Check every pixel rather than a bright-color quota.
            if(metrics.maxAtomRadiusPixels>=1)assert.ok(metrics.nonBackground>0,'fitted structure rendered no visible content');
        }
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const filename=`seed-${seed}-step-${event.step}-${event.action}-${event.stage}.png`;
        await page.screenshot({path:path.join(directory,filename)});
        const record={seed,step:event.step,action:event.action,stage:event.stage,performed:event.performed,filename,metrics};
        observations.push(record);
        await fs.appendFile(path.join(directory,'visual.jsonl'),JSON.stringify(record)+'\n');
        return {filename,metrics};
    }
    return { observe, observations };
}
module.exports={createVisualObserver};
