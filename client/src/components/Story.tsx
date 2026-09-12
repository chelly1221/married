import spritePng from '../assets/story-01-sprite.png';
import spriteWebp from '../assets/story-01-sprite.webp';
import bicyclePng from '../assets/story-02-sprite.png';
import bicycleWebp from '../assets/story-02-sprite.webp';
import flightPng from '../assets/story-03-sprite.png';
import flightWebp from '../assets/story-03-sprite.webp';
import homePng from '../assets/story-05-sprite.png';
import homeWebp from '../assets/story-05-sprite.webp';
import { Strings } from '../i18n.ts';
import { Reveal, ScrollScene } from '../motion.tsx';
import { C, F } from '../tokens.ts';

const storyArt = [
  { png: spritePng, webp: spriteWebp },
  { png: bicyclePng, webp: bicycleWebp },
  { png: flightPng, webp: flightWebp },
  { png: homePng, webp: homeWebp },
];

// 네 장 모두 3×3 스프라이트 시트(432×352 프레임)를
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

// 두 사람의 이야기 — 인사말과 같은 어조의 짧은 산문 네 장.
// 각 장의 라벨·삽화·장 제목·본문이 자연스럽게 스크롤되며 함께 페이드한다.
export function Story({ t }: { t: Strings }) {
  return (
    <div className="story-sections">
      {t.story.map((ch, i) => (
        <ScrollScene
          key={i}
          data-story-chapter={i + 1}
          style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}
        >
          <Reveal style={{ marginBottom: 8 }}>
            <div style={{ font: `400 12px/1 ${F.batang}`, letterSpacing: '.34em', color: C.muteLight }}>{t.storyLabel}</div>
          </Reveal>
          {storyArt[i] && (
            <Reveal style={{ marginBottom: 10, mixBlendMode: i >= 2 ? 'darken' : undefined }}>
              <StoryArt chapter={i} />
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
        </ScrollScene>
      ))}
    </div>
  );
}
