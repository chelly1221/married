# 두 번째 이야기 · 첫 만남

현재 페이지는 2026-09-09 사용자가 제공한 `supplied-sheet.png`를 사용한다.
1296×1056 이미지에 432×352 프레임 9개가 3×3으로 정렬되어 있다.
왼쪽 위부터 가로 방향으로 재생하며, 페이지에서는 260px 너비,
320ms/프레임(2.88초 반복)으로 표시한다.
`prefers-reduced-motion`에서는 첫 프레임에 고정된다.

`prepare.cjs`는 원본 크기를 검증한 뒤 PNG를 그대로 복사하고 WebP를 생성한다.
이미 정렬된 원본이므로 프레임을 자르거나 개별 크기·위치를 조정하지 않는다.
출력은 `client/src/assets/story-02-sprite.png`와 `.webp`다.

재생성 명령(저장소 루트에서 실행):

```sh
docker run --rm --user 0 -v "$PWD:/src" \
  -e NODE_PATH=/home/pptruser/node_modules \
  -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  --entrypoint node ghcr.io/puppeteer/puppeteer:latest \
  /src/design/story-02/prepare.cjs
```

`generated-sheet.png`와 `generation-prompt.txt`는 이전 시안의 제작 기록이며,
현재 페이지의 원본으로 사용하지 않는다.
