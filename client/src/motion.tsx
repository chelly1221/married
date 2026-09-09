import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

export const reducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE = 'cubic-bezier(.2,.7,.2,1)';

// 뷰포트 진입 1회 감지. reduced-motion 이면 처음부터 true.
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, shown] as const;
}

// 스크롤 리빌 — 진입 시 1회. delay(ms)로 섹션 내 순차 안무, from 으로 등장 변형을 바꾼다
// (예: 'scaleY(0)' 헤어라인 드로잉, 'scale(1.14)' 도장 찍힘).
interface RevealProps {
  style?: CSSProperties;
  children?: ReactNode;
  delay?: number;
  from?: string;
  duration?: number; // seconds
}

export function Reveal({ style, children, delay = 0, from = 'translateY(26px)', duration = 1.1 }: RevealProps) {
  const [ref, shown] = useInView(0.12);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : from,
        transition: reducedMotion
          ? undefined
          : `opacity ${duration}s ${EASE} ${delay}ms, transform ${duration}s ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// 패럴랙스 — 부모 요소가 뷰포트 중앙에서 벗어난 만큼 반대로 이동(rAF 스로틀).
export function useParallax(factor: number) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = parent.getBoundingClientRect();
      const rel = r.top - window.innerHeight / 2 + r.height / 2;
      el.style.transform = `translate3d(0, ${(-rel * factor).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [factor]);

  return ref;
}

// 스크롤 퇴장 — 스크롤 진행도(scrollY/range)에 따라 서서히 사라지고,
// drift 배율만큼 스크롤보다 느리게 따라와(lag) 깊이감을 준다. 히어로 전용.
export function useScrollExit(range = 420, drift = 0.25) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / range));
      el.style.opacity = (1 - p).toFixed(3);
      el.style.transform = `translate3d(0, ${(y * drift).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [range, drift]);

  return ref;
}

// 숫자 카운트업 (easeOutCubic). run 이 true 가 된 시점부터 target 까지.
export function useCountUp(target: number, run: boolean, duration = 1400) {
  const [val, setVal] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (!run) return;
    if (reducedMotion) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);

  return val;
}
