"""og.jpg 재생성: 원본의 '저희 결혼했습니다' 글자를 지우고 시제 없는 문구와 날짜를 그린다."""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

src, out_dir, fonts = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB')
W, H = im.size
arr = np.asarray(im).astype(np.float32)

# 1) 기존 글자 검출: 상단 가운데 영역에서 어두운 픽셀
lum = arr @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
region = np.zeros((H, W), bool)
region[125:228, 325:895] = True
sat = arr.max(-1) - arr.min(-1)  # 잎·꽃술은 채도가 있어 제외하고 회색 글자만 잡는다
text = (lum < 200) & (sat < 45) & region
ys, xs = np.where(text)
print('text bbox', xs.min(), ys.min(), xs.max(), ys.max())

# 2) 마스크 팽창 후 정규화 컨볼루션으로 종이 질감 채우기
mask = Image.fromarray((text * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
m = np.asarray(mask).astype(np.float32) / 255.0
keep = 1.0 - m
def blur(a, r):
    # float 배열용 분리형 가우시안 블러 (PIL GaussianBlur는 'F' 모드를 지원하지 않는다)
    n = int(np.ceil(3 * r))
    k = np.arange(-n, n + 1, dtype=np.float32)
    k = np.exp(-(k ** 2) / (2 * r * r)); k /= k.sum()
    pad = len(k) // 2
    a = np.pad(a, pad, mode='edge')
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode='valid'), 1, a)
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode='valid'), 0, a)
    return a.astype(np.float32)
filled = arr.copy()
for r in (6, 14, 30):  # 작은 반경부터 채워 남은 구멍은 큰 반경으로
    num = np.stack([blur((filled[..., c] * keep).astype(np.float32), r) for c in range(3)], -1)
    den = blur(keep.astype(np.float32), r)[..., None]
    ok = den[..., 0] > 0.05
    est = np.where(ok[..., None], num / np.maximum(den, 1e-3), filled)
    filled = np.where(m[..., None] > 0, est, filled)
# 채운 부분에 은은한 종이 노이즈를 더해 평평해 보이지 않게 한다
rng = np.random.default_rng(7)
noise = blur(rng.normal(0, 3.2, (H, W)).astype(np.float32), 0.8)
filled = filled + (noise[..., None] * m[..., None])
clean = Image.fromarray(np.clip(filled, 0, 255).astype(np.uint8))
clean.save(f'{out_dir}/clean.png')

INK = (74, 69, 61)      # tokens.ink70
MUTE = (138, 129, 114)  # tokens.caption

def draw_text(img, text, font, y_center, color, tracking=0):
    d = ImageDraw.Draw(img)
    widths = [d.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (W - total) / 2
    bbox = font.getbbox('한')  # 글자 높이 기준으로 세로 중앙
    yh = (bbox[1] + bbox[3]) / 2
    for ch, w in zip(text, widths):
        d.text((x, y_center - yh), ch, font=font, fill=color)
        x += w + tracking

variants = {
    'a': ('저희 결혼합니다', 74, 6),
    'b': ('저희 두 사람의 결혼을 알려 드립니다', 50, 3),
}
for key, (msg, size, tr) in variants.items():
    img = clean.copy()
    main = ImageFont.truetype(f'{fonts}/NanumMyeongjo-Regular.ttf', size)
    draw_text(img, msg, main, 172, INK, tracking=tr)
    date = ImageFont.truetype(f'{fonts}/NanumMyeongjo-Regular.ttf', 24)
    draw_text(img, '2026. 09. 18', date, 236, MUTE, tracking=5)
    img.save(f'{out_dir}/og-{key}.jpg', quality=90, subsampling=0, optimize=True)
    print('wrote', key)
