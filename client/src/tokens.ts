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
export const WEDDING = { y: 2026, m: 8, d: 18 } as const;
// 연애 시작일 — 함께한 날(D+)의 기준. 월은 0부터 시작한다.
export const RELATIONSHIP_START = { y: 2025, m: 1, d: 12 } as const;
// 날짜 비공개 스위치 — true 면 히어로·혼인한 날 섹션이 ????. ??. ?? 로 가려지고 캘린더·D+ 는 숨긴다.
export const DATE_HIDDEN = false;
export const DATE_DOT = DATE_HIDDEN ? '????. ??. ??' : '2026. 09. 18';

// 방문자의 현지 날짜가 혼인일 이상이면 'after'(혼인 후 카피), 아니면 'before'.
export function weddingPhase(now = new Date()): 'before' | 'after' {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const wedding = new Date(WEDDING.y, WEDDING.m, WEDDING.d).getTime();
  return today >= wedding ? 'after' : 'before';
}

// 다음 현지 자정까지 남은 ms — 혼인일 자정을 넘기면 카피를 바꾸기 위해 쓴다.
export function msUntilNextMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  return Math.max(1000, next - now.getTime());
}
