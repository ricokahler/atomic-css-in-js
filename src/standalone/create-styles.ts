/**
 * Returns the style sheet
 */
function createStyles<T extends { [key: string]: string }>(styles: T): T {
  // in the standalone implementation, creates styles does nothing
  return styles;
}

export default createStyles;
