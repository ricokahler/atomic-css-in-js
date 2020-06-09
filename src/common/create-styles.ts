/**
 * Returns the style sheet
 */
function createStyles<T extends { [key: string]: string }>(styles: T): T {
  return Object.assign(styles, { __atomicCssInJsExtractable: true });
}

export default createStyles;
