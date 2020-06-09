import React from 'react';
import { createStyles, css } from 'atomic-css-in-js';

export const styles = createStyles({
  root: css`
    background-color: blue;
    font-weight: bold;
  `,
});

function ModuleA() {
  return <div className={styles.root}>Module A</div>;
}

export default ModuleA;
