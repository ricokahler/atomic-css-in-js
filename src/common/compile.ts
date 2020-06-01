// @ts-ignore
import { compile as stylisCompile, serialize, stringify } from 'stylis';

/**
 * Some typings from stylis.
 * TODO: remove this when stylis get its own types.
 */
interface StylisNode {
  value: string;
  type: string;
  props: string | string[];
  children: string | StylisNode[];
  line: number;
  column: number;
  parent: StylisNode | null;
}

/**
 * Represents a set of rule path + property + value that will be converted to
 * an atomic CSS string + class name
 */
interface StyleAtom {
  media: string[];
  className: string;
  property: string;
  value: string;
  isFallback: boolean;
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  const result = hash >>> 0;

  return result.toString(36);
}

/**
 * Recursively applies the nested rules like `@supports` and `@media`
 */
function applyMedia(mediaArr: string[], rule: string): string {
  const [first, ...rest] = mediaArr;
  if (!first) return rule;
  return `${first}{${applyMedia(rest, rule)}}`;
}

/**
 * Creates an empty atom which is a new object with new references
 */
function emptyAtom() {
  const atom: StyleAtom = {
    media: [],
    property: '',
    className: '',
    value: '',
    isFallback: false,
  };

  return atom;
}

export interface AtomicRule {
  className: string;
  atomicCss: string;
}

export interface CompilationResult {
  atomicRules: { [className: string]: string };
  globalRules: { [key: string]: true };
}

/**
 * Compiles a stylis-flavored CSS string into atomic rules
 */
function compile(stylisCss: string): CompilationResult {
  const root = 'root_____';
  const ast = stylisCompile(`${root} {${stylisCss}}`);

  const atoms: StyleAtom[] = [];
  const globalRules: CompilationResult['globalRules'] = {};

  /**
   * Traverses the AST mutating current to find all the style "atoms" — where
   * one style atom is one atomic CSS rule.
   *
   * Note: current is mutated for speed and is cloned on leaf node
   */
  function traverse(node: StylisNode, current: StyleAtom) {
    const { children, type, value, props } = node;

    switch (type) {
      case 'comm': {
        return;
      }

      case 'rule': {
        if (typeof children === 'string') throw new Error('expected array');

        const classNames = Array.isArray(props) ? props : [props];

        for (const className of classNames) {
          for (const child of children) {
            // change
            current.className = className;
            // traverse
            traverse(child, current);
            // undo
            current.className = '';
          }
        }
        return;
      }

      case 'decl': {
        if (Array.isArray(children)) throw new Error('should not be array');
        if (Array.isArray(props)) throw new Error('should not be array');

        const parentChildren = node.parent?.children as
          | StylisNode[]
          | undefined;
        const selfIndex = parentChildren?.indexOf(node);
        const previousNode =
          parentChildren && parentChildren[(selfIndex || 0) - 1];
        const isFallback =
          typeof previousNode?.children === 'string' &&
          previousNode?.children.toLowerCase().trim() === 'fallback';

        atoms.push({
          media: [...current.media],
          className: current.className,
          property: props,
          value: children,
          isFallback,
        });
        return;
      }

      // This allows for nested CSS rules for `@supports` `@media`. This list
      // may need to be audited in the future however. Note that not every
      // nested rule set should be converted into an atomic one.
      // For example, @keyframes should not be compiled into atomic CSS
      case '@media':
      case '@supports': {
        if (typeof children === 'string') throw new Error('expected array');

        // implements `@supports (--acj: global) {}
        const propsArr = Array.isArray(props) ? props : [props];
        if (
          propsArr.some((prop) =>
            prop.match(/^\(--atomic-css-in-js:.*global\)$/)
          )
        ) {
          for (const globalRule of children) {
            const serializedRule = serialize([globalRule], stringify)
              .replace(root, '')
              .trim();

            if (serializedRule) {
              globalRules[serializedRule] = true;
            }
          }
          return;
        }

        for (const child of children) {
          // change
          current.media.push(value);
          // traverse
          traverse(child, current);
          // undo
          const index = current.media.indexOf(value);
          if (index === -1) {
            throw new Error('Not supposed to happen');
          }
          current.media.splice(index, 1);
        }
        return;
      }

      // for any other rules (include `@keyframes`) default to just serializing
      // the AST and returning the value
      default: {
        if (value === root) {
          if (typeof children === 'string') throw new Error('expected array');

          for (const child of children) {
            traverse(child, current);
          }
          return;
        }

        throw new Error(
          `The rule "${value}" must be wrapped in @supports (--atomic-css-in-js: global)`
        );
      }
    }
  }

  for (const node of ast) {
    traverse(node, emptyAtom());
  }

  const atomicRules = atoms
    .map(({ media, className: _className, property, value, isFallback }) => {
      const className = _className.replace(root, '');
      // hash the rule path so that this hash can be used to see if there are
      // collision in applied rules.
      const ruleHash = hash(
        [...media, className, property, isFallback].join('_')
      );
      const valueHash = hash(value);
      // the rule hash might start with a number (which is not a valid CSS class
      // name) so we prefix with `acj-`.
      // also makes it better to match with
      const finalClassName = `acj_${ruleHash}_${valueHash}`;
      const ruleNoMedia = `.${finalClassName}${className}{${property}:${value}}`;
      const atomicCss = applyMedia(media, ruleNoMedia);
      return [finalClassName, atomicCss];
    })
    .reduce((acc, [finalClassName, atomicCss]) => {
      acc[finalClassName] = atomicCss;
      return acc;
    }, {} as CompilationResult['atomicRules']);

  return {
    atomicRules,
    globalRules,
  };
}

export default compile;
