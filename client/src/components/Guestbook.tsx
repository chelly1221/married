import { useState } from 'react';
import { Entry } from '../api.ts';
import { Strings } from '../i18n.ts';
import { Reveal } from '../motion.tsx';
import { C, F } from '../tokens.ts';

interface Props {
  t: Strings;
  entries: Entry[];
  submit: (name: string, msg: string) => Promise<boolean>;
}

export function Guestbook({ t, entries, submit }: Props) {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const n = name.trim();
    const m = msg.trim();
    if (!n || !m || busy) return;
    setBusy(true);
    const ok = await submit(n, m);
    setBusy(false);
    if (ok) {
      setName('');
      setMsg('');
      setErr(false);
    } else {
      setErr(true);
    }
  };

  return (
    <div style={{ padding: '56px 34px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Reveal>
        <div style={{ textAlign: 'center', font: `400 12px/1 ${F.batang}`, letterSpacing: '.34em', color: C.muteLight }}>
          {t.gbLabel}
        </div>
      </Reveal>
      <Reveal delay={120} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.gbName}
          maxLength={40}
          style={{
            border: 'none',
            borderBottom: '1px solid rgba(33,32,29,.2)',
            background: 'transparent',
            padding: '10px 2px',
            font: `400 14px/1.4 ${F.batang}`,
            color: C.ink,
            outline: 'none',
          }}
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={t.gbMsg}
          rows={3}
          maxLength={500}
          style={{
            border: '1px solid rgba(33,32,29,.16)',
            background: 'rgba(255,255,255,.55)',
            borderRadius: 3,
            padding: 12,
            font: `400 14px/1.8 ${F.batang}`,
            color: C.ink,
            outline: 'none',
            resize: 'none',
          }}
        />
        <button
          onClick={onSubmit}
          style={{
            border: `1px solid ${C.ink}`,
            background: C.ink,
            color: C.paper,
            padding: 13,
            borderRadius: 3,
            font: `400 13px/1 ${F.batang}`,
            letterSpacing: '.16em',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {t.gbSubmit}
        </button>
        {err && (
          <div style={{ textAlign: 'center', font: `400 12px/1.6 ${F.batang}`, color: C.accent }}>{t.gbError}</div>
        )}
      </Reveal>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 6 }}>
        {entries.map((g, i) => (
          <Reveal
            key={g.id}
            delay={Math.min(i, 6) * 70}
            from="translateY(14px)"
            duration={0.7}
            style={{
              borderTop: '1px solid rgba(33,32,29,.12)',
              paddingTop: 13,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ font: `400 13.5px/1 ${F.myeongjo}`, letterSpacing: '.06em' }}>{g.name}</span>
              <span style={{ font: `400 10.5px/1 ${F.mono}`, color: C.muteLighter }}>{g.at}</span>
            </div>
            <div style={{ font: `400 13.5px/1.9 ${F.batang}`, color: C.ink70, whiteSpace: 'pre-line' }}>{g.msg}</div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
