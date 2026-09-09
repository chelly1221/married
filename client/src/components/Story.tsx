import { Fragment } from 'react';
import spritePng from '../assets/story-01-sprite.png';
import spriteWebp from '../assets/story-01-sprite.webp';
import bicyclePng from '../assets/story-02-sprite.png';
import bicycleWebp from '../assets/story-02-sprite.webp';
import flightPng from '../assets/story-03-sprite.png';
import flightWebp from '../assets/story-03-sprite.webp';
import homePng from '../assets/story-05-sprite.png';
import homeWebp from '../assets/story-05-sprite.webp';
import { Strings } from '../i18n.ts';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';
import { StoryMap } from './StoryMap.tsx';

const storyArt = [
  { png: spritePng, webp: spriteWebp },
  { png: bicyclePng, webp: bicycleWebp },
  { png: flightPng, webp: flightWebp },
  null,
  { png: homePng, webp: homeWebp },
];

// 1·2·3·5장은 스프라이트, 4장은 SVG 지도 위 경로를 순차적으로 그린다.
// 3×3 스프라이트 시트(432×352 프레임)를
// 클리핑 박스 안에서 CSS steps 로 넘긴다(.sprite-3x3, index.css). 박스 비율은 aspect-ratio 대신
// padding-top 으로 잡고 이미지는 즉시 로드한다 — 위챗 내장 브라우저(X5·구형 WKWebView)까지 고려.
// 주변 문장이 장면을 설명하므로 장식 이미지로 취급한다(aria-hidden).
function StoryArt({ chapter }: { chapter: number }) {
  const art = storyArt[chapter];
  if (!art) return null;
  return (
    <div aria-hidden="true" style={{ width: 260, maxWidth: '100%' }}>
      <div style={{ position: 'relative', height: 0, paddingTop: `${(22 / 27) * 100}%`, overflow: 'hidden' }}>
        <picture>
          <source type="image/webp" srcSet={art.webp} />
          <img
            className="sprite-3x3"
            src={art.png}
            alt=""
            decoding="async"
            style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: '300%', height: 'auto' }}
          />
        </picture>
      </div>
    </div>
  );
}

// 두 사람의 이야기 — 인사말과 같은 어조의 짧은 산문 다섯 장. 장과 장 사이는 히어로·사진
// 섹션에서 쓰는 세로 헤어라인이 위에서 아래로 그어지며 잇는다. 연출은 기존 Reveal 만 쓴다.
export function Story({ t }: { t: Strings }) {
  return (
    <div
      style={{
        padding: '58px 40px 62px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Reveal style={{ marginBottom: 8 }}>
        <div style={{ font: `400 12px/1 ${F.batang}`, letterSpacing: '.34em', color: C.muteLight }}>{t.storyLabel}</div>
      </Reveal>
      {t.story.map((ch, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <Reveal from="scaleY(0)" duration={0.9} style={{ transformOrigin: 'top' }}>
              <div style={{ width: 1, height: 34, background: 'linear-gradient(transparent, rgba(33,32,29,.35), transparent)' }} />
            </Reveal>
          )}
          <div data-story-chapter={i + 1} style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            {(storyArt[i] || i === 3) && (
              <Reveal style={{ marginBottom: 10, mixBlendMode: i === 2 || i === 4 ? 'darken' : undefined }}>
                {i === 3 ? <StoryMap /> : <StoryArt chapter={i} />}
              </Reveal>
            )}
            <Reveal>
              <div style={{ font: `400 12.5px/1 ${F.batang}`, letterSpacing: '.2em', color: C.accent }}>{ch.mark}</div>
            </Reveal>
            <Reveal delay={120}>
              <p className="pretty prose" style={{ margin: 0, font: `400 15px/2.2 ${F.batang}`, color: C.ink80 }}>
                {ch.text}
              </p>
            </Reveal>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
