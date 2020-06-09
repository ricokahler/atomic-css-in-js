import { compile, getClassName } from '../common';
import {
  appliedAtomicCssRules,
  appliedGlobalRules,
  classNameCache,
} from './caches';

let _styleEl: HTMLStyleElement | null = null;
function getStyleEl() {
  if (_styleEl) return _styleEl;

  _styleEl = document.createElement('style');
  _styleEl.dataset.atomicCssInJs = 'true';
  document.head.appendChild(_styleEl);
  return _styleEl;
}

function css(strings: TemplateStringsArray, ...values: Array<string | number>) {
  let combined = '';

  for (let i = 0; i < strings.length; i += 1) {
    const currentString = strings[i];
    const currentValue = values[i] || '';
    combined += currentString + currentValue;
  }

  if (classNameCache[combined]) return classNameCache[combined];

  const compilationResult = compile(combined);
  const { atomicRules, globalRules } = compilationResult;

  const styleEl = getStyleEl();

  const atomicRulesToApply =
    Object.keys(atomicRules)
      .filter((atomicCss) => !appliedAtomicCssRules[atomicCss])
      .join('\n') + '\n';
  const globalRulesToApply =
    Object.keys(globalRules)
      .filter((rule) => !appliedGlobalRules[rule])
      .join('\n') + '\n';

  styleEl.innerHTML += atomicRulesToApply + globalRulesToApply;

  for (const atomicCss of Object.values(atomicRules)) {
    appliedAtomicCssRules[atomicCss] = true;
  }
  for (const otherRule of Object.keys(globalRules)) {
    appliedGlobalRules[otherRule] = true;
  }

  const className = getClassName(compilationResult);
  classNameCache[combined] = className;
  return className;
}

export default css;
