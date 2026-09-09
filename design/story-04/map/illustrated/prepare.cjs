// Resize and encode the approved map painting; keep the complete composition.
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');
(async () => {
  const input = fs.readFileSync(path.join(__dirname,'generated-map.png')).toString('base64');
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox']});
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(async input => {
      const image = new Image(); image.src = `data:image/png;base64,${input}`; await image.decode();
      if (Math.abs(image.naturalWidth / image.naturalHeight - 27 / 22) > .01) throw new Error('Unexpected map aspect ratio');
      const canvas = document.createElement('canvas'); canvas.width=864; canvas.height=704;
      const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,0,0,864,704);
      return {source:[image.naturalWidth,image.naturalHeight],png:canvas.toDataURL('image/png'),webp:canvas.toDataURL('image/webp',.94)};
    },input);
    if (!result.webp.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding unavailable');
    for (const ext of ['png','webp']) {
      const target=path.join(__dirname, '../../../../client/src/assets', `story-04-map-illustrated.${ext}`);
      fs.writeFileSync(`${target}.tmp`,Buffer.from(result[ext].split(',')[1],'base64'));
      fs.renameSync(`${target}.tmp`,target);
    }
    fs.writeFileSync(path.join(__dirname,'layout.json'),JSON.stringify({source:result.source,output:[864,704],crop:false},null,2)+'\n');
    console.log('Saved full-composition 864×704 PNG and WebP map assets.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
