# Handoff: 결혼 알림 랜딩페이지 (Wedding Announcement Landing)

## Overview
결혼식을 따로 진행하지 않는 부부(서상현 · 주정정)가 지인들에게 **결혼 사실만 정중히 알리는** 모바일 원페이지 랜딩. 예식 안내·오시는 길·축의금 계좌는 의도적으로 없으며, 대신 인사말 / 사진 / 두 사람 소개 / 혼인한 날(캘린더 + D+카운터) / 방명록으로 구성된다. 스크롤에 따라 섹션이 페이드업되고 배경 사진이 패럴랙스로 움직인다.

## About the Design Files
번들에 포함된 `Wedding Announcement.dc.html`은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 이다. 그대로 배포할 프로덕션 코드가 아니라, 의도한 레이아웃·타이포·인터랙션을 보여주는 목업이다.

구현 시에는 이 HTML을 복사하지 말고, **대상 코드베이스의 기존 환경(React / Next.js / Vue / SwiftUI 등)과 기존 패턴·라이브러리로 재현**할 것. 아직 코드베이스가 없다면 이 프로젝트에 가장 적합한 프레임워크를 골라 구현하면 된다(모바일 웹 원페이지이므로 Next.js + CSS Modules 또는 Tailwind 정도가 무난).

파일은 커스텀 런타임(`support.js`)에 의존하는 형식이므로 **런타임 코드는 이식 대상이 아니다.** 마크업 구조, 인라인 스타일 값, 로직 클래스의 계산식만 참고하면 된다.

## Fidelity
**High-fidelity (hifi).** 색상·타이포·간격·인터랙션 모두 최종안 수준. 픽셀 단위로 재현하되, 대상 코드베이스에 디자인 시스템이 이미 있다면 토큰으로 매핑할 것.

단, **사진은 모두 플레이스홀더**(대각 스트라이프 + 모노스페이스 캡션)다. 실제 사진으로 교체 필요.

## Screens / Views

단일 스크롤 화면. 기준 뷰포트 **390 × 800**(iPhone 14 기준 폭). 프로토타입에서는 390px 폭 컨테이너에 `border-radius: 38px`, `overflow-y: auto`로 기기 프레임을 흉내냈다 — **실제 구현에서는 프레임/라운딩/그림자 없이 문서 전체가 스크롤 루트**가 된다.

- 배경: `#f4efe6` (한지 톤)
- 본문 색: `#21201d`
- 기본 폰트: `'Gowun Batang', serif`
- 스크롤바 숨김(`scrollbar-width: none`, `::-webkit-scrollbar { width:0 }`)

### 1. 상단 바 (sticky)
- `position: sticky; top: 0; z-index: 9`
- `padding: 14px 20px`, `display:flex; justify-content:space-between; align-items:center`
- 배경: `linear-gradient(#f4efe6 58%, rgba(244,239,230,0))` — 콘텐츠가 밑으로 자연스럽게 사라지도록
- **좌: 언어 전환** `KR EN JP CN`
  - `gap: 11px`, `font: 400 11px/1 'Gowun Batang', serif`, `letter-spacing: .14em`
  - 활성(KR): `color:#21201d`, `border-bottom:1px solid #21201d`, `padding-bottom:2px`
  - 비활성: `color:#a29a8e`
  - 프로토타입에서는 링크만 있고 동작 없음 — **실제 구현은 i18n 필요** (아래 참조)
- **우: 음악 토글 버튼**
  - `border:1px solid rgba(33,32,29,.22)`, `background:transparent`, `border-radius:999px`, `padding:5px 11px`
  - `font: 400 11px/1 'Gowun Batang', serif`, `letter-spacing:.1em`
  - 라벨: 꺼짐 `♪ 음악 켜기` / 켜짐 `♪ 음악 끄기`

### 2. 히어로
- `height: 640px`, `margin-top:-52px`(sticky 바 아래로 밀어 넣음), `overflow:hidden`
- `display:flex; flex-direction:column; justify-content:center; align-items:center; padding: 0 34px`
- **배경 레이어** (`data-par="0.14"` 패럴랙스): `position:absolute; inset:-12% -20%`
  - `radial-gradient(58% 44% at 50% 34%, rgba(255,255,255,.9), transparent 70%)`
  - `+ repeating-linear-gradient(93deg, rgba(33,32,29,.045) 0 1px, transparent 1px 4px)` — 한지 결
- **콘텐츠** (세로 스택, `gap: 30px`, 가운데 정렬)
  1. `謹　告` — `writing-mode: vertical-rl`, `font: 400 13px/1 'Nanum Myeongjo', serif`, `letter-spacing:.5em`, `color:#9c3b2e`
  2. 그룹 (`gap:15px`)
     - `결 혼 인 사` — `font: 400 14px/1 'Gowun Batang'`, `letter-spacing:.42em`, `color:#7d7669`
     - 세로 헤어라인 — `width:1px; height:42px; background:linear-gradient(rgba(33,32,29,.4), transparent)`
     - `서상현 · 주정정` — `font: 400 36px/1.35 'Nanum Myeongjo', serif`, `letter-spacing:.08em`; 가운뎃점은 `color:#9c3b2e`, `padding: 0 9px`
     - `저희 두 사람,` / `부부가 되었음을 알려 드립니다` — `font: 400 15px/1.9 'Gowun Batang'`, `letter-spacing:.05em`, `color:#5c564d`
  3. 날짜 `2026. 06. 20` — `font: 400 12px/1 ui-monospace, monospace`, `letter-spacing:.24em`, `color:#9a9184`
- **스크롤 힌트** `아래로` — 하단 26px, `font: 400 11px/1 'Gowun Batang'`, `letter-spacing:.3em`, `animation: hint 2.4s ease-in-out infinite`

### 3. 인사말
- `padding: 62px 40px 54px`, 세로 스택 `gap:22px`, 가운데 정렬
- 다이아몬드 마크: `24×24`, `border:1px solid rgba(156,59,46,.5)`, `transform: rotate(45deg)`
- 본문 — `font: 400 15.5px/2.5 'Gowun Batang'`, `color:#3c3831`, `text-wrap: pretty`
  > 저희 두 사람, 오랜 시간 서로를 아끼며 / 지내온 끝에 마침내 한 가정을 이루었습니다.
  >
  > 따로 예식은 갖추지 아니하였으나, / 귀한 분들께 저희의 새로운 시작을 / 정중히 알려 드리고자 합니다.
  >
  > 보내 주시는 축하의 말씀만으로 / 저희에게는 넘치는 선물이 됩니다.
- 고지 — `font: 400 12.5px/1.9 'Gowun Batang'`, `color:#9c3b2e`
  > 예식은 진행하지 않으며, / 축의금은 정중히 사양합니다.

### 4. 사진 (풀블리드)
- `height: 460px`, `overflow:hidden`
- 내부 레이어 `inset:-14% 0`, `data-par="0.1"` 패럴랙스
- 플레이스홀더: `repeating-linear-gradient(38deg, #ddd5c6 0 12px, #e6ded1 12px 24px)` + 캡션 `[ 두 사람 사진 · 세로 4:5 ]`
- **실제 구현**: 세로 4:5 사진, `object-fit: cover`

### 5. 두 사람
- `padding: 56px 40px`, `gap: 36px`
- 섹션 라벨 `두 사람` — `font: 400 12px/1 'Gowun Batang'`, `letter-spacing:.34em`, `color:#9a9184`, 가운데
- 신랑 블록 (가운데 정렬, `gap:8px`)
  - `신랑` — `12.5px`, `letter-spacing:.2em`, `color:#9c3b2e`
  - `서상현` — `font: 400 25px/1.3 'Nanum Myeongjo'`, `letter-spacing:.08em`
  - `SEO SANG HYUN` — `11px ui-monospace`, `letter-spacing:.16em`, `color:#a89f91`
  - `서○○ · 이○○ 의 아들` — `13px/1.9 'Gowun Batang'`, `color:#6b6459`
- 구분자: 좌우 `height:1px; background:rgba(33,32,29,.14)` + 가운데 `5×5` 다이아몬드 `#9c3b2e` (`gap:14px`)
- 신부 블록 (동일 규칙)
  - `주정정` + 한자 `周婷婷`(`font-size:15px`, `color:#8a8172`)
  - `ZHOU TING TING`
  - `周○○ · ○○○ 의 딸`
- ○○ 는 **미확정 부모님 성함 플레이스홀더**. 실제 값 확인 후 교체.

### 6. 혼인한 날 (캘린더)
- `padding: 52px 40px 58px`, 배경 `#efe8dc`, `gap: 24px`, 가운데 정렬
- 라벨 `혼인한 날` (섹션 라벨 규칙 동일)
- `2026년 6월 20일 토요일` — `font: 400 21px/1.4 'Nanum Myeongjo'`, `letter-spacing:.1em`
- 요일 헤더: `grid-template-columns: repeat(7,1fr)`, `일 월 화 수 목 금 토`, `12px 'Gowun Batang'`, `color:#a29a8e`, `padding-bottom:4px`
- 날짜 그리드: `repeat(7,1fr)`, `gap: 9px 0`, `margin-top:-12px`, 셀 `height:30px` 중앙 정렬
  - 해당일: 뒤에 `30×30` 원 `border-radius:50%`, `background:#9c3b2e`, 숫자 `#f4efe6`
  - 그 외: `#4a453d`
  - 월 첫날 이전 칸은 빈 칸(투명)
- D+ 카운터
  - `함께한 날` — `11.5px`, `letter-spacing:.22em`, `color:#9a9184`
  - `D+NNN` — `font: 400 30px/1 'Nanum Myeongjo'`, `letter-spacing:.06em`, `color:#9c3b2e`

### 7. 방명록
- `padding: 56px 34px 40px`, `gap:20px`
- 라벨 `축하의 말씀`
- 입력 폼 (`gap:9px`)
  - 이름 input: `border:none; border-bottom:1px solid rgba(33,32,29,.2)`, 배경 투명, `padding:10px 2px`, `14px/1.4 'Gowun Batang'`, placeholder `성함`
  - 메시지 textarea: `rows=3`, `border:1px solid rgba(33,32,29,.16)`, `background:rgba(255,255,255,.55)`, `border-radius:3px`, `padding:12px`, `14px/1.8`, `resize:none`, placeholder `따뜻한 한마디를 남겨 주세요`
  - 제출 버튼 `남기기`: `background:#21201d`, `color:#f4efe6`, `padding:13px`, `border-radius:3px`, `13px 'Gowun Batang'`, `letter-spacing:.16em`
- 목록 (`gap:13px`)
  - 항목: `border-top:1px solid rgba(33,32,29,.12)`, `padding-top:13px`
  - 이름 `13.5px 'Nanum Myeongjo'`, `letter-spacing:.06em` / 날짜 `10.5px ui-monospace`, `color:#a29a8e` — `justify-content: space-between`
  - 본문 `13.5px/1.9 'Gowun Batang'`, `color:#4a453d`
- 시드 데이터 3건 (한국어 2, 중국어 1 — 신부 측 하객 고려):
  - 박현우 / 07.24 / "두 분의 앞날에 늘 따뜻한 날들이 함께하기를 바랍니다."
  - 李 佳 / 07.22 / "恭喜你們！祝百年好合，永結同心。"
  - 정다은 / 07.21 / "소식 듣고 얼마나 기뻤는지 몰라요. 진심으로 축하드립니다."

### 8. 푸터
- `padding: 40px 40px 58px`, 가운데 정렬, `gap:14px`
- 세로 헤어라인 `1×40`, `linear-gradient(rgba(33,32,29,.3), transparent)`
- `귀한 마음 보내 주신 모든 분께 / 깊이 감사드립니다` — `14px/2 'Gowun Batang'`, `color:#5c564d`
- `SANG HYUN & TING TING` — `11px ui-monospace`, `letter-spacing:.2em`, `color:#a89f91`

## Interactions & Behavior

### 스크롤 리빌
`[data-reveal]` 이 붙은 섹션 각각:
- 초기: `opacity: 0`, `transform: translateY(26px)`
- 전이: `opacity 1.1s cubic-bezier(.2,.7,.2,1), transform 1.1s cubic-bezier(.2,.7,.2,1)`
- `IntersectionObserver({ threshold: 0.12 })` 로 진입 시 `opacity:1; transform:none`. **한 번만 실행**(되돌아가도 다시 숨기지 않음)
- `prefers-reduced-motion: reduce` 대응 필요 — 프로토타입에는 없음. 구현 시 트랜지션 제거하고 즉시 표시할 것.

### 패럴랙스
`[data-par]` 요소는 부모 대비 상대 위치로 이동:
```js
const rel = childRect.top - rootRect.top - rootRect.height / 2 + childRect.height / 2;
el.style.transform = `translate3d(0, ${-rel * parseFloat(el.dataset.par)}px, 0)`;
```
- 히어로 배경 `0.14`, 사진 섹션 `0.1`
- 스크롤 리스너는 `{ passive: true }`, 마운트 직후 1회 실행
- 실제 구현에서는 `requestAnimationFrame` 스로틀 권장

### 언어 전환 (KR / EN / JP / CN)
프로토타입은 **UI만 있고 미구현**. 실제로는 전체 카피(인사말·라벨·플레이스홀더·날짜 포맷)를 4개 로케일로 준비해야 한다. 신부가 중국분이므로 CN은 필수. 날짜 포맷도 로케일별로 다르게(`ko-KR`, `en-US`, `ja-JP`, `zh-CN`).

### 배경 음악
버튼 라벨만 토글되고 실제 오디오는 없음. 구현 시:
- 자동재생 금지, 사용자 클릭으로만 시작
- 루프, 볼륨 낮게(0.3 내외), 상태 `sessionStorage` 유지

### 방명록 제출
- 이름/메시지 둘 다 `trim()` 후 비어 있으면 **무시**(에러 메시지 없음 — 필요하면 추가)
- 통과 시 목록 **맨 앞에 prepend**, 입력 폼 초기화
- 날짜는 클라이언트 `new Date()` 기준 `MM.DD`
- 프로토타입은 로컬 state만 — 실제로는 백엔드 저장 + 스팸/욕설 필터 + 페이지네이션 필요

## State Management

| 상태 | 타입 | 설명 |
|---|---|---|
| `music` | boolean | 배경음악 on/off |
| `draft.name` | string | 방명록 이름 입력값 |
| `draft.msg` | string | 방명록 메시지 입력값 |
| `entries` | `{name, msg, at}[]` | 방명록 목록, 최신순 |
| `locale` | `'ko'\|'en'\|'ja'\|'zh'` | (미구현) 언어 |

### 파생 값 (렌더 시 계산)
- `weddingDate = new Date(2026, 5, 20)` — **2026-06-20**
- `dateDot` = `2026. 06. 20` (연도 + 2자리 패딩)
- `dateKo` = `2026년 6월 20일 토요일`
- `dplus` = `"D+" + Math.floor((Date.now() - weddingDate) / 86400000)`
- 캘린더 셀: `new Date(y, m, 1).getDay()` 만큼 빈 칸, 그다음 `new Date(y, m+1, 0).getDate()` 일까지

### 데이터 요구사항
- 방명록: `GET /guestbook`, `POST /guestbook` (이름·메시지·타임스탬프)
- 그 외 정적

## Design Tokens

### Colors
| 이름 | 값 | 용도 |
|---|---|---|
| `paper` | `#f4efe6` | 페이지 배경 |
| `paper-deep` | `#efe8dc` | 캘린더 섹션 배경 |
| `ink` | `#21201d` | 본문/버튼 |
| `ink-80` | `#3c3831` | 인사말 본문 |
| `ink-70` | `#4a453d` | 방명록 본문, 캘린더 숫자 |
| `ink-60` | `#5c564d` | 보조 문장 |
| `ink-50` | `#6b6459` | 부모 성함 |
| `mute` | `#7d7669` | 히어로 소제목 |
| `mute-light` | `#9a9184` | 섹션 라벨, 날짜 |
| `mute-lighter` | `#a29a8e` / `#a89f91` | 비활성 언어, 로마자 |
| `accent` | `#9c3b2e` | 주사(朱砂) 포인트 — 가운뎃점, 다이아몬드, 캘린더 마커, D+, 고지문 |
| `photo-a` / `photo-b` | `#ddd5c6` / `#e6ded1` | 사진 플레이스홀더 스트라이프 |
| 경계선 | `rgba(33,32,29,.12 / .14 / .16 / .2 / .22)` | 상황별 헤어라인 |

### Typography
| 역할 | 폰트 | 값 |
|---|---|---|
| 이름·날짜(강조) | `Nanum Myeongjo` 400 | 36 / 25 / 21 / 30 / 13.5px |
| 본문·라벨 | `Gowun Batang` 400 | 15.5 / 15 / 14 / 13.5 / 12.5 / 12 / 11px |
| 숫자·로마자 | `ui-monospace, monospace` 400 | 12 / 11 / 10.5px |
| 페이지 밖 캔버스 UI | `Noto Sans KR` | (프로토타입 전용, 이식 불필요) |

Google Fonts: `Gowun Batang (400,700)`, `Nanum Myeongjo (400,700,800)`. `Cormorant Garamond`, `Noto Sans KR`는 삭제된 다른 시안의 잔여 로드 — **이식하지 말 것.**

Letter-spacing 스케일: `.05em` (본문) / `.08em` (이름) / `.1em` / `.14em` / `.16em` / `.2em` / `.22em` / `.24em` / `.3em` / `.34em` (섹션 라벨) / `.42em` (히어로 소제목) / `.5em` (세로 한자)

Line-height: 본문 `1.9`–`2.5`, 제목 `1.3`–`1.4`, 라벨 `1`

### Spacing
섹션 세로 패딩 `52–62px`, 가로 패딩 `34–40px`, 스택 gap `5 / 6 / 7 / 8 / 9 / 13 / 14 / 15 / 20 / 22 / 24 / 30 / 36px`

### Radius
`2px`(작은 컨트롤) · `3px`(방명록 입력/버튼) · `999px`(음악 토글) · `50%`(캘린더 마커)
*프로토타입의 `38px`는 기기 프레임 흉내이므로 이식 대상 아님.*

### Motion
- 리빌: `1.1s cubic-bezier(.2,.7,.2,1)`, Y `26px`
- 스크롤 힌트 `@keyframes hint`: `0%,100% { translateY(0); opacity:.35 }` / `50% { translateY(7px); opacity:.9 }`, `2.4s ease-in-out infinite`
- 링크 hover: `opacity: .65`

## Assets
- **이미지 없음.** 사진 자리는 전부 CSS 스트라이프 플레이스홀더:
  - 히어로/본문 사진 — 세로 4:5, 풀블리드
- 아이콘 없음. 다이아몬드는 `transform: rotate(45deg)` 한 사각형, 음악 아이콘은 `♪` 문자.
- 폰트는 Google Fonts CDN. 프로덕션에서는 self-host + `font-display: swap` 권장 (한글 웹폰트는 서브셋 필수).

## Files
- `Wedding Announcement.dc.html` — 디자인 원본. 상단 `<x-dc>` 블록이 마크업, 하단 `<script data-dc-script>` 블록이 로직(캘린더 계산, 리빌/패럴랙스, 방명록 상태).
- `support.js` — 프로토타입 런타임. **참고/이식 대상 아님.**

## Open Questions
1. 부모님 성함(`서○○ · 이○○`, `周○○ · ○○○`) 실제 값
2. 4개 언어 카피 확보 여부 — 없으면 KR/CN 2개로 축소 제안
3. 방명록 백엔드 유무 (없으면 정적 + 폼 없이 갈지)
4. 배경음악 음원
5. 실제 사진 (커버 1장 + 본문 1장, 세로 4:5)
