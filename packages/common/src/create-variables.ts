import camelToKebab from './camel-to-kebab';

type VarsFn<T> = (
  vars: Partial<{ [P in keyof T]: string }>
) => { [key: string]: any };
export type Vars<T> = VarsFn<T> & { [P in keyof T]: string };

function createVariables<T>(namespace: string, arr: Array<keyof T>): Vars<T> {
  const vars = (values: Partial<{ [P in keyof T]: string }>) => {
    return Object.entries(values)
      .map(
        ([key, value]) =>
          [`--${camelToKebab(namespace)}-${camelToKebab(key)}`, value] as [
            string,
            string
          ]
      )
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: any });
  };

  return arr.reduce((acc, next) => {
    acc[next] = `var(--${camelToKebab(namespace)}-${camelToKebab(
      next as string
    )})` as Vars<T>[keyof T];
    return acc;
  }, vars as Vars<T>);
}

export default createVariables;
