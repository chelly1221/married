import { Strings } from '../i18n.ts';
import { Lines } from '../lines.tsx';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';

export function Footer({ t }: { t: Strings }) {
  return (
    <div
      style={{
        padding: '40px 40px 58px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <Reveal from="scaleY(0)" style={{ transformOrigin: 'top' }} duration={0.9}>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(rgba(33,32,29,.3), transparent)' }} />
      </Reveal>
      <Reveal delay={140}>
        <div style={{ font: `400 14px/2 ${F.batang}`, color: C.ink60 }}>
          <Lines lines={t.footerThanks} />
        </div>
      </Reveal>
      <Reveal delay={280}>
        <div style={{ font: `400 11px/1 ${F.mono}`, letterSpacing: '.2em', color: C.roman }}>{t.footerSig}</div>
      </Reveal>
    </div>
  );
}
