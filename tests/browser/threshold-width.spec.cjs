const {test,expect,upload,setMode}=require('./fixtures.cjs');
const fs=require('node:fs/promises');const path=require('node:path');
test('typed range bounds remain fully readable and aligned at every panel width',async({page},info)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1280,height:800});
 await upload(page,await fs.readFile(path.join(__dirname,'../../examples/poscar/graphene_sheet.poscar'),'utf8'),'graphene_sheet.poscar');
 await setMode(page, 'edit');
 for(const [name,keys] of [['default',[]],['narrow',Array(3).fill('ArrowLeft')],['wide',Array(15).fill('ArrowRight')]]){
  await page.locator('#sidebarDivider').focus();for(const k of keys)await page.keyboard.press(k);
  await page.locator('#selectRangeMax').fill('-2.75');
  await page.locator('#selectRangeMax').scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath(name+'.png')});
  // clientWidth of a number input already excludes its spin buttons.
  const metric=await page.locator('#selectRangeMax').evaluate(o=>{const s=getComputedStyle(o),c=document.createElement('canvas').getContext('2d');c.font=s.font;const to=o.previousElementSibling.getBoundingClientRect(),b=o.getBoundingClientRect(),min=o.parentElement.querySelector('#selectRangeMin').getBoundingClientRect();return{width:b.width,value:o.value,text:c.measureText(o.value).width,available:o.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),toY:to.y+to.height/2,fieldY:b.y+b.height/2,minWidth:min.width};});
  expect(metric.text,`${name}: bound ${metric.value} is cut off`).toBeLessThanOrEqual(metric.available);
  expect(Math.abs(metric.toY-metric.fieldY)).toBeLessThan(2);
  expect(Math.abs(metric.minWidth-metric.width)).toBeLessThan(2);
 }
});
