import { useEffect, useState } from 'react';
import { useGuestbook } from './api.ts';
import { Couple } from './components/Couple.tsx';
import { Footer } from './components/Footer.tsx';
import { Greeting } from './components/Greeting.tsx';
import { Guestbook } from './components/Guestbook.tsx';
import { Hero } from './components/Hero.tsx';
import { PhotoSection } from './components/PhotoSection.tsx';
import { Story } from './components/Story.tsx';
import { TopBar } from './components/TopBar.tsx';
import { WeddingDay } from './components/WeddingDay.tsx';
import { detectLocale, getStrings, Locale, Phase } from './i18n.ts';
import { useMusic } from './music.ts';
import { ScrollScene } from './motion.tsx';
import { msUntilNextMidnight, weddingPhase } from './tokens.ts';

export default function App() {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const [phase, setPhase] = useState<Phase>(weddingPhase);
  const t = getStrings(locale, phase);

  // 혼인일 전에 열어 둔 화면이 자정을 넘기면 혼인 후 카피로 바뀐다.
  useEffect(() => {
    if (phase === 'after') return;
    const id = window.setTimeout(() => setPhase(weddingPhase()), msUntilNextMidnight());
    return () => window.clearTimeout(id);
  }, [phase]);
  const music = useMusic();
  const { entries, submit } = useGuestbook();

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.docTitle;
  }, [t]);

  return (
    <div style={{ maxWidth: 430, margin: '0 auto' }}>
      <TopBar t={t} locale={locale} setLocale={setLocale} music={music} />
      <div className="page-sections">
        <ScrollScene><Hero t={t} /></ScrollScene>
        <ScrollScene><Greeting t={t} /></ScrollScene>
        <ScrollScene><PhotoSection /></ScrollScene>
        <ScrollScene><Couple t={t} /></ScrollScene>
        <Story t={t} />
        <ScrollScene><WeddingDay t={t} /></ScrollScene>
        <ScrollScene data-scene-interactive=""><Guestbook t={t} entries={entries} submit={submit} /></ScrollScene>
        <ScrollScene><Footer t={t} /></ScrollScene>
      </div>
    </div>
  );
}
