import type { CompilationResult } from './compile';

function getClassName({ atomicRules, globalRules }: CompilationResult) {
  const ascendingComparator = (a: string, b: string) => a.localeCompare(b);
  const atomicClassNames = Object.keys(atomicRules).sort(ascendingComparator);
  const otherClassNames = Object.keys(globalRules).sort(ascendingComparator);

  return `${atomicClassNames.join(' ')} ${otherClassNames.join(' ')}`.trim();
}

export default getClassName;
