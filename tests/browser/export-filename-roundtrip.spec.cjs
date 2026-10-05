const {test,expect}=require('./fixtures.cjs');
const fs=require('node:fs/promises');
const path=require('node:path');

for(const [format,source] of [['xyz','examples/xyz/H2O.xyz'],['poscar','examples/poscar/Al_fcc_cartesian.poscar'],['xdatcar','examples/xdatcar/H2_vibration.xdatcar']]){
    test(`${format} export names remain stable across repeated reopening`,async({page},info)=>{
        await page.evaluate(()=>{
            window.filenameLoadSerial=0;
            const original=loadStructureFromText;
            loadStructureFromText=function(...args){try{return original(...args);}finally{window.filenameLoadSerial++;}};
        });
        const reopen=async(content,filename)=>{
            const serial=await page.evaluate(()=>window.filenameLoadSerial);
            await page.locator('#fileInput').setInputFiles({name:filename,mimeType:'text/plain',buffer:Buffer.from(content)});
            await page.waitForFunction(value=>window.filenameLoadSerial>value,serial);
            await expect(page.locator('#structureInfo')).toContainText(filename);
        };
        let content=await fs.readFile(path.resolve(__dirname,'../..',source),'utf8');
        let filename=`structure_edited_edited.${format}`;
        for(let cycle=0;cycle<3;cycle++){
            await reopen(content,filename);
            const downloadPromise=page.waitForEvent('download');await page.locator('#exportPoscar').click();
            const download=await downloadPromise;
            filename=download.suggestedFilename();content=await fs.readFile(await download.path(),'utf8');
            expect(filename).toBe(`structure_edited.${format}`);
        }
        await reopen(content,`internal_edited_notes.${format}`);
        const internalDownloadPromise=page.waitForEvent('download');await page.locator('#exportPoscar').click();
        expect((await internalDownloadPromise).suggestedFilename()).toBe(`internal_edited_notes_edited.${format}`);
        await page.screenshot({path:info.outputPath('reopened-stable-name.png')});
    });
}
