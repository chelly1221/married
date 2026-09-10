import { useState } from 'react';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';

// 기본은 장식 밴드 — 한지 결 위에 주사(朱砂) 囍 인장. 사진 없이 쓰는 것이 기본값이다.
// 실제 사진을 쓰려면 data/media/couple.jpg (세로 4:5) 드롭 → /media/couple.jpg 로드에
// 성공하면 장식을 대체한다(cover). 재빌드 불필요.
const PHOTO_URL = '/media/couple.jpg';

export function PhotoSection() {
  const [loaded, setLoaded] = useState(false);

  return (
    <Reveal style={{ position: 'relative', height: 460, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: '-14% 0',
          background: `radial-gradient(58% 44% at 50% 50%, rgba(255,255,255,.75), transparent 70%), repeating-linear-gradient(93deg, rgba(33,32,29,.045) 0 1px, transparent 1px 4px), ${C.paperDeep}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!loaded && (
          <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* 헤어라인은 도장에서 바깥으로 자라나고(350ms), 囍는 눌러 찍히듯 들어온다(200ms) */}
            <Reveal delay={350} from="scaleY(0)" style={{ transformOrigin: 'bottom' }}>
              <div style={{ width: 1, height: 46, background: 'linear-gradient(transparent, rgba(33,32,29,.35))' }} />
            </Reveal>
            <Reveal delay={200} from="scale(1.16)" duration={0.9}>
              <div style={{ font: `400 54px/1 ${F.myeongjo}`, color: C.accent }}>囍</div>
            </Reveal>
            <Reveal delay={350} from="scaleY(0)" style={{ transformOrigin: 'top' }}>
              <div style={{ width: 1, height: 46, background: 'linear-gradient(rgba(33,32,29,.35), transparent)' }} />
            </Reveal>
          </div>
        )}
        <img
          src={PHOTO_URL}
          alt=""
          onLoad={() => setLoaded(true)}
          style={{
            display: loaded ? 'block' : 'none',
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </Reveal>
  );
}
