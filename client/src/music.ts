import { useEffect, useRef, useState } from 'react';

// 배경음악. 음원은 data/media/bgm.mp3 로 드롭하면 서버가 /media/bgm.mp3 로 서빙한다.
// 파일이 없으면 토글 버튼 자체를 숨긴다. 자동재생은 하지 않고(브라우저 정책 준수),
// 세션 내 재방문 시 이전 on 상태를 시도만 해 보고 막히면 조용히 off 로 둔다.
const BGM_URL = '/media/bgm.mp3';

export function useMusic() {
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const start = () => {
    if (!audioRef.current) {
      const a = new Audio(BGM_URL);
      a.loop = true;
      a.volume = 0.3;
      audioRef.current = a;
    }
    audioRef.current
      .play()
      .then(() => setOn(true))
      .catch(() => setOn(false));
  };

  useEffect(() => {
    let cancelled = false;
    fetch(BGM_URL, { method: 'HEAD' })
      .then((r) => {
        if (cancelled || !r.ok) return;
        setAvailable(true);
        if (sessionStorage.getItem('music') === '1') start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    if (on) {
      audioRef.current?.pause();
      setOn(false);
      sessionStorage.setItem('music', '0');
    } else {
      sessionStorage.setItem('music', '1');
      start();
    }
  };

  return { available, on, toggle };
}
