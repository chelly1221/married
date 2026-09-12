# CLAUDE.md

## 프로젝트 목적
결혼식을 따로 진행하지 않는 부부(서상현 · 주정정)가 지인들에게 결혼 사실만 정중히 알리는
모바일 원페이지 랜딩. 예식 안내·오시는 길·축의금 계좌는 의도적으로 없다.
구성: 인사말 / 사진 / 두 사람 소개 / 두 사람의 이야기 / 혼인한 날(캘린더 + D+ 카운터) / 방명록.
4개 언어(KR/EN/JP/CN) 지원 — 신부가 중국분이라 CN이 필수. 모바일·데스크톱에서 자연스러운 문서 스크롤과
불투명도 페이드, `prefers-reduced-motion` 대응.

## 명령어
- `npm install` — 루트에서 워크스페이스(client, server) 전체 설치
- `npm run dev` — server(3001) + Vite dev server 동시 실행 (Vite가 `/api`·`/media`를 3001로 프록시)
- `npm run build` — 클라이언트 빌드 (`client/dist`) + `tsc --noEmit` 타입 체크
- `npm run start` — 프로덕션 서버 실행 (`PORT` 기본 3001, API + 빌드된 클라이언트 제공)
- `docker compose up -d --build` — 컨테이너 빌드/기동 (호스트 3002 포트)

## 구조
- `client/` — Vite + React 18 + TypeScript(strict). 인라인 style로 디자인 프로토타입을 그대로 재현.
  - `src/App.tsx` — 로케일 상태 + 섹션 조립
  - `src/i18n.ts` — 4개 로케일 전체 카피 (부모님 성함, 두 사람의 이야기 `story` 배열 포함)
  - `src/tokens.ts` — 색·폰트 토큰, 혼인일(2026-06-20) 단일 출처
  - `src/motion.tsx` — 모션 유틸: ScrollScene(각 내용의 뷰포트 진입·퇴장에 따른 불투명도 페이드) /
    Reveal(딜레이·from 변형 지원, ScrollScene 안에서는 중첩 효과 생략) / useInView /
    useCountUp(D+ 카운트업). reduced-motion 대응.
    스크롤 탈취(scroll-jacking)는 의도적으로 쓰지 않는다 — 네이티브 스크롤 유지.
  - `src/music.ts` — useMusic. 사용자 음악 확인 후 기본곡을 선택하며, 클릭할 때만 오디오를 만들고 재생한다.
    자동재생·이전 세션의 재생 상태 복원은 하지 않는다. 새로고침하면 항상 꺼진 상태이며 반복 재생·볼륨 0.3을 사용한다.
  - `src/components/` — TopBar / Hero / Greeting / PhotoSection / Couple / Story / WeddingDay / Guestbook / Footer
- `server/` — Node 20 + Express(ESM). 방명록 `GET·POST /api/guestbook`
  (tmp+fsync+rename 원자적 저장, 실패 시 재시도 후 500 + 메모리 롤백, 파일이 깨져 있으면 덮어쓰지 않고 503,
  IP당 등록 제한 6건/10분), `data/media/` 정적 서빙(`/media`).
  index.html 은 `no-store`, 해시 붙은 `/assets/*` 는 1년 immutable — 위챗 내장 브라우저가 옛 HTML을 붙들고 있는 문제 대응.
- `data/` — 방명록 JSON + 미디어 (런타임 생성, git 무시, 볼륨으로 보존)
- `design/` — 원본 디자인 핸드오프와 이미지·음악 제작 자료(런타임에 직접 사용하지 않음)

## 콘텐츠 교체 포인트 (재빌드 불필요한 것 표시)
- 혼인일 공개 여부: `client/src/tokens.ts` 의 `DATE_HIDDEN`(현재 true). true 면 히어로 날짜는 `????. ??. ??`,
  혼인한 날 섹션은 라벨 + 로케일별 가림 표기(`i18n.ts` `dateMasked`)만 남고 캘린더·D+ 는 숨긴다.
  공개할 때 false 로 바꾸면 혼인일 기준 캘린더와 연애 시작일 기준 D+ 가 다시 나온다 → 재빌드 필요
- 함께한 날(D+): `client/src/tokens.ts` 의 `RELATIONSHIP_START`(2025-02-12) 기준. 방문자의 현지 날짜로 계산하며 시작일은 D+0이다. `DATE_HIDDEN`이 true이면 기존처럼 숨긴다 → 재빌드 필요
- 사진: `data/media/couple.jpg` (세로 4:5) 드롭 → 즉시 반영. 없으면 囍 장식 밴드가 기본
  (사진 없이 운영하는 것이 기본 컨셉 — PhotoSection.tsx)
- 배경음악: `data/media/bgm.mp3`를 추가·교체하고 페이지를 새로고침하면 재빌드 없이 반영한다.
  `src/music.ts`에서 `/media/bgm.mp3`의 HEAD 요청이 성공하면 이 파일을 우선 사용하며, 파일이 없거나
  확인 요청이 실패하면 번들 기본곡 “작은 날들을 함께”(Together in Small Days)를 사용한다. 클릭 전에는
  Audio 객체를 만들지 않는다. 매번 꺼진 상태로 시작하며, 재생 시 `loop: true`, `volume: 0.3`을 적용한다.
  기본곡은 `client/src/assets/together-in-small-days.mp3`이며, 이 페이지를 위해 직접 작성한 피아노 악보와
  합성 음색으로 제작했다. 외부 녹음·샘플은 사용하지 않는다. 악보·렌더링 소스와 재생성 안내는
  `design/music/together-in-small-days/README.md`에 보관한다. 기본곡 파일이나 `src/music.ts`의 가져오기
  경로를 바꾸면 재빌드한다. 제작 자료는 배포 이미지에 포함하지 않으며, 결과 MP3만 클라이언트에 번들한다.
- 부모님 성함: `client/src/i18n.ts` — 신랑 서갑수·이윤진, 신부는 모친 刘丽娟 만(부친 성함은 의도적으로 생략, KR 로케일은 한국 한자음 유려연).
  바꾸려면 4개 로케일 모두 수정 → 재빌드 필요
- 두 사람의 이야기: `client/src/i18n.ts` 의 `story` 배열(장마다 mark + text) 4개 로케일, 네 장. 신부 부친·가족사는
  적지 않는다. CN 카피는 신부 검수 전 초안 → 재빌드 필요
  첫 인사는 학습 언어·앱 사용 목적을 생략하고 두 사람의 대화로 시작한다. 첫 만남은 상현의 자전거 여행 중
  후허하오터에서 나흘 함께 지내고, 상현이 귀가 후 마음을 전하고 석 달 뒤 정정이 답한 순서다.
  첫 만남 문구에는 거리·출발지를 넣지 않는다. 셋째 장은 하얼빈에서 시작한 첫 데이트와 도쿄행이다.
  마지막 장은 정정의 대학 졸업 뒤 두 달 동안 한집에서 지내며, 일상을 함께 나누고 부부가 되기로 한 내용이다.
  예전의 "여러 도시를 오가며" 장(지도 삽화)은 새 사건 없는 요약이라 2026-09-12에 제거했다.
- 이름 표기: 사용자 확인 한자는 徐(천천히 갈 서)·相(서로 상)·賢(어질 현)이다. 일본어는 `徐相賢`,
  중국어 간체는 `徐相贤`을 제목·첫 화면·소개·마무리에 사용하고, 이야기에서는 `相賢`·`相贤`으로 쓴다.
  두 로케일의 신부 주표기는 `周婷婷`, 이야기에서는 `婷婷`이다. 일본어 인물 소개에는 가타카나 발음을
  덧붙이고, 로마자 보조 표기는 유지한다. 부모님 한자는 확인 없이 추정하지 않는다.
  번역은 원문의 '오랜 시간'을 수년으로 단정하지 않으며, 혼인 날짜를 예식 날짜로 오해하지 않도록 표현한다.
- 한글 줄바꿈: `Hero.tsx`의 안내 문구와 `Greeting.tsx`의 본문, 기존 이야기 본문에 `.prose`를 적용한다.
  `index.css`의 `:lang(ko) .prose { word-break: keep-all; }`로 한국어 어절 중간의 줄바꿈을 막는다.
  다른 로케일에는 이 규칙을 적용하지 않으며, 첫 화면의 각 이름에는 `white-space: nowrap`을 적용한다.
- 자연스러운 스크롤 페이드: `motion.tsx`의 `ScrollScene`은 너비 제한 없이 동작 줄이기가 꺼져 있을 때
  적용한다. 각 내용은 원래 문서 위치에서 네이티브 스크롤을 따라 움직이고, 내부 콘텐츠의 `opacity`만
  갱신한다. 히어로·인사말·사진/囍 장식·두 사람 소개·혼인일·맺음말과 이야기 각 장에 적용한다.
  장의 라벨·삽화·장 제목·본문은 한 묶음으로 페이드하며, 이웃한 장면도 각자의 위치에 따라 함께 표시된다.
  `App.tsx`의 `.page-sections`와 `Story.tsx`의 `.story-sections`에서 이웃한 파트 사이에
  `clamp(88px, 14svh, 144px)` 여백을 추가한다(`svh` 미지원 시 `vh`). 여백은 각 장면 바깥에 두어
  페이드 계산에 포함하지 않으며, 삽화와 본문 사이의 기존 간격은 유지한다.
  위쪽 상단 바 아래와 화면 아래쪽에서 뷰포트 높이의 12%만큼 안쪽을 진입·퇴장 경계로 사용해
  가장자리에 걸친 내용을 더 흐리게 하고 페이드가 확실하게 보이게 한다.
  페이드 거리는 뷰포트 높이의 최대 46%이며 짧은 콘텐츠의 읽기 구간을 확보하도록 제한한다. 화면 중앙을
  지나는 본문과 화면보다 긴 본문의 읽기 구간은 선명하게 유지한다. 첫 화면과 마지막 맺음말은 문서 양 끝에서
  완전히 나타나도록 스크롤 가능한 거리로 페이드를 제한한다. 위로 스크롤하면 동일한 위치에서 동일한 불투명도로 다시 표시된다.
  섹션은 콘텐츠 높이를 따르며, 위치 보정·중앙 고정·활성 장면 선택·화면 단위 최소 높이를 사용하지 않는다.
  장면 내부 `Reveal`은 지연·이동을 생략한다. 히어로와 사진의 별도 패럴랙스도 제거하여 위치는 스크롤에만
  따른다. 스프라이트 자체의 애니메이션은 유지한다.
  `data-scene-interactive` 방명록은 불투명도 1을 유지하고, 상단 언어·음악 바는 페이드 밖에 둔다.
  모든 콘텐츠는 공용 requestAnimationFrame으로 갱신하며 스크롤·창 크기·콘텐츠 높이 변화를 감지한다.
  동작 줄이기에서는 불투명도 변경을 해제하고 `index.css`의 `[data-reveal]`·`[data-scroll-scene]`·
  `[data-scene-content]` 규칙으로 즉시 표시한다. 이때도 문서의 배치와 높이는 그대로다.
- 두 사람의 이야기 스프라이트 삽화: 네 장은 순서대로 `client/src/assets/story-01-sprite.webp`,
  `story-02-sprite.webp`, `story-03-sprite.webp`, `story-05-sprite.webp`와 각각 `.png` 폴백을 사용한다
  (파일명은 제작 당시 5장 구성의 번호를 유지한다).
  언어교환 앱·자전거 여행·함께 탄 비행기·집에서 낮은 나무 탁자와 찻잔 두 개를 앞에 둔 두 사람의 장면이다.
  1296×1056, 3열×3행 시트(프레임 432×352, 9프레임 × 320ms, 2.88초 반복)를 260px 너비로 재생한다.
  `Story.tsx`의 `storyArt` 배열과 `index.css`의 `.sprite-3x3`를 사용한다. 동작 줄이기에서는 첫 프레임에 고정된다.
  첫 번째·두 번째 장은 종이색 배경의 사용자 제공 시트이며, 세 번째·네 번째 장은 Reveal의
  `mix-blend-mode: darken`으로 밝은 배경을 페이지에 맞춘다.
  첫 번째·두 번째 장 원본은 각각 `design/story-01/supplied-sheet.png`, `design/story-02/supplied-sheet.png`다.
  각 폴더의 `prepare.cjs`는 크기를 검증한 뒤 PNG를 그대로 복사하고 WebP를 생성한다(프레임별 재정렬 없음).
  세 번째 장은 사용자 제공 `story-03-web-upload.zip`을 풀어 둔 `design/story-03/refined/`의
  `story-03-sprite-3x3.png`와 무손실 `.webp`를 사용한다. `design/story-03/prepare.cjs`는 두 파일의 크기를
  검증한 뒤 그대로 복사한다(프레임 재정렬·재인코딩 없음). 패키지의 HTML/CSS와 애니메이션 파일은 미리보기 자료다.
  네 번째 장(`story-05-sprite`)은 내장 image_gen으로 제작했다. 원본과 정확한 프롬프트는 `design/story-05/`의
  `generated-sheet.png`, `generation-prompt.txt`에 보관한다. 작은 시선·미소·눈 깜박임으로 함께하는 일상을 표현한다.
  `design/story-05/prepare.cjs`는 공용 `design/prepare-story-sprite.cjs`를 호출한다. 공용 스크립트는 3×3 셀의
  어두운 삽화 경계를 검출하고, 아홉 프레임에 같은 배율을 적용한 뒤 중심·바닥선을 맞춰 생성 여백을 정리한다.
  그림을 다시 그리지 않고 1296×1056 PNG와 WebP(품질 0.92), 정렬 기록 `layout.json`을 만든다.
  `design/story-03/generated-sheet.png`, `generation-prompt.txt`와 `/srv/drop/files/story-01-language-app.zip`은
  이전 시안의 원본·제작 기록이며 현재 사용하지 않는다. 15프레임 시안도 `design/story-15/`에 보관만 한다.
  프레임 격자를 바꾸면 CSS와 이미지 너비도 함께 수정해야 한다 → 재빌드 필요
- 제거된 지도 장(보관용): 예전 네 번째 장 "여러 도시를 오가며"는 손그림 지도 위에 SVG 경로를 그리는
  `StoryMap.tsx`를 썼으나 2026-09-12에 장과 함께 제거했다. 컴포넌트·CSS·`client/src/assets/story-04-*`는
  삭제했고, 제작 자료(`design/story-04/map/illustrated/`의 `generated-map.png`·`generation-prompt.txt`·
  `prepare.cjs`, Natural Earth GeoJSON, 걷기 스프라이트 시안)와 재생성 절차는 `design/story-04/README.md`에
  그대로 보관한다. 되살리려면 git 이력(커밋 b45499d 시점)의 `StoryMap.tsx`와 `index.css`의 `.story-map` 규칙을 참고한다.
- 링크 미리보기 이미지: `client/public/og.jpg` (1200×630 JPEG, index.html 의 og:image 절대 URL). 바꾸면 재빌드 후
  카카오 캐시 초기화(developers.kakao.com/tool/clear/og) 필요
- 파비콘: `client/public/` 의 favicon.ico · favicon-32.png · icon-192.png · apple-touch-icon.png(종이색 배경).
  원본은 반지 사진 PNG(920²) — 바꾸면 같은 4개 파일 재생성 후 재빌드 필요
- 방명록: `data/guestbook.json` 단일 파일. 시드 없음(없으면 빈 방명록). 손으로 고쳤으면 `docker compose restart app`
  (메모리 사본이 다음 저장 때 파일을 덮는다). 일일 스냅샷 `data/backups/guestbook-YYYY-MM-DD.json` 30일 보관

## 배포
대표 주소는 `https://7chan.3chan.kr/`이다. `client/index.html`의 canonical·Open Graph URL과
미리보기 이미지 절대 주소도 이 도메인을 사용한다.
`Dockerfile` + `docker-compose.yml`(호스트 3002) 로 구동. `docker-compose.override.yml` 이
공유 Caddy 스택의 `web` 네트워크에 `married-app` 별칭으로 연결한다.
`/srv/proxy/Caddyfile`의 `7chan.3chan.kr` 블록이 결혼 페이지를 `married-app:3001`로 전달한다.
`7chan.3chan.kr`의 `/drop/*`는 `/srv/drop` 파일 드롭 앱(`drop-app:8080`)으로
접두어를 떼어 전달한다. 결혼 페이지와 무관한 별도 서비스이며 기존 데이터는 그대로 보존한다.
토큰은 `/srv/drop/.env`, 업로드 파일은 `/srv/drop/files/`에 있다.
