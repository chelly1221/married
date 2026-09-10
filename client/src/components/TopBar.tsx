import { LOCALES, Locale, Strings } from '../i18n.ts';
import { C, F } from '../tokens.ts';

interface Props {
  t: Strings;
  locale: Locale;
  setLocale: (l: Locale) => void;
  music: { available: boolean; on: boolean; toggle: () => void };
}

export function TopBar({ t, locale, setLocale, music }: Props) {
  return (
    <div
      data-scene-toolbar=""
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        background: 'linear-gradient(#f4efe6 58%, rgba(244,239,230,0))',
      }}
    >
      <div style={{ display: 'flex', gap: 11, font: `400 11px/1 ${F.batang}`, letterSpacing: '.14em' }}>
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLocale(key)}
            aria-pressed={locale === key}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              letterSpacing: 'inherit',
              color: locale === key ? C.ink : C.muteLighter,
              borderBottom: `1px solid ${locale === key ? C.ink : 'transparent'}`,
              paddingBottom: 2,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {music.available && (
        <button
          type="button"
          onClick={music.toggle}
          aria-pressed={music.on}
          style={{
            border: '1px solid rgba(33,32,29,.22)',
            background: 'transparent',
            color: C.ink,
            borderRadius: 999,
            padding: '5px 11px',
            font: `400 11px/1 ${F.batang}`,
            letterSpacing: '.1em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {music.on ? t.musicStop : t.musicPlay}
        </button>
      )}
    </div>
  );
}
