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

// 각 내용은 문서 흐름대로 스크롤하고, 뷰포트 진입·퇴장에 따라 불투명도만 바꾼다.
const ScrollSceneContext = createContext(false);
const sceneMedia = typeof matchMedia === 'undefined' ? null
  : matchMedia('(prefers-reduced-motion: reduce)');
const sceneSnapshot = () => sceneMedia !== null && !sceneMedia.matches;
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
  const top = document.querySelector('[data-scene-toolbar]')?.getBoundingClientRect().height ?? 52;
  const bottom = height - 16;
  const documentHeight = document.documentElement.scrollHeight;
  const scroll = window.scrollY;
  const readings = Array.from(scenes, (element) => {
    const rect = element.getBoundingClientRect();
    const content = element.firstElementChild as HTMLDivElement;
    // 처음 보이는 조각부터 충분히 긴 거리 동안 페이드하되, 본문을 읽는 구간은 선명하게 둔다.
    const fade = Math.max(1, Math.min(height * .46, (bottom - top + rect.height) * .4));
    // 마지막 맺음말도 더 스크롤할 여지가 없는 문서 끝에서 완전히 나타나야 한다.
    const enterFade = Math.max(1, Math.min(fade, documentHeight - (scroll + rect.top) - 16));
    const enter = smoothStep((bottom - rect.top) / enterFade);
    const leave = smoothStep((rect.bottom - top) / fade);
    return { content, opacity: content.hasAttribute('data-scene-interactive') ? 1 : Math.min(enter, leave) };
  });
  // 모든 레이아웃 읽기를 마친 뒤 한 프레임에 불투명도만 쓴다.
  readings.forEach(({ content, opacity }) => {
    content.style.opacity = opacity.toFixed(3);
  });
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
  sceneResize?.observe(element.firstElementChild!);
  updateScenes();
  return () => {
    scenes.delete(element);
    sceneResize?.unobserve(element);
    const content = element.firstElementChild as HTMLDivElement;
    sceneResize?.unobserve(content);
    content.style.removeProperty('opacity');
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
    <div ref={ref} className="scroll-scene" data-scroll-scene="">
      <div {...props} data-scene-content="">
        <ScrollSceneContext.Provider value={active}>{children}</ScrollSceneContext.Provider>
      </div>
    </div>
  );
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
