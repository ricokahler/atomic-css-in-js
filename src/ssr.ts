// in SSR mode, `css` just returns the input string so that it can be extracted
// by the babel plugin
export function css(
  strings: TemplateStringsArray,
  ...values: Array<string | number>
) {
  let combined = '';

  for (let i = 0; i < strings.length; i += 1) {
    const currentString = strings[i];
    const currentValue = values[i] || '';
    combined += currentString + currentValue;
  }

  return combined;
}

export { default as camelToKebab } from './common/camel-to-kebab';
export { default as createClassNames } from './common/create-class-names';
export { default as createStyles } from './common/create-styles';
export { default as createVariables } from './common/create-variables';
export { default as resolve } from './common/resolve';
export type { Vars, AtomicRule, CompilationResult } from './common';
