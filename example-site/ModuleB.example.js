import React from 'react';
import { createStyles, css } from 'atomic-css-in-js';

export const styles = createStyles({
  root: css`
    /* this is a repeat color so it should not be in the code-split bundle */
    background-color: blue;
    /* this is a repeat key-value pair in Module A */
    font-weight: bold;
    /* this is a new key-value pair so it should be in the bundle */
    color: yellow;
  `,
});

function ModuleB() {
  return <div className={styles.root}>stuff</div>;
}

export default ModuleB;
