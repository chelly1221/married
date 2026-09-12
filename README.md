# 결혼 알림 랜딩 (married)

서상현 · 주정정 — 결혼 사실만 정중히 알리는 모바일 원페이지.
예식 안내·오시는 길·축의금 계좌는 의도적으로 없습니다.

디자인 원본: `design/` (Claude Design 핸드오프). 스택은 이 서버의 기존 패턴(daecheon)을 따랐습니다:
npm 워크스페이스 + Vite/React 18/TS(strict) 클라이언트 + Express 서버 + Docker.

## 실행

```sh
# 개발 (Node 20+)
npm install
npm run dev          # server :3001 + Vite dev server (프록시 /api, /media)

# 프로덕션 (Docker)
docker compose up -d --build   # 호스트 :3002
```

## 기능
- 4개 언어 KR / EN / JP / CN — 상단 바에서 전환, `localStorage` 유지, 브라우저 언어 자동 감지
- 자연스러운 스크롤과 페이드 — 모바일·데스크톱 모두 내용이 문서 흐름을 따라 움직이며, 화면에 들어오고 나갈 때 불투명도만 부드럽게 바뀝니다. 이야기의 라벨·삽화·장 제목·본문은 함께 페이드하고, 위로 돌아가면 다시 나타납니다.
- 파트 사이에 화면 높이에 맞춘 88~144px 여백을 더해 각 내용을 구분합니다. 화면 위아래 가장자리에서는 내용을 감추고 안쪽에서 페이드하여 등장과 퇴장이 더 뚜렷하게 느껴집니다.
- 본문을 읽는 구간은 선명하게 유지하며, 섹션의 높이는 콘텐츠에 따릅니다. 이웃한 내용도 각자의 스크롤 위치에 맞춰 이어서 표시됩니다. 방명록과 상단 언어·음악 버튼은 항상 선명하게 사용할 수 있습니다.
- `prefers-reduced-motion`에서는 페이드를 해제하고 모든 내용을 즉시 표시합니다. 일반 스크롤과 같은 문서 높이를 유지합니다.
- 히어로·인사말·혼인일 라벨은 방문자 현지 날짜가 혼인일 전이면 예정형, 당일부터는 완료형 카피로 표시
- 혼인한 날 캘린더(2026-09-18) + 연애 시작일(2025-02-12) 기준 D+ 카운터 (시작일 D+0, 방문자 현지 날짜 기준; `DATE_HIDDEN` 이 true 인 동안은 날짜를 `????. ??. ??` 로 가리고 캘린더·D+ 숨김)
- 방명록 — `GET/POST /api/guestbook`, 파일 저장(`data/guestbook.json`, 원자적 쓰기),
  IP당 6건/10분 제한, 이름 40자·메시지 500자 제한
- 배경음악 — 기본곡은 이 페이지를 위해 만든 피아노곡 “작은 날들을 함께”(Together in Small Days). 클릭할 때 오디오를 만들고 재생하며, 볼륨 0.3으로 반복합니다. 새로고침하면 항상 꺼진 상태로 시작합니다.
- 한글 줄바꿈 — 첫 화면 안내·인사말·이야기 본문은 어절 단위로 줄바꿈하며, 첫 화면의 각 이름은 중간에서 나뉘지 않습니다.

## 콘텐츠 교체 (재빌드 불필요)
| 항목 | 위치 | 없을 때 (기본) |
|---|---|---|
| 사진 (세로 4:5) | `data/media/couple.jpg` | 囍 장식 밴드 (사진 없이 쓰는 것이 기본값) |
| 배경음악 | `data/media/bgm.mp3` | 기본 피아노곡 “작은 날들을 함께” 사용 |

음악은 페이지를 열 때 `/media/bgm.mp3`를 HEAD 요청으로 확인합니다. 성공하면 해당 파일을 우선 사용하고,
파일이 없거나 확인 요청이 실패하면 번들에 포함된 기본곡을 사용합니다. `data/media/bgm.mp3`를 교체한 뒤
페이지를 새로고침하면 재빌드 없이 선택한 곡이 반영됩니다. 파일이 없으면 기본곡으로 돌아갑니다.

기본곡은 `client/src/assets/together-in-small-days.mp3`입니다. 직접 작성한 피아노 악보와 합성한 피아노
음색으로 제작했으며, 다른 곡의 녹음이나 외부 샘플을 사용하지 않았습니다. 악보·렌더링 소스와 재생성
안내는 `design/music/together-in-small-days/README.md`에 있습니다.

재빌드가 필요한 것:
- **부모님 성함** — `client/src/i18n.ts`에 신랑 서갑수·이윤진, 신부 모친 刘丽娟(한국어 유려연)을 표기합니다. 변경 시 4개 로케일을 함께 수정합니다.
- **번들 기본곡** — `client/src/assets/together-in-small-days.mp3`를 교체하거나 `client/src/music.ts`의 가져오기 경로를 바꾸면 재빌드합니다. 제작 자료는 `design/music/together-in-small-days/`에서 함께 관리합니다.

방명록에는 시드가 없으며, `data/guestbook.json`이 없으면 빈 상태로 시작합니다. 파일을 직접 수정한 뒤에는 `docker compose restart app`으로 메모리 사본도 갱신합니다.

## 공개 (Caddy)
대표 주소는 [https://7chan.3chan.kr/](https://7chan.3chan.kr/)입니다.
`docker-compose.override.yml` 이 컨테이너를 공유 `web` 네트워크에 `married-app` 으로 붙입니다.
`/srv/proxy/Caddyfile`의 대표 도메인 블록은 다음과 같이 결혼 페이지와 기존 파일 드롭을 분기합니다.

```caddy
7chan.3chan.kr {
    encode zstd gzip
    handle_path /drop/* {
        reverse_proxy drop-app:8080
    }
    handle {
        reverse_proxy married-app:3001
    }
}
```

`7chan.3chan.kr`의 `/drop/*`는 `drop-app:8080`으로 전달하며, 기존 업로드 파일과 드롭 동작을 유지합니다.
페이지의 canonical·Open Graph URL과 미리보기 이미지 절대 주소도 `https://7chan.3chan.kr/`를 사용합니다.

`client/index.html` 에 `noindex` 메타가 있습니다(개인 페이지 기본값) — 검색 노출을 원하면 제거하세요.
