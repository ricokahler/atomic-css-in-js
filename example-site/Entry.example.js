import React, { lazy, Suspense } from 'react';
import { createStyles, css } from 'atomic-css-in-js';
import ModuleA from './ModuleA.example';
const ModuleB = lazy(() => import('./ModuleB.example'));

export const styles = createStyles({
  root: css`
    border: 1px solid red;
    background-color: blue;
  `,
});

function Entry() {
  return (
    <div className={styles.root}>
      <Suspense fallback={<>Loading…</>}>
        <ModuleA />
        <ModuleB />
      </Suspense>
    </div>
  );
}

export default Entry;
