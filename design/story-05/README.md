# 다섯 번째 이야기 · 한집에서

2026-09-09 내장 image_gen으로 제작한 9프레임 삽화다.
집에서 낮은 나무 탁자 뒤에 나란히 앉은 두 사람과 찻잔 두 개를 담았다.
서로 바라보기, 작은 미소와 눈 깜박임으로 함께하는 일상을 표현한다.

생성 원본은 `generated-sheet.png`(1390×1132), 정확한 생성 프롬프트는 `generation-prompt.txt`에 보관한다.
`client/src/assets/story-01-sprite.png`는 인물과 화풍 참고로 사용했으며, 참고 원본은 수정하지 않았다.

`prepare.cjs`는 공용 `../prepare-story-sprite.cjs`를 호출한다.
공용 스크립트는 원본의 3×3 셀에서 어두운 삽화 영역을 검출하고, 아홉 프레임에 하나의 공통 배율을 적용한다.
각 프레임의 중심과 바닥선을 맞춰 생성된 원본의 불균일한 여백을 정리하며, 그림을 다시 그리지 않는다.
출력은 `client/src/assets/story-05-sprite.png`와 `.webp`(품질 0.92)다.
원본 크기, 공통 배율과 프레임별 검출 경계는 `layout.json`에 기록한다.

완성 시트는 1296×1056, 3열×3행(프레임 432×352)이며 왼쪽 위부터 가로 방향으로 재생한다.
페이지에서는 기존 `.sprite-3x3`를 사용해 260px 너비로 9프레임 × 320ms(2.88초 반복) 표시한다.
`prefers-reduced-motion`에서는 첫 프레임에 고정된다.
삽화 Reveal의 `mix-blend-mode: darken`으로 밝은 배경을 페이지 종이색에 맞춘다.

재생성 명령(저장소 루트에서 실행):

```sh
docker run --rm --user 0 -v "$PWD:/src" \
  -e NODE_PATH=/home/pptruser/node_modules \
  -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  --entrypoint node ghcr.io/puppeteer/puppeteer:latest \
  /src/design/story-05/prepare.cjs
```
