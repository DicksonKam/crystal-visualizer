const {test,expect,upload}=require('./fixtures.cjs');
for(const deviceScaleFactor of [1,2])test.describe(`number precedence at display scale ${deviceScaleFactor}`,()=>{
 test.use({deviceScaleFactor});
 test('numbered markers replace indices and clearing restores indices',async({page},info)=>{
  await page.setViewportSize({width:900,height:800});
  await upload(page,'4\nnumber priority\nO 0 0 .1173\nH .7572 0 -.4692\nH -.7572 0 -.4692\nC 2 1 0\n','water-carbon.xyz');
  await page.locator('#showLabels').check();
  for(const n of [1,2,3]){await page.locator('#atomJumpInput').fill(String(n));await page.locator('#atomJumpInput').press('Enter');}
  const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const visible=()=>page.evaluate(()=>structureGroup.children.filter(o=>o.userData.isAtomLabel&&o.visible).map(o=>o.userData.atomIndex));
  await settle();expect(await visible()).toEqual([3]);
  const box=await page.locator('#sidebarDivider').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(450,box.y+box.height/2,{steps:15});
  await page.screenshot({path:info.outputPath('held-resize-numbers.png')});await page.mouse.up();
  expect(await visible()).toEqual([3]);
  await page.locator('[data-mode="edit"]').click();await settle();
  expect(await visible()).toEqual([3]);
  await page.screenshot({path:info.outputPath('preserved-measurement-numbers.png')});
  await page.locator('#clearSelectionBtn').click();await settle();
  expect(await visible()).toEqual([0,1,2,3]);
  await page.screenshot({path:info.outputPath('cleared-indices-restored.png')});
  await page.locator('#atomJumpInput').fill('2');await page.locator('#atomJumpInput').press('Enter');await settle();
  expect(await visible()).toEqual([0,1,2,3]);
 });
});
