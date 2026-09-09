# 네 번째 이야기 · 여러 도시를 오가며

현재 페이지는 `client/src/components/StoryMap.tsx`에서 손그림 지도 배경 위에 SVG 이동 경로를 겹쳐 표시한다.
배경은 `client/src/assets/story-04-map-illustrated.webp`와 `.png` 폴백(864×704)이다.
기존 1·2·3·5장 삽화와 어울리는 따뜻한 연필 윤곽, 수채화 색감과 종이 질감을 사용한다.
국경과 도시 이름을 표시하지 않은 동아시아 지도 위에 적갈색의 포물선 모양 이동 경로가 순차적으로 이어진다.
중국과 한국을 오가는 만남을 표현하는 장식으로, 점과 경로는 실제 방문 도시나 여행 순서를 확정하지 않는다.

SVG는 `viewBox="0 0 432 352"`이며, 배경과 같은 비율로 화면 너비 260px에 표시한다.
`useInView`로 화면 진입을 감지하면 `client/src/index.css`의 `.story-map` 애니메이션을 시작한다.
Q 명령으로 만든 2차 베지어 곡선 네 구간과 도착 지점을 차례로 표시하고, 완성된 경로를 잠시 유지한 뒤
서서히 지우며 9초 주기로 반복한다. `prefers-reduced-motion`에서는 모든 경로가 완성된 상태로 고정된다.
곡선에는 고정된 SVG 노이즈·변위 필터로 미세한 연필 질감을 더한다. 필터 자체는 움직이지 않으며,
기존 순서와 큰 구도는 유지하며, 마지막 도착점은 그려진 해안선에 맞춰 조정했다.
도착 지점은 갈색 테두리와 따뜻한 적갈색 점으로 표시한다.
주변 본문이 의미를 전달하므로 지도에는 `aria-hidden="true"`를 적용한다.

## 손그림 배경 제작 및 재생성

배경은 내장 `image_gen`으로 제작했다. 이동 경로를 제외한 기존 Natural Earth 지도 화면
`map/style-layout-reference.png`를 구도·지형 참고로 사용하고, `client/src/assets/story-01-sprite.png`와
`design/story-05/generated-sheet.png`를 화풍 참고로 사용했다. 인물이나 스프라이트 격자는 지도에 넣지 않았다.

`map/illustrated/generated-map.png`에 생성 원본(1390×1132), `map/illustrated/generation-prompt.txt`에
정확한 최종 프롬프트를 보관한다. 지도 배경에는 이동 경로나 마커를 굽지 않아 기존 SVG 애니메이션을 유지한다.

`map/illustrated/prepare.cjs`는 원본 비율을 확인한 다음 전체 구도를 자르지 않고 864×704로 축소한다.
브라우저 canvas로 PNG와 WebP(품질 0.94)를 인코딩해 `client/src/assets/story-04-map-illustrated.png`와
`.webp`로 저장하며, 원본·출력 크기와 `crop: false`를 `map/illustrated/layout.json`에 기록한다.
Node.js와 Puppeteer 및 실행 가능한 Chromium이 있는 환경에서 저장소 루트 기준으로 실행한다.

```sh
node design/story-04/map/illustrated/prepare.cjs
```

이 명령은 보관된 생성 원본을 인코딩하며, 새 이미지를 생성하지 않는다.

## 기존 해안선 자료 및 출처

구도 참고의 해안선 원본은 Natural Earth 1:110m 육지 데이터인 `map/ne_110m_land.geojson`이다.
[원본 GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson)을
저장소에 보관하며, 이 파일에서 만든 `client/src/assets/story-04-map-land.ts`도 참고·재생성용으로 유지한다.
현재 `StoryMap.tsx`는 해당 TypeScript 해안선 데이터를 직접 불러오지 않는다.
Natural Earth 지도 데이터는 공공 영역으로 공개되어 있다. [Natural Earth 이용 조건](https://www.naturalearthdata.com/about/terms-of-use/)

`map/prepare.py`는 로컬 GeoJSON을 지도 영역에 맞게 자르고 메르카토르 투영을 적용해 TypeScript의
SVG 경로 문자열을 생성한다. Python 3 표준 라이브러리만 사용한다.
재생성 명령은 저장소 루트에서 실행한다.

```sh
python3 design/story-04/map/prepare.py
```

## 이전 시안

이전에 내장 image_gen으로 만든 커플 걷기 삽화는 미사용 시안으로 보관한다.
`generated-sheet.png`, `generated-sheet-v1.png`, `generation-prompt.txt`, `prepare.cjs`, `layout.json`과
`client/src/assets/story-04-sprite.png`·`.webp`는 현재 페이지에서 사용하지 않는다.
당시 `client/src/assets/story-01-sprite.png`와 `design/story-03/refined/frames/story-03-06.png`는
인물·화풍 참고로 사용했으며, 참고 원본은 수정하지 않았다.
