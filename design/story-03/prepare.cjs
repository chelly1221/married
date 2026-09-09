// Validate the supplied static atlases and preserve their exact PNG/WebP bytes.
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const files = Object.fromEntries(['png', 'webp'].map(format => [format,
    fs.readFileSync(path.join(__dirname, 'refined', `story-03-sprite-3x3.${format}`))]));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const [format, bytes] of Object.entries(files)) {
      await page.evaluate(async ({ format, input }) => {
        const image = new Image();
        image.src = `data:image/${format};base64,${input}`;
        await image.decode();
        if (image.naturalWidth !== 1296 || image.naturalHeight !== 1056) {
          throw new Error(`Expected a 1296×1056 ${format} atlas, got ${image.naturalWidth}×${image.naturalHeight}`);
        }
      }, { format, input: bytes.toString('base64') });
    }
    const assets = path.resolve(__dirname, '../../client/src/assets');
    for (const [format, bytes] of Object.entries(files)) {
      const target = path.join(assets, `story-03-sprite.${format}`);
      fs.writeFileSync(`${target}.tmp`, bytes);
      fs.renameSync(`${target}.tmp`, target);
    }
    console.log(JSON.stringify({ dimensions: [1296, 1056], frames: 9,
      bytes: Object.fromEntries(Object.entries(files).map(([format, bytes]) => [format, bytes.length])) }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
