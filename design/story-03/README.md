# 세 번째 이야기 · 하얼빈, 그리고 도쿄

현재 페이지는 2026-09-09 사용자가 제공한 `story-03-web-upload.zip`의 스프라이트를 사용한다.
패키지 내용은 `refined/`에 보관한다. 비행기 좌석에 나란히 앉은 두 사람의 9프레임 장면이다.

`prepare.cjs`는 `refined/story-03-sprite-3x3.png`와 `.webp`의 크기를 검증한 뒤
각 파일을 `client/src/assets/story-03-sprite.png`와 `.webp`로 그대로 복사한다.
프레임을 자르거나 크기·위치를 조정하지 않으며, 제공된 무손실 WebP도 다시 인코딩하지 않는다.

1296×1056, 3×3 시트(프레임 432×352)를 왼쪽 위부터 가로 방향으로 재생한다.
페이지에서는 기존 `.sprite-3x3`를 사용해 260px 너비로 9프레임 × 320ms(2.88초 반복) 표시한다.
`prefers-reduced-motion` 설정에서는 첫 프레임만 표시한다.
밝은 배경은 기존 삽화 Reveal의 `mix-blend-mode: darken`으로 페이지 종이색에 맞춘다.

재생성 명령(저장소 루트):

```sh
docker run --rm --user 0 -v "$PWD:/src" \
  -e NODE_PATH=/home/pptruser/node_modules \
  -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  --entrypoint node ghcr.io/puppeteer/puppeteer:latest \
  /src/design/story-03/prepare.cjs
```

패키지의 `refined/index.html`, `refined/story-03.css`와 애니메이션 WebP/GIF는 미리보기 자료다.
`refined/README.md`, `refined/PROMPTS.md`와 개별 프레임도 제공된 제작 기록으로 보관한다.
페이지는 위의 정적 PNG/WebP 시트를 기존 CSS 애니메이션으로 재생한다.

`generated-sheet.png`와 `generation-prompt.txt`는 이전 시안의 제작 기록이며,
현재 페이지의 원본으로 사용하지 않는다.
