// 디자인 핸드오프의 토큰 표 (design/README.md · Design Tokens 절)

export const C = {
  paper: '#f4efe6',
  paperDeep: '#efe8dc',
  ink: '#21201d',
  ink80: '#3c3831',
  ink70: '#4a453d',
  ink60: '#5c564d',
  ink50: '#6b6459',
  mute: '#7d7669',
  muteLight: '#9a9184',
  muteLighter: '#a29a8e',
  roman: '#a89f91',
  accent: '#9c3b2e',
  photoA: '#ddd5c6',
  photoB: '#e6ded1',
  caption: '#8a8172',
} as const;

export const F = {
  batang: "'Gowun Batang', serif",
  myeongjo: "'Nanum Myeongjo', serif",
  mono: 'ui-monospace, monospace',
} as const;

// 혼인일 — 캘린더·날짜 표기의 단일 출처
export const WEDDING = { y: 2026, m: 5, d: 20 } as const;
// 연애 시작일 — 함께한 날(D+)의 기준. 월은 0부터 시작한다.
export const RELATIONSHIP_START = { y: 2025, m: 1, d: 12 } as const;
// 날짜 비공개 스위치 — true 면 히어로·혼인한 날 섹션이 ????. ??. ?? 로 가려지고 캘린더·D+ 는 숨긴다.
export const DATE_HIDDEN = true;
export const DATE_DOT = DATE_HIDDEN ? '????. ??. ??' : '2026. 06. 20';
