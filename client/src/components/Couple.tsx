import { Strings } from '../i18n.ts';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';

function PersonBlock({ p }: { p: Strings['groom'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
      <div style={{ font: `400 12.5px/1 ${F.batang}`, letterSpacing: '.2em', color: C.accent }}>{p.role}</div>
      <div style={{ font: `400 25px/1.3 ${F.myeongjo}`, letterSpacing: '.08em' }}>
        {p.name}
        {p.note && <span style={{ fontSize: 15, color: '#8a8172' }}> {p.note}</span>}
      </div>
      <div style={{ font: `400 11px/1 ${F.mono}`, letterSpacing: '.16em', color: C.roman }}>{p.roman}</div>
      <div style={{ font: `400 13px/1.9 ${F.batang}`, color: C.ink50, marginTop: 2 }}>{p.parents}</div>
    </div>
  );
}

export function Couple({ t }: { t: Strings }) {
  return (
    <div style={{ padding: '56px 40px', display: 'flex', flexDirection: 'column', gap: 36 }}>
      <Reveal>
        <div style={{ textAlign: 'center', font: `400 12px/1 ${F.batang}`, letterSpacing: '.34em', color: C.muteLight }}>
          {t.coupleLabel}
        </div>
      </Reveal>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Reveal delay={120}>
          <PersonBlock p={t.groom} />
        </Reveal>
        {/* 구분선 — 가운데 다이아몬드에서 좌우로 그어진다 */}
        <Reveal delay={260} from="scaleX(.35)" duration={0.9} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(33,32,29,.14)' }} />
          <div style={{ width: 5, height: 5, background: C.accent, transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'rgba(33,32,29,.14)' }} />
        </Reveal>
        <Reveal delay={380}>
          <PersonBlock p={t.bride} />
        </Reveal>
      </div>
    </div>
  );
}
