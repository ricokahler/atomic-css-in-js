import camelToKebab from './camel-to-kebab';

function createClassNames<T>(
  namespace: string,
  arr: Array<keyof T>
): { [P in keyof T]: string } {
  return arr.reduce((acc, next) => {
    acc[next] = `c-${camelToKebab(namespace)}-${camelToKebab(next as string)}`;
    return acc;
  }, {} as { [P in keyof T]: string });
}

export default createClassNames;
