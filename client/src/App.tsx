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
import { detectLocale, Locale, STRINGS } from './i18n.ts';
import { useMusic } from './music.ts';
import { ScrollScene } from './motion.tsx';

export default function App() {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const t = STRINGS[locale];
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
      <ScrollScene><Hero t={t} /></ScrollScene>
      <ScrollScene><Greeting t={t} /></ScrollScene>
      <ScrollScene><PhotoSection /></ScrollScene>
      <ScrollScene><Couple t={t} /></ScrollScene>
      <Story t={t} />
      <ScrollScene><WeddingDay t={t} /></ScrollScene>
      <ScrollScene data-scene-interactive=""><Guestbook t={t} entries={entries} submit={submit} /></ScrollScene>
      <ScrollScene><Footer t={t} /></ScrollScene>
    </div>
  );
}
