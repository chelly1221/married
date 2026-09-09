import { Fragment } from 'react';
import { Strings } from '../i18n.ts';
import { Lines } from '../lines.tsx';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';

export function Greeting({ t }: { t: Strings }) {
  return (
    <div
      style={{
        padding: '62px 40px 54px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Reveal from="rotate(45deg) scale(.55)" duration={0.9}>
        <div style={{ width: 24, height: 24, border: '1px solid rgba(156,59,46,.5)', transform: 'rotate(45deg)' }} />
      </Reveal>
      <Reveal delay={140}>
        <div className="pretty" style={{ font: `400 15.5px/2.5 ${F.batang}`, color: C.ink80 }}>
          {t.greetingParas.map((lines, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <>
                  <br />
                  <br />
                </>
              )}
              <Lines lines={lines} />
            </Fragment>
          ))}
        </div>
      </Reveal>
      <Reveal delay={280}>
        <div style={{ font: `400 12.5px/1.9 ${F.batang}`, color: C.accent }}>
          <Lines lines={t.notice} />
        </div>
      </Reveal>
    </div>
  );
}
