import React from 'react';
import { createStyles, css } from 'atomic-css-in-js';

export const styles = createStyles({
  main: css`
    background-color: blue;
    color: white;
  `,
});

function MyComponent() {
  return <div className={styles.main}>Test</div>;
}

export default MyComponent;
