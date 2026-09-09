import { useEffect, useRef, useState } from 'react';
import defaultBgm from './assets/together-in-small-days.mp3';

// 사용자가 제공한 data/media/bgm.mp3가 있으면 우선 사용하고, 없으면 기본 피아노곡을 재생한다.
// 오디오는 클릭할 때만 만들고 재생한다. 새로고침 후에는 항상 꺼진 상태로 시작한다.
const CUSTOM_BGM_URL = '/media/bgm.mp3';

export function useMusic() {
  const [source, setSource] = useState('');
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(CUSTOM_BGM_URL, { method: 'HEAD' })
      .then((response) => {
        if (!cancelled) setSource(response.ok ? CUSTOM_BGM_URL : defaultBgm);
      })
      .catch(() => {
        if (!cancelled) setSource(defaultBgm);
      });
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    if (!source) return;
    if (on) {
      audioRef.current?.pause();
      setOn(false);
      return;
    }
    if (!audioRef.current) {
      const audio = new Audio(source);
      audio.preload = 'none';
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    audio.play()
      .then(() => setOn(!audio.paused))
      .catch(() => setOn(false));
  };

  return { available: !!source, on, toggle };
}
