// Preserve the supplied, already aligned 3×3 atlas; encode a WebP alternative.
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const input = fs.readFileSync(path.join(__dirname, 'supplied-sheet.png'));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const output = await page.evaluate(async (input) => {
      const image = new Image();
      image.src = `data:image/png;base64,${input}`;
      await image.decode();
      if (image.naturalWidth !== 1296 || image.naturalHeight !== 1056) {
        throw new Error(`Expected a 1296×1056 atlas, got ${image.naturalWidth}×${image.naturalHeight}`);
      }
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const webp = canvas.toDataURL('image/webp', 0.92);
      if (!webp.startsWith('data:image/webp;base64,')) {
        throw new Error('This browser cannot encode WebP');
      }
      return { webp, background: [...ctx.getImageData(0, 0, 1, 1).data] };
    }, input.toString('base64'));
    const assets = path.resolve(__dirname, '../../client/src/assets');
    const files = { png: input, webp: Buffer.from(output.webp.split(',')[1], 'base64') };
    for (const [format, bytes] of Object.entries(files)) {
      const target = path.join(assets, `story-01-sprite.${format}`);
      fs.writeFileSync(`${target}.tmp`, bytes);
      fs.renameSync(`${target}.tmp`, target);
    }
    console.log(JSON.stringify({ dimensions: [1296, 1056], frames: 9, background: output.background,
      bytes: Object.fromEntries(Object.entries(files).map(([format, bytes]) => [format, bytes.length])) }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
