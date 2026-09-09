# 세 장면의 15프레임 애니메이션

> 비교용 시안. 사용자의 선택으로 현재 페이지는 기존 9프레임 버전으로 복원했다.

기존 장면을 참조해 내장 image_gen으로 각각 15프레임을 새로 생성했다.
기존 9프레임을 복제해 늘리지 않았다.

| 장면 | 생성 원본 | 최종 프롬프트 | 페이지 이미지 |
| --- | --- | --- | --- |
| 언어교환 앱 | generated-01.png | prompt-01.txt | ../../client/src/assets/story-01-sprite-15.webp (+ .png) |
| 자전거로 500km | generated-02.png | prompt-02.txt | ../../client/src/assets/story-02-sprite-15.webp (+ .png) |
| 하얼빈, 그리고 도쿄 | generated-03.png | prompt-03.txt | ../../client/src/assets/story-03-sprite-15.webp (+ .png) |

`prepare.cjs`로 각 원본의 불균일한 여백을 정리하고 크기와 바닥 위치를 맞춘다.
완성 시트는 2160×1056, 5열×3행, 프레임당 432×352다.
행 우선으로 15프레임 × 200ms, 3초 반복 재생한다. 프레임을 합성하거나 복제하지 않는다.
페이지 표시 너비는 260px이며 `prefers-reduced-motion`에서는 첫 프레임으로 정지한다.
불투명한 종이색 배경을 `mix-blend-mode: darken`으로 페이지 종이색에 맞춘다.

재생성(저장소 루트):

```sh
docker run --rm --user 0 -v "$PWD:/src" \
  -e NODE_PATH=/home/pptruser/node_modules \
  -e PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
  --entrypoint node ghcr.io/puppeteer/puppeteer:latest \
  /src/design/story-15/prepare.cjs
```

다른 생성 원본을 사용할 때는 `scenes`의 행·열 경계를 다시 확인한다.
기존 9프레임 파일과 제작 기록은 비교용으로 보존한다.
