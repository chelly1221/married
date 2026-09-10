import {
  CSSProperties, HTMLAttributes, ReactNode, createContext, useContext, useEffect,
  useLayoutEffect, useRef, useState, useSyncExternalStore,
} from 'react';

export const reducedMotion =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE = 'cubic-bezier(.2,.7,.2,1)';

// 뷰포트 진입 1회 감지. reduced-motion 이면 처음부터 true.
export function useInView(threshold = 0.12, disabled = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion || disabled) return;
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
  }, [threshold, disabled]);

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
  const inScrollScene = useContext(ScrollSceneContext);
  const [ref, shown] = useInView(0.12, inScrollScene);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{
        ...style,
        opacity: inScrollScene || shown ? 1 : 0,
        transform: inScrollScene || shown ? 'none' : from,
        transition: inScrollScene || reducedMotion
          ? undefined
          : `opacity ${duration}s ${EASE} ${delay}ms, transform ${duration}s ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// 모바일에서는 내용 한 묶음이 스크롤 위치에 따라 반복해서 나타나고 사라진다.
// 장의 중심이 아닌 양 끝을 기준으로 하므로 긴 본문은 읽는 동안 계속 선명하다.
const ScrollSceneContext = createContext(false);
const sceneMedia = typeof matchMedia === 'undefined' ? null
  : matchMedia('(max-width: 600px) and (prefers-reduced-motion: no-preference)');
const sceneSnapshot = () => sceneMedia?.matches ?? false;
const subscribeSceneMedia = (listener: () => void) => {
  if (!sceneMedia) return () => {};
  // 구형 모바일 WebView의 MediaQueryList도 지원한다.
  if (sceneMedia.addEventListener) {
    sceneMedia.addEventListener('change', listener);
    return () => sceneMedia.removeEventListener('change', listener);
  }
  sceneMedia.addListener(listener);
  return () => sceneMedia.removeListener(listener);
};

const scenes = new Set<HTMLDivElement>();
let sceneFrame = 0;
let sceneResize: ResizeObserver | undefined;
const smoothStep = (value: number) => {
  const p = Math.max(0, Math.min(1, value));
  return p * p * (3 - 2 * p);
};

function updateScenes() {
  const height = window.innerHeight;
  // 스크롤은 브라우저에 맡기고, 상단 언어·음악 바 아래부터 읽기 영역으로 잡는다.
  const top = Math.min(58, height * .12);
  const bottom = height - 16;
  const readings = Array.from(scenes, (element) => {
    const rect = element.getBoundingClientRect();
    const fade = Math.max(1, Math.min(180, height * .23, rect.height * .8));
    const enter = smoothStep((bottom - rect.top) / fade);
    const leave = smoothStep((rect.bottom - top) / fade);
    // 짧은 맺음말도 문서 최하단에서 완전히 표시되도록 한다.
    const fits = rect.top >= top && rect.bottom <= height;
    return { element, opacity: fits ? 1 : Math.min(enter, leave) };
  });
  // 레이아웃 읽기와 스타일 쓰기를 나누고, 모든 장면을 한 rAF에서 갱신한다.
  readings.forEach(({ element, opacity }) => { element.style.opacity = opacity.toFixed(3); });
}

function scheduleScenes() {
  if (!sceneFrame && scenes.size) {
    sceneFrame = requestAnimationFrame(() => {
      sceneFrame = 0;
      updateScenes();
    });
  }
}

function registerScene(element: HTMLDivElement) {
  if (!scenes.size) {
    window.addEventListener('scroll', scheduleScenes, { passive: true });
    window.addEventListener('resize', scheduleScenes, { passive: true });
    window.addEventListener('load', scheduleScenes, true);
    if (typeof ResizeObserver !== 'undefined') {
      sceneResize = new ResizeObserver(scheduleScenes);
      sceneResize.observe(document.body);
    }
    document.fonts?.ready.then(scheduleScenes);
  }
  scenes.add(element);
  sceneResize?.observe(element);
  updateScenes();
  return () => {
    scenes.delete(element);
    sceneResize?.unobserve(element);
    element.style.removeProperty('opacity');
    if (!scenes.size) {
      window.removeEventListener('scroll', scheduleScenes);
      window.removeEventListener('resize', scheduleScenes);
      window.removeEventListener('load', scheduleScenes, true);
      sceneResize?.disconnect();
      sceneResize = undefined;
      cancelAnimationFrame(sceneFrame);
      sceneFrame = 0;
    }
  };
}

export function ScrollScene({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useSyncExternalStore(subscribeSceneMedia, sceneSnapshot, () => false);
  useLayoutEffect(() => {
    if (active && ref.current) return registerScene(ref.current);
  }, [active]);
  return (
    <div {...props} ref={ref} data-scroll-scene="">
      <ScrollSceneContext.Provider value={active}>{children}</ScrollSceneContext.Provider>
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
