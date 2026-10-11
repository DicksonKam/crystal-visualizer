const {test,expect,upload}=require('./fixtures.cjs');
const fs=require('node:fs/promises');const path=require('node:path');
test('default graphene constraint threshold and typed decimals remain fully readable',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1280,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/poscar/graphene_sheet.poscar'),'utf8'),'graphene_sheet.poscar');
 await page.locator('[data-mode="edit"]').click();
 for(const [name,keys] of [['default',[]],['narrow',Array(3).fill('ArrowLeft')],['wide',Array(15).fill('ArrowRight')]]){
  await page.locator('#sidebarDivider').focus();for(const k of keys)await page.keyboard.press(k);
  await page.locator('#fixZThreshold').scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath(name+'.png')});
  const metric=await page.locator('#fixZThreshold').evaluate(o=>{const s=getComputedStyle(o),c=document.createElement('canvas').getContext('2d');c.font=s.font;const unit=o.nextElementSibling.getBoundingClientRect(),b=o.getBoundingClientRect();return{grid:getComputedStyle(o.parentElement).gridTemplateColumns,width:o.getBoundingClientRect().width,display:getComputedStyle(o.parentElement).display,value:o.value,text:c.measureText(o.value).width,available:o.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-18,unitY:unit.y+unit.height/2,fieldY:b.y+b.height/2};});
  expect(metric.text,`${name}: threshold ${metric.value} is cut off`).toBeLessThanOrEqual(metric.available);expect(Math.abs(metric.unitY-metric.fieldY)).toBeLessThan(2);
  await page.locator('#fixZThreshold').fill('10.078234');
 }
});
