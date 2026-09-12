# 링크 미리보기 이미지(og.jpg) 제작 자료

- `original-2026-09-08.jpg` — 처음 만든 이미지. 반지 사진 위에 "저희 결혼했습니다"가 그려져 있었다.
- `make_og.py` — 원본의 글자를 검출해 종이 질감으로 메운 뒤(정규화 컨볼루션 + 은은한 노이즈),
  나눔명조로 새 문구와 혼인일을 그린다. 시안 a("저희 결혼합니다")와 b("저희 두 사람의 결혼을 알려 드립니다")를 만든다.
- `variant-b-long-caption.jpg` — 채택하지 않은 시안 b.
- 2026-09-12에 시안 a를 `client/public/og-v2.jpg`로 적용했다(카카오 이미지 캐시를 피하려고 파일명을 바꿨다). 혼인일 전후 모두 자연스럽도록 시제 없는 문구를 골랐다.

## 재생성

폰트는 저장소에 넣지 않는다. Google Fonts 저장소에서 내려받는다.

```sh
mkdir -p /tmp/og/fonts && cd /tmp/og/fonts
curl -sfLO https://github.com/google/fonts/raw/main/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf
cd /srv/married
docker run --rm -v "$PWD/design/og:/w/og" -v /tmp/og/fonts:/w/fonts -w /w python:3.12-slim \
  sh -c "pip install -q pillow numpy && python og/make_og.py og/original-2026-09-08.jpg og fonts"
cp design/og/og-a.jpg client/public/og-v3.jpg   # 카카오 이미지 캐시 때문에 파일명 버전을 올린다
```

문구·크기·색은 `make_og.py`의 `variants`와 `INK`/`MUTE`에서 바꾼다. 적용할 때는 새 파일명으로 두고
`client/index.html`의 og:image 도 함께 바꾼다. 재빌드 뒤 카카오 캐시 초기화(developers.kakao.com/tool/debugger/sharing)가 필요하다.
