/**
 * Resolves multiple style classes such that the last applied class wins.
 */
function resolve(...classNames: Array<string | undefined | null>) {
  const { propertyLookup, otherClassNameLookup } = classNames
    .filter((str): str is string => typeof str === 'string')
    .map((className) => className.split(' '))
    .flat()
    .filter(Boolean)
    .map((className) => {
      const match = className.match(/acj_(.+)_(.+)/);
      if (!match) return className;

      // first string is property hash
      // second string is value hash
      return Array.from(match).slice(1) as [string, string];
    })
    .reduce(
      (acc, next) => {
        if (typeof next === 'string') {
          acc.otherClassNameLookup[next] = true;
          return acc;
        }

        const [propertyHash, valueHash] = next;
        acc.propertyLookup[propertyHash] = valueHash;
        return acc;
      },
      {
        propertyLookup: {} as { [propertyHash: string]: string },
        otherClassNameLookup: {} as { [className: string]: true },
      }
    );

  const resolvedClassNames = Object.entries(propertyLookup)
    .map(([propertyHash, valueHash]) => `acj_${propertyHash}_${valueHash}`)
    .join(' ');

  const otherClassNames = Object.keys(otherClassNameLookup).join(' ');

  return `${resolvedClassNames} ${otherClassNames}`.trim();
}

export default resolve;
