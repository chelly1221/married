import express from 'express';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dataDir = path.join(repoRoot, 'data');
const mediaDir = path.join(dataDir, 'media');
const clientDist = path.join(repoRoot, 'client', 'dist');
const gbFile = path.join(dataDir, 'guestbook.json');

const PORT = process.env.PORT || 3001;
const serveClient =
  process.env.NODE_ENV === 'production' || process.argv.includes('--serve-client');

const NAME_MAX = 40;
const MSG_MAX = 500;
const LIST_MAX = 500; // GET 응답 상한 (저장은 무제한)

fs.mkdirSync(mediaDir, { recursive: true });

// 표시용 날짜는 항상 한국 시간 기준 MM.DD
function kstMMDD(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace('/', '.');
}

// ── 방명록 저장소 ─────────────────────────────────────────────────────────
// 파일 하나(data/guestbook.json). 메모리는 작업용 사본이고, 글이 올라올 때마다 원자적으로
// 교체 저장한다(tmp 에 쓰고 fsync → rename → 디렉터리 fsync). 저장이 끝나야 201 을 돌려준다.
//  - 파일이 없으면 빈 방명록으로 시작한다. 시드는 없다 — 오픈 이후라 데모 글이 되살아나면 안 된다.
//  - 파일이 있는데 읽을 수 없으면(깨짐·권한) 절대 덮어쓰지 않는다. 빈 목록으로 페이지는 살리되
//    등록은 503 으로 막고, 로그를 남긴다. 파일을 고친 뒤 재시작하면 정상으로 돌아온다.
//  - 파일을 손으로 고쳤다면 반드시 재시작할 것 — 메모리 사본이 다음 저장 때 파일을 덮는다.
let entries = [];
let storeBroken = false;
try {
  const parsed = JSON.parse(fs.readFileSync(gbFile, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('guestbook.json is not an array');
  entries = parsed;
} catch (e) {
  if (e.code === 'ENOENT') {
    fs.writeFileSync(gbFile, '[]\n');
  } else {
    storeBroken = true;
    console.error(`guestbook.json unreadable — serving empty, refusing writes until fixed: ${e.message}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// tmp 에 쓰고 fsync 한 뒤 rename — 중간에 죽어도 원본은 온전하고, 성공하면 디스크에 확정돼 있다.
async function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  let fh = null;
  try {
    fh = await fsp.open(tmp, 'w', 0o644);
    await fh.writeFile(data, 'utf8');
    await fh.sync();
    await fh.close();
    fh = null;
    await fsp.rename(tmp, file);
  } catch (e) {
    if (fh) await fh.close().catch(() => {});
    await fsp.unlink(tmp).catch(() => {});
    throw e;
  }
  // rename 이 디렉터리에 반영된 것도 디스크에 내려보낸다(지원 안 하는 FS 도 있어 실패는 무시)
  try {
    const dh = await fsp.open(path.dirname(file), 'r');
    await dh.sync().catch(() => {});
    await dh.close();
  } catch {
    /* ignore */
  }
}

// 하루 한 번 스냅샷 — data/backups/guestbook-YYYY-MM-DD.json (KST 기준, 최근 30일 보관).
// 그날의 첫 저장 직전과 서버 기동 직후에 만든다. 실패해도 본 저장에는 영향을 주지 않는다.
const bakDir = path.join(dataDir, 'backups');
const BACKUP_KEEP = 30;
function kstYMD(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
async function snapshotDaily() {
  const target = path.join(bakDir, `guestbook-${kstYMD(new Date())}.json`);
  try {
    await fsp.access(target);
    return; // 오늘 것은 이미 있다
  } catch {
    /* make it */
  }
  await fsp.mkdir(bakDir, { recursive: true });
  await fsp.copyFile(gbFile, target);
  const stale = (await fsp.readdir(bakDir))
    .filter((n) => /^guestbook-\d{4}-\d{2}-\d{2}\.json$/.test(n))
    .sort()
    .slice(0, -BACKUP_KEEP);
  await Promise.all(stale.map((n) => fsp.unlink(path.join(bakDir, n)).catch(() => {})));
}
const backupQuietly = () => snapshotDaily().catch((e) => console.error('guestbook backup failed:', e));
if (!storeBroken) backupQuietly();

// 쓰기는 promise 체인으로 직렬화한다. 스냅샷은 실제 쓰기 시점의 메모리 상태로 뜨므로, 어느 요청이
// 실패해 롤백되더라도 그 뒤의 쓰기가 파일을 최신 상태로 수렴시킨다. 실패는 재시도 뒤 호출자에게
// 던진다 — 삼키지 않는다. 호출자(POST)는 그 글을 메모리에서 물리고 500 을 돌려준다.
const WRITE_RETRIES = 3;
let writeChain = Promise.resolve();
function persist() {
  const run = writeChain.then(async () => {
    await backupQuietly();
    let lastErr;
    for (let attempt = 1; attempt <= WRITE_RETRIES; attempt++) {
      try {
        await writeAtomic(gbFile, JSON.stringify(entries, null, 2) + '\n');
        return;
      } catch (e) {
        lastErr = e;
        console.error(`guestbook write failed (attempt ${attempt}/${WRITE_RETRIES}):`, e.message);
        if (attempt < WRITE_RETRIES) await sleep(200 * attempt);
      }
    }
    throw lastErr;
  });
  writeChain = run.catch(() => {}); // 한 번 실패해도 체인은 끊기지 않는다
  return run;
}

// 아주 단순한 IP당 등록 제한 — 10분 창에 6건
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 6;
const rate = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const hits = (rate.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  rate.set(ip, hits);
  if (rate.size > 10000) rate.clear(); // 장수 프로세스 대비 조잡한 상한
  return false;
}

const pub = ({ id, name, msg, at }) => ({ id, name, msg, at });

const app = express();
app.set('trust proxy', true); // Caddy 뒤에서 X-Forwarded-For 로 실제 IP 식별
app.use(express.json({ limit: '16kb' }));

app.get('/api/guestbook', (req, res) => {
  res.json({ entries: entries.slice(0, LIST_MAX).map(pub) });
});

app.post('/api/guestbook', async (req, res) => {
  if (storeBroken) return res.status(503).json({ error: 'guestbook storage unavailable' });
  const body = req.body || {};
  const name = String(body.name ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, NAME_MAX);
  const msg = String(body.msg ?? '')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ') // 개행(\n)만 허용
    .trim()
    .slice(0, MSG_MAX);
  if (!name || !msg) return res.status(400).json({ error: 'name and msg required' });
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'too many requests' });

  const now = new Date();
  const entry = {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    msg,
    at: kstMMDD(now),
    createdAt: now.toISOString(),
  };
  entries.unshift(entry);
  try {
    await persist();
  } catch {
    // 디스크에 못 남긴 글은 메모리에서도 물린다 — 재시작 뒤 사라질 글을 화면에 보여주지 않는다
    const i = entries.indexOf(entry);
    if (i >= 0) entries.splice(i, 1);
    return res.status(500).json({ error: 'failed to save' });
  }
  return res.status(201).json(pub(entry));
});

// 실제 사진·배경음악은 data/media/ 에 파일로 드롭 — 재빌드 없이 반영된다.
//   couple.jpg → 본문 사진 (세로 4:5), bgm.mp3 → 배경음악
// 파일이 없으면 클라이언트가 플레이스홀더/버튼 숨김으로 우아하게 처리한다.
app.use(
  '/media',
  express.static(mediaDir, {
    fallthrough: false,
    maxAge: '1h',
    index: false,
    dotfiles: 'ignore',
  }),
);
app.use('/media', (err, req, res, next) => {
  if (err && err.status === 404) return res.status(404).end();
  return next(err);
});

// index.html 은 절대 캐시하지 않는다 — 위챗 내장 브라우저(X5)는 max-age=0 만으로는 재검증하지
// 않고 옛 HTML(=옛 번들)을 계속 쓴다. 해시가 붙은 /assets/* 는 1년 immutable.
const NO_STORE = { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' };
if (serveClient) {
  app.use(
    express.static(clientDist, {
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.html')) {
          res.set(NO_STORE);
        }
      },
    }),
  );
  // SPA fallback — API/미디어 외에는 빌드된 index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/media/')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'), { headers: NO_STORE });
  });
}

app.listen(PORT, () => {
  console.log(`married server listening on :${PORT} (serveClient=${serveClient})`);
});
