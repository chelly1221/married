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
- 스크롤 리빌(1회) + 패럴랙스 — `prefers-reduced-motion` 시 즉시 표시
- 혼인한 날 캘린더(2026-06-20) + 연애 시작일(2025-02-12) 기준 D+ 카운터 (시작일 D+0, 방문자 현지 날짜 기준; `DATE_HIDDEN` 이 true 인 동안은 날짜를 `????. ??. ??` 로 가리고 캘린더·D+ 숨김)
- 방명록 — `GET/POST /api/guestbook`, 파일 저장(`data/guestbook.json`, 원자적 쓰기),
  IP당 6건/10분 제한, 이름 40자·메시지 500자 제한
- 배경음악 — 기본 피아노곡은 Kevin MacLeod의 “Heartwarming”. 클릭할 때 오디오를 만들고 재생하며, 볼륨 0.3으로 반복합니다. 새로고침하면 항상 꺼진 상태로 시작합니다.
- 한글 줄바꿈 — 첫 화면 안내·인사말·이야기 본문은 어절 단위로 줄바꿈하며, 첫 화면의 각 이름은 중간에서 나뉘지 않습니다.

## 콘텐츠 교체 (재빌드 불필요)
| 항목 | 위치 | 없을 때 (기본) |
|---|---|---|
| 사진 (세로 4:5) | `data/media/couple.jpg` | 囍 장식 밴드 (사진 없이 쓰는 것이 기본값) |
| 배경음악 | `data/media/bgm.mp3` | 기본 피아노곡 “Heartwarming” 사용 |

음악은 페이지를 열 때 `/media/bgm.mp3`를 HEAD 요청으로 확인합니다. 성공하면 해당 파일을 우선 사용하고,
파일이 없거나 확인 요청이 실패하면 번들에 포함된 기본곡을 사용합니다. `data/media/bgm.mp3`를 교체한 뒤
페이지를 새로고침하면 재빌드 없이 선택한 곡이 반영됩니다. 파일이 없으면 기본곡으로 돌아갑니다.

기본곡 원본은 `client/src/assets/heartwarming.mp3`이며 변형 없이 보관합니다.
라이선스는 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)으로, 출처·크레딧·원본 파일 정보는
`client/public/music/heartwarming-license.txt`에 있습니다. 기본곡을 사용할 때만 푸터에 곡명·저작자·라이선스 링크를 표시합니다.

재빌드가 필요한 것:
- **부모님 성함** — `client/src/i18n.ts`에 신랑 서갑수·이윤진, 신부 모친 刘丽娟(한국어 유려연)을 표기합니다. 변경 시 4개 로케일을 함께 수정합니다.
- **번들 기본곡** — `client/src/assets/heartwarming.mp3`를 바꾸면 재빌드하고, `client/src/components/Footer.tsx`의 크레딧과 `client/public/music/heartwarming-license.txt`도 새 곡에 맞춰 수정합니다.

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
