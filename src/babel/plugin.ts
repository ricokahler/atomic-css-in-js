import fs from 'fs';
import requireFromString from 'require-from-string';
import * as t from '@babel/types';
import * as babel from '@babel/core';
import { Visitor } from '@babel/traverse';
import { addHook } from 'pirates';
import compile, { CompilationResult } from '../common/compile';

export interface Options {
  /**
   * TODO: docs
   */
  babelOptions?: Partial<babel.TransformOptions>;
  /**
   * TODO: docs
   */
  flow?: boolean;
  /**
   * TODO: docs
   */
  moduleResolver?: {
    root?: string[];
    alias: { [key: string]: string };
  };
  /**
   * TODO: docs
   */
  ignorePackages?: string[];
  /**
   * TODO: docs
   */
  extensions?: string[];
  /**
   *
   */
  ssrImport?: string;
}

function collect(filename: string, opts: Options) {
  const {
    extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
    flow = false,
    // TODO: add more default ignore packages
    ignorePackages = [],
    ssrImport = 'atomic-css-in-js/ssr',
  } = opts;
  const code = fs.readFileSync(filename).toString();

  function attempt<T>(fn: () => T, errorMessage: string) {
    try {
      return fn();
    } catch (e) {
      throw new Error(`[${filename}] ${errorMessage}: ${e?.message}`);
    }
  }

  const babelConfig = (filename: string): babel.TransformOptions => ({
    filename,
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      // TODO: probably shouldn't need these
      flow ? ['@babel/preset-flow'] : ['@babel/preset-typescript'],
      ['@babel/preset-react'],
    ],
    plugins: [
      // TODO: can we rely on a parent configuration?
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      [
        'module-resolver',
        {
          ...opts.moduleResolver,
          alias: {
            'atomic-css-in-js': ssrImport,
            ...ignorePackages.reduce((acc, packageName) => {
              acc[packageName] = 'no-op';
              return acc;
            }, {} as { [key: string]: string }),
            ...opts.moduleResolver?.alias,
          },
        },
      ],
    ],
    // TODO: does this do anything?
    rootMode: 'upward-optional',
    ...opts.babelOptions,
  });

  const revert = addHook(
    (code: string, filename: string) => {
      const result = babel.transform(code, babelConfig(filename));
      return result?.code || '';
    },
    { exts: extensions }
  );

  try {
    const transformedCode = attempt(() => {
      const result = babel.transform(
        `require('@babel/polyfill');\n${code}`,
        babelConfig(filename)
      );

      if (!result?.code) {
        // TODO: better error message
        throw new Error('no transform');
      }

      return result.code;
    }, 'Failed to transform');

    const stylesToPull = attempt(() => {
      const result = requireFromString(transformedCode);
      return Object.entries(result)
        .filter(([_, maybeFn]: any) => maybeFn.__atomicCssInJsExtractable)
        .reduce((acc, [key, value]) => {
          acc[key] = value as { [classKey: string]: string } & {
            __atomicCssInJsExtractable: true;
          };
          return acc;
        }, {} as { [exportName: string]: { [classKey: string]: string } & { __atomicCssInJsExtractable: true } });
    }, 'Failed to execute file');

    const combinedCompilations = attempt(() => {
      return Object.entries(stylesToPull).reduce(
        (acc, [exportName, styleObj]) => {
          acc[exportName] = Object.entries(styleObj).reduce(
            (acc, [className, styleObj]) => {
              if (className === '__atomicCssInJsExtractable') return acc;

              acc[className] = compile(styleObj);
              return acc;
            },
            {} as { [classKey: string]: CompilationResult }
          );
          return acc;
        },
        {} as {
          [exportName: string]: { [classKey: string]: CompilationResult };
        }
      );
    }, 'Failed to compile stylis-CSS');

    return combinedCompilations;
  } finally {
    revert();
  }
}

function plugin(
  _: any,
  opts: Options
): {
  visitor: Visitor<{ file: { opts: { filename: string } } }>;
} {
  return {
    visitor: {
      Program(path, state) {
        let shouldProcessFile = false;

        path.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value !== 'atomic-css-in-js') return;

            path.node.source.value = opts.ssrImport || 'atomic-css-in-js/ssr';

            const importedCreateStyles = path.node.specifiers.some(
              (specifier) => {
                if (!t.isImportSpecifier(specifier)) return false;
                return specifier.imported.name === 'createStyles';
              }
            );
            if (!importedCreateStyles) return;
            shouldProcessFile = true;
          },
        });

        if (!shouldProcessFile) return;

        const combinedCompilations = collect(state.file.opts.filename, opts);

        // remove create styles exports
        path.node.body = path.node.body.filter((statement) => {
          if (!t.isExportNamedDeclaration(statement)) return true;
          const { declaration } = statement;
          if (!t.isVariableDeclaration(declaration)) return true;

          const isCreateStyles = declaration.declarations.some((d) => {
            if (!t.isCallExpression(d.init)) return false;
            if (!t.isIdentifier(d.init.callee)) return false;
            return d.init.callee.name === 'createStyles';
          });

          return !isCreateStyles;
        });

        for (const [exportName, classNameObj] of Object.entries(
          combinedCompilations
        )) {
          const objectProperties = Object.entries(classNameObj).map(
            ([className, compilationResult]) => {
              const classNameValue = Object.keys(
                compilationResult.atomicRules
              ).join(' ');

              return t.objectProperty(
                t.identifier(className),
                t.stringLiteral(classNameValue)
              );
            }
          );

          const stylesObj = t.objectExpression(objectProperties);

          path.node.body.unshift(
            t.exportNamedDeclaration(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(exportName), stylesObj),
              ])
            )
          );
        }

        const combinedGlobalRules = Object.values(combinedCompilations)
          .map((classNamesObj) => Object.values(classNamesObj))
          .flat()
          .map(({ globalRules }) => Object.keys(globalRules))
          .flat()
          .join('\n');

        if (combinedGlobalRules) {
          path.node.body.unshift(
            t.importDeclaration(
              [],
              t.stringLiteral(
                `atomic-css-in-js/load.atomic-css-in-js?css=${encodeURIComponent(
                  Buffer.from(combinedGlobalRules).toString('base64')
                )}`
              )
            )
          );
        }

        const atomicCssRules = Object.values(combinedCompilations)
          .map((x) => Object.values(x))
          .flat()
          .map((x) => Object.values(x.atomicRules))
          .flat();

        if (atomicCssRules.length > 0) {
          for (const atomicRule of atomicCssRules) {
            // Add the import for the CSS filename
            path.node.body.unshift(
              t.importDeclaration(
                [],
                t.stringLiteral(
                  `atomic-css-in-js/load.atomic-css-in-js?css=${encodeURIComponent(
                    Buffer.from(atomicRule).toString('base64')
                  )}`
                )
              )
            );
          }
        }
      },
    },
  };
}

export default plugin;
