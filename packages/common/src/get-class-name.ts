import { CompilationResult } from './compile';

function getClassName({ atomicRules, otherRules }: CompilationResult) {
  const ascendingComparator = (a: string, b: string) => a.localeCompare(b);
  const atomicClassNames = atomicRules
    .slice()
    .map(({ className }) => className)
    .sort(ascendingComparator);
  const otherClassNames = otherRules.slice().sort(ascendingComparator);

  return `${atomicClassNames.join(' ')} ${otherClassNames.join(' ')}`.trim();
}

export default getClassName;
