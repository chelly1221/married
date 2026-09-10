import { useId } from 'react';
import mapPng from '../assets/story-04-map-illustrated.png';
import mapWebp from '../assets/story-04-map-illustrated.webp';
import { useInView } from '../motion.tsx';
import { C } from '../tokens.ts';

// A painted map shares the story illustrations’ texture; SVG draws the routes above it.
// Illustrative stops express repeated visits, without claiming a specific itinerary.
const stops = [[118.6, 185.5], [277.5, 101.5], [292.9, 191.2], [205.7, 248.9], [307, 205]];
const routes = [
  'M118.6 185.5 Q179 36 277.5 101.5',
  'M277.5 101.5 Q346 120 292.9 191.2',
  'M292.9 191.2 Q208 159 205.7 248.9',
  'M205.7 248.9 Q238 160 307 205',
];

export function StoryMap() {
  const [ref, shown] = useInView(0.5);
  const id = useId().replace(/:/g, '');
  return (
    <div ref={ref} aria-hidden="true" style={{ width: 260, maxWidth: '100%' }}>
      <div style={{ position: 'relative', height: 0, paddingTop: `${(22 / 27) * 100}%`, overflow: 'hidden' }}>
        <picture className="story-map-background">
          <source type="image/webp" srcSet={mapWebp} />
          <img src={mapPng} alt="" decoding="async" width="864" height="704"
            style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: '100%', height: '100%', mixBlendMode: 'darken' }} />
        </picture>
        <svg
          className={`story-map${shown ? ' is-visible' : ''}`}
          viewBox="0 0 432 352"
          focusable="false"
          style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}
        >
          <defs>
            <filter id={`${id}-pencil`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency=".28 .55" numOctaves="3" seed="7" result="grain" />
              <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="rough-ink" />
              <feColorMatrix in="grain" type="matrix"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .9 .9 .9 0 -.65" result="paper-grain" />
              <feComposite in="rough-ink" in2="paper-grain" operator="in" />
            </filter>
          </defs>
          <g fill="none" stroke="#965238" strokeWidth="3.8" strokeLinecap="round" filter={`url(#${id}-pencil)`}>
            {routes.map((route, i) => (
              <path key={route} d={route} pathLength="1" className={`story-map-route story-map-route-${i + 1}`} />
            ))}
          </g>
          {stops.map(([x, y], i) => (
            <g key={i} className={`story-map-stop story-map-stop-${i}`} transform={`translate(${x} ${y})`}>
              <ellipse rx="4.6" ry="4.2" transform="rotate(-12)" fill={C.paper} stroke="#775a43" strokeWidth="1.4" />
              <circle r="2.1" fill="#a96c4d" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
