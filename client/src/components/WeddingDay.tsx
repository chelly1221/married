import { Strings } from '../i18n.ts';
import { EASE, Reveal, reducedMotion, useCountUp, useInView } from '../motion.tsx';
import { C, DATE_HIDDEN, F, RELATIONSHIP_START, WEDDING } from '../tokens.ts';

interface Cell {
  label: string;
  mark: boolean;
}

function calendarCells(): Cell[] {
  const first = new Date(WEDDING.y, WEDDING.m, 1).getDay();
  const len = new Date(WEDDING.y, WEDDING.m + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < first; i++) cells.push({ label: '', mark: false });
  for (let i = 1; i <= len; i++) cells.push({ label: String(i), mark: i === WEDDING.d });
  return cells;
}

const CELL_STAGGER = 14; // ms per cell

export function WeddingDay({ t }: { t: Strings }) {
  const cells = calendarCells();
  const today = new Date();
  // 방문자의 현지 날짜를 기준으로 계산하며, 일광절약시간에 따른 하루 오차를 피한다.
  // 연애 시작일은 D+0, 다음 날은 D+1이다.
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const startDay = Date.UTC(RELATIONSHIP_START.y, RELATIONSHIP_START.m, RELATIONSHIP_START.d);
  const target = Math.max(0, Math.floor((todayDay - startDay) / 86400000));

  const [gridRef, gridShown] = useInView(0.2);
  const [dRef, dShown] = useInView(0.4);
  const dplus = useCountUp(target, dShown);

  // 날짜들이 다 깔린 뒤 혼인일 원이 눌러 찍힌다
  const markDelay = cells.length * CELL_STAGGER + 250;

  return (
    <div
      style={{
        padding: '52px 40px 58px',
        background: C.paperDeep,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        alignItems: 'center',
      }}
    >
      <Reveal>
        <div style={{ font: `400 12px/1 ${F.batang}`, letterSpacing: '.34em', color: C.muteLight }}>{t.weddingLabel}</div>
      </Reveal>
      <Reveal delay={120}>
        <div style={{ font: `400 21px/1.4 ${F.myeongjo}`, letterSpacing: '.1em' }}>
          {DATE_HIDDEN ? t.dateMasked : t.dateFull}
        </div>
      </Reveal>
      {DATE_HIDDEN ? null : (
        <>
          <Reveal delay={200} style={{ width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                font: `400 12px/1 ${F.batang}`,
                color: C.muteLighter,
                paddingBottom: 4,
              }}
            >
              {t.dows.map((w, i) => (
                <div key={i} style={{ textAlign: 'center', letterSpacing: '.06em' }}>
                  {w}
                </div>
              ))}
            </div>
          </Reveal>
          <div
            ref={gridRef}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '9px 0',
              font: `400 13px/1 ${F.batang}`,
              marginTop: -12,
            }}
          >
            {cells.map((d, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: gridShown ? 1 : 0,
                  transform: gridShown ? 'none' : 'translateY(8px)',
                  transition: reducedMotion
                    ? undefined
                    : `opacity .55s ${EASE} ${i * CELL_STAGGER}ms, transform .55s ${EASE} ${i * CELL_STAGGER}ms`,
                }}
              >
                {d.mark && (
                  <span
                    style={{
                      position: 'absolute',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: C.accent,
                      opacity: gridShown ? 1 : 0,
                      transform: gridShown ? 'scale(1)' : 'scale(0)',
                      transition: reducedMotion
                        ? undefined
                        : `transform .5s cubic-bezier(.34,1.56,.64,1) ${markDelay}ms, opacity .3s ease ${markDelay}ms`,
                    }}
                  />
                )}
                <span style={{ position: 'relative', color: d.mark ? C.paper : C.ink70 }}>{d.label}</span>
              </div>
            ))}
          </div>
          <div
            ref={dRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              opacity: dShown ? 1 : 0,
              transform: dShown ? 'none' : 'translateY(14px)',
              transition: reducedMotion ? undefined : `opacity .9s ${EASE}, transform .9s ${EASE}`,
            }}
          >
            <div style={{ font: `400 11.5px/1 ${F.batang}`, letterSpacing: '.22em', color: C.muteLight }}>{t.dplusLabel}</div>
            <div style={{ font: `400 30px/1 ${F.myeongjo}`, letterSpacing: '.06em', color: C.accent }}>D+{dplus}</div>
          </div>
        </>
      )}
    </div>
  );
}
