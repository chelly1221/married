// Pack the generated 3×3 atlas for the site's existing CSS animation.
// A shared scale and per-cell translation align the art without redrawing it.
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

module.exports = async function prepare(chapter) {
  if (!['04', '05'].includes(chapter)) throw new Error('Expected chapter 04 or 05');
  const folder = path.join(__dirname, `story-${chapter}`);
  const input = fs.readFileSync(path.join(folder, 'generated-sheet.png')).toString('base64');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const output = await page.evaluate(async input => {
      const image = new Image();
      image.src = `data:image/png;base64,${input}`;
      await image.decode();
      const source = document.createElement('canvas');
      source.width = image.naturalWidth;
      source.height = image.naturalHeight;
      const ctx = source.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const cells = [];
      for (let frame = 0; frame < 9; frame++) {
        const col = frame % 3, row = Math.floor(frame / 3);
        const x = Math.round(col * source.width / 3), y = Math.round(row * source.height / 3);
        const width = Math.round((col + 1) * source.width / 3) - x;
        const height = Math.round((row + 1) * source.height / 3) - y;
        const data = ctx.getImageData(x, y, width, height).data;
        let left = width, top = height, right = -1, bottom = -1;
        for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
          const offset = (py * width + px) * 4;
          if (data[offset + 3] > 128 && Math.max(data[offset], data[offset + 1], data[offset + 2]) < 175) {
            left = Math.min(left, px); right = Math.max(right, px);
            top = Math.min(top, py); bottom = Math.max(bottom, py);
          }
        }
        if (right < left || bottom < top) throw new Error(`Empty frame ${frame + 1}`);
        cells.push({x,y,width,height,left,top,right,bottom});
      }
      const scale = Math.min(390 / Math.max(...cells.map(c => c.right - c.left + 1)),
        300 / Math.max(...cells.map(c => c.bottom - c.top + 1)));
      const target = document.createElement('canvas');
      target.width = 1296; target.height = 1056;
      const out = target.getContext('2d');
      out.fillStyle = '#f4efe6'; out.fillRect(0, 0, target.width, target.height);
      out.imageSmoothingEnabled = true; out.imageSmoothingQuality = 'high';
      cells.forEach((c, frame) => {
        const col = frame % 3, row = Math.floor(frame / 3);
        out.save();
        out.beginPath(); out.rect(col * 432, row * 352, 432, 352); out.clip();
        out.drawImage(image, c.x, c.y, c.width, c.height,
          col * 432 + 216 - (c.left + c.right + 1) / 2 * scale,
          row * 352 + 328 - (c.bottom + 1) * scale, c.width * scale, c.height * scale);
        out.restore();
      });
      const webp = target.toDataURL('image/webp', 0.92);
      if (!webp.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding unavailable');
      return {png:target.toDataURL('image/png'),webp,source:[source.width,source.height],scale,cells};
    }, input);
    for (const format of ['png', 'webp']) {
      const target = path.join(__dirname, '../client/src/assets', `story-${chapter}-sprite.${format}`);
      fs.writeFileSync(`${target}.tmp`, Buffer.from(output[format].split(',')[1], 'base64'));
      fs.renameSync(`${target}.tmp`, target);
    }
    const metadata = {source:output.source,output:[1296,1056],scale:output.scale,cells:output.cells};
    fs.writeFileSync(path.join(folder, 'layout.json'), JSON.stringify(metadata, null, 2) + '\n');
    console.log(JSON.stringify({chapter,...metadata}));
  } finally {
    await browser.close();
  }
};
