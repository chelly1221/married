import { Fragment } from 'react';

// i18n 카탈로그의 줄 배열을 <br> 로 이어 렌더
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {l}
        </Fragment>
      ))}
    </>
  );
}
