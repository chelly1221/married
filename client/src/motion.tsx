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

// 네이티브 스크롤의 현재 구간에 해당하는 장면 하나만 표시한다.
// 짧은 내용은 화면 중앙에 머물고, 긴 내용과 입력 폼은 문서 흐름대로 읽는다.
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
let focusedSceneHeight = '';
const smoothStep = (value: number) => {
  const p = Math.max(0, Math.min(1, value));
  return p * p * (3 - 2 * p);
};

function updateScenes() {
  const height = window.innerHeight;
  const top = document.querySelector('[data-scene-toolbar]')?.getBoundingClientRect().height ?? 52;
  const center = top + (height - top) / 2;
  const focus = document.activeElement;
  const readings = Array.from(scenes, (element) => {
    const rect = element.getBoundingClientRect();
    const content = element.firstElementChild as HTMLDivElement;
    return { element, content, rect, contentHeight: content.offsetHeight,
      focused: focus !== document.body && element.contains(focus) && rect.bottom > top && rect.top < height };
  });
  const selected = readings.find((item) => item.focused)
    ?? readings.find((item) => item.rect.top <= center && item.rect.bottom > center)
    ?? readings.reduce<typeof readings[number] | undefined>((nearest, item) => {
      const distance = Math.abs(item.rect.top + item.rect.height / 2 - center);
      return !nearest || distance < Math.abs(nearest.rect.top + nearest.rect.height / 2 - center) ? item : nearest;
    }, undefined);
  // 읽기 후에 쓰기를 모은다. 경계에서 이전 장면이 사라진 뒤 다음 장면이 나타난다.
  readings.forEach((item, index) => {
    const { element, content, rect, contentHeight, focused } = item;
    const active = item === selected;
    const fade = Math.max(1, Math.min(120, (height - top) * .16, rect.height * .2));
    const enter = index === 0 ? 1 : smoothStep((center - rect.top) / fade);
    const leave = index === readings.length - 1 ? 1 : smoothStep((rect.bottom - center) / fade);
    const opacity = active ? (focused ? 1 : Math.min(enter, leave)) : 0;
    const pin = active && !content.hasAttribute('data-scene-interactive') && contentHeight <= height - top - 24;
    const shift = pin ? center - (rect.top + rect.height / 2) : 0;
    content.style.opacity = opacity.toFixed(3);
    content.style.transform = shift ? `translate3d(0, ${shift.toFixed(2)}px, 0)` : 'none';
    content.style.pointerEvents = active ? '' : 'none';
    element.dataset.sceneActive = String(active);
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

function handleSceneFocus() {
  // 키보드가 올라와도 앞선 모든 장면의 높이가 줄어들어 스크롤 위치가 바뀌지 않게 한다.
  const editing = Array.from(scenes).some((element) => element.contains(document.activeElement));
  if (editing && !focusedSceneHeight) {
    const first = scenes.values().next().value;
    if (first) {
      focusedSceneHeight = getComputedStyle(first).minHeight;
      document.documentElement.style.setProperty('--focused-scene-height', focusedSceneHeight);
    }
  } else if (!editing && focusedSceneHeight) {
    focusedSceneHeight = '';
    document.documentElement.style.removeProperty('--focused-scene-height');
  }
  scheduleScenes();
}

function afterSceneBlur() {
  // 이름에서 메시지 입력칸으로 옮기는 경우 현재 초점을 다음 프레임에서 확인한다.
  requestAnimationFrame(handleSceneFocus);
}

function registerScene(element: HTMLDivElement) {
  if (!scenes.size) {
    window.addEventListener('scroll', scheduleScenes, { passive: true });
    window.addEventListener('resize', scheduleScenes, { passive: true });
    window.addEventListener('load', scheduleScenes, true);
    document.addEventListener('focusin', handleSceneFocus);
    document.addEventListener('focusout', afterSceneBlur);
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
    content.style.removeProperty('transform');
    content.style.removeProperty('pointer-events');
    delete element.dataset.sceneActive;
    if (!scenes.size) {
      window.removeEventListener('scroll', scheduleScenes);
      window.removeEventListener('resize', scheduleScenes);
      window.removeEventListener('load', scheduleScenes, true);
      document.removeEventListener('focusin', handleSceneFocus);
      document.removeEventListener('focusout', afterSceneBlur);
      focusedSceneHeight = '';
      document.documentElement.style.removeProperty('--focused-scene-height');
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
