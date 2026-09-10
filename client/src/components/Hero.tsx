import { Strings } from '../i18n.ts';
import { Lines } from '../lines.tsx';
import { Reveal, useParallax } from '../motion.tsx';
import { C, DATE_DOT, F } from '../tokens.ts';

export function Hero({ t }: { t: Strings }) {
  const par = useParallax(0.14);

  return (
    <section
      className="hero-scene"
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 34px',
      }}
    >
      <div
        ref={par}
        style={{
          position: 'absolute',
          inset: '-12% -20%',
          background:
            'radial-gradient(58% 44% at 50% 34%, rgba(255,255,255,.9), transparent 70%), repeating-linear-gradient(93deg, rgba(33,32,29,.045) 0 1px, transparent 1px 4px)',
        }}
      />
      <div
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}
      >
        <Reveal>
          <div style={{ writingMode: 'vertical-rl', font: `400 13px/1 ${F.myeongjo}`, letterSpacing: '.5em', color: C.accent }}>
            {t.seal}
          </div>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
          <Reveal delay={150}>
            <div style={{ font: `400 14px/1 ${F.batang}`, letterSpacing: '.42em', color: C.mute }}>{t.heroLabel}</div>
          </Reveal>
          <Reveal delay={320} from="scaleY(0)" style={{ transformOrigin: 'top' }}>
            <div style={{ width: 1, height: 42, background: 'linear-gradient(rgba(33,32,29,.4), transparent)' }} />
          </Reveal>
          <Reveal delay={420}>
            <div style={{ font: `400 ${t.heroNameSize}px/1.35 ${F.myeongjo}`, letterSpacing: '.08em', textAlign: 'center' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{t.heroGroom}</span>
              <span style={{ color: C.accent, padding: '0 9px' }}>·</span>
              <span style={{ whiteSpace: 'nowrap' }}>{t.heroBride}</span>
            </div>
          </Reveal>
          <Reveal delay={560}>
            <div className="pretty prose" style={{ font: `400 15px/1.9 ${F.batang}`, letterSpacing: '.05em', color: C.ink60, textAlign: 'center' }}>
              <Lines lines={t.heroMsg} />
            </div>
          </Reveal>
        </div>
        <Reveal delay={700}>
          <div style={{ font: `400 12px/1 ${F.mono}`, letterSpacing: '.24em', color: C.muteLight }}>{DATE_DOT}</div>
        </Reveal>
      </div>
      <div
        style={{ position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}
      >
        <div
          style={{
            font: `400 11px/1 ${F.batang}`,
            letterSpacing: '.3em',
            color: C.ink,
            animation: 'hint 2.4s ease-in-out infinite',
          }}
        >
          {t.scrollHint}
        </div>
      </div>
    </section>
  );
}
