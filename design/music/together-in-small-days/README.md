# 작은 날들을 함께

이 결혼 알림 페이지를 위해 Codex가 새로 작곡하고 음색을 합성한 배경음악이다.
선율·반주·저음을 음표로 작성한 뒤, 직접 구현한 감쇠 배음 합성으로 부드러운 피아노 음색을 만들었다.
다른 곡의 음원·MIDI·악보·사운드폰트·악기 샘플을 가져오지 않았다.

- 곡명: **작은 날들을 함께 / Together in Small Days**
- 편성: 피아노 음색의 선율·분산화음·저음
- 조성·박자: F장조, 4/4, 76 BPM
- 구성: 32마디, A–A′–B–A″, 약 1분 44초(마지막 잔향 포함)
- 배포 음원: `client/src/assets/together-in-small-days.mp3`, 44.1 kHz 스테레오, 192 kbps

## 제작 원본

- `score.json`: 직접 작성한 음표와 길이·세기. 음악 내용의 원본이다.
- `composition.md`: 문답형 동기와 화성·구성 설명.
- `together-in-small-days.mid`: 악보 편집기로 열 수 있는 MIDI. 렌더러가 `score.json`에서 내보낸다.
- `render.py`: 약하게 비조화적인 배음·짝현·해머 타격·댐퍼 감쇠·작은 공간의 잔향을 합성한다.
  고정 난수 시드를 사용하며 음표의 시각·세기만 미세하게 조절한다. 멜로디는 난수로 생성하지 않는다.
- `render-info.json`: 렌더링한 음표 수, 길이, 샘플레이트, 목표 음량, 결과 파일 SHA-256 기록.

## 다시 만들기

저장소 루트에서 실행한다. Python·NumPy·SciPy·FFmpeg는 제작용 컨테이너에만 설치한다.
웹 서버에는 결과 MP3만 포함되며, 방문자의 기기에서 음원을 합성하지 않는다.

```sh
docker build -t married-original-music-render -f design/music/together-in-small-days/Dockerfile design/music/together-in-small-days
docker run --rm -v "$PWD:/work" -v /tmp/married-original-music:/output married-original-music-render --output-dir /output
```

중간 무손실 WAV는 `/tmp/married-original-music/together-in-small-days-mix.wav`에 쓴다.
최종 MP3와 MIDI·렌더링 기록은 저장소의 해당 경로에 쓴다. `data/`의 실제 방명록이나 사용자 미디어는 건드리지 않는다.
FFmpeg는 합성된 WAV의 음량을 두 번 측정·보정한 뒤 MP3로 인코딩한다(목표 -20 LUFS, 최대 true peak -2 dBTP).
패키지 버전이 달라지면 인코딩 결과 바이트는 달라질 수 있다.
악보와 합성 소스가 그대로이고 음량·인코딩만 다시 처리할 때는 같은 실행 명령 끝에 `--master-only`를 붙여
기존 중간 WAV를 재사용할 수 있다. 악보나 음색을 바꿨다면 전체 렌더링을 실행한다.

음원을 수정한 뒤에는 클라이언트를 다시 빌드·배포한다. 사이트는 상단 음악 버튼을 클릭할 때만 재생하고,
볼륨 0.3으로 반복하며 새로고침할 때 꺼진 상태로 시작한다. 반복 지점은 완전한 종지와 짧은 잔향 여백을 둔다.
