// Normalize the generated drawings into 5×3 atlases; does not synthesize or duplicate frames.
const fs = require('node:fs');
const puppeteer = require('puppeteer');

const scenes = [
  { id: '01', columns: [0, 385, 740, 1095, 1440], rows: [0, 310, 595] },
  { id: '02', columns: [0, 358, 716, 1075, 1433], rows: [0, 300, 580] },
  { id: '03', columns: [0, 435, 780, 1120, 1460], rows: [0, 315, 580] },
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const scene of scenes) {
      const input = fs.readFileSync(`/src/design/story-15/generated-${scene.id}.png`).toString('base64');
      const output = await page.evaluate(async ({ input, scene }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${input}`;
        await image.decode();
        const source = document.createElement('canvas');
        source.width = image.width;
        source.height = image.height;
        const ctx = source.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const target = document.createElement('canvas');
        target.width = 2160;
        target.height = 1056;
        const out = target.getContext('2d');
        out.fillStyle = '#f4efe6';
        out.fillRect(0, 0, target.width, target.height);
        const columns = [...scene.columns, image.width];
        const rows = [...scene.rows, image.height];
        const bounds = [];
        for (let i = 0; i < 15; i++) {
          const col = i % 5, row = Math.floor(i / 5);
          const x = columns[col], y = rows[row];
          const w = columns[col + 1] - x, h = rows[row + 1] - y;
          const data = ctx.getImageData(x, y, w, h).data;
          let left = w, right = 0, top = h, bottom = 0;
          for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
            const offset = (py * w + px) * 4;
            if (Math.max(data[offset], data[offset + 1], data[offset + 2]) < 225) {
              left = Math.min(left, px); right = Math.max(right, px);
              top = Math.min(top, py); bottom = Math.max(bottom, py);
            }
          }
          if (left < 4 || top < 4 || right >= w - 4 || bottom >= h - 4 || left > right) {
            throw new Error(`Scene ${scene.id} frame ${i + 1}: drawing touches crop boundary ${JSON.stringify({left,right,top,bottom,w,h})}`);
          }
          bounds.push({ left, right, top, bottom });
          const sw = right - left + 9, sh = bottom - top + 9;
          const scale = Math.min(370 / sw, 310 / sh);
          const dw = sw * scale, dh = sh * scale;
          out.drawImage(image, x + left - 4, y + top - 4, sw, sh,
            col * 432 + (432 - dw) / 2, row * 352 + 330 - dh, dw, dh);
        }
        return { png: target.toDataURL('image/png'), webp: target.toDataURL('image/webp', 0.9), bounds };
      }, { input, scene });
      for (const format of ['png', 'webp']) {
        fs.writeFileSync(`/src/client/src/assets/story-${scene.id}-sprite-15.${format}`, Buffer.from(output[format].split(',')[1], 'base64'));
      }
      console.log(scene.id, JSON.stringify(output.bounds));
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
