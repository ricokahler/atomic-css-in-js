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
}

function collect(filename: string, opts: Options) {
  const {
    extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
    flow = false,
    // TODO: add more default ignore packages
    ignorePackages = ['react', 'gatsby'],
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
      flow ? ['@babel/preset-flow'] : ['@babel/preset-typescript'],
      ['@babel/preset-react'],
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      [
        'module-resolver',
        {
          ...opts.moduleResolver,
          alias: {
            'atomic-css-in-js': 'atomic-css-in-js/ssr',
            ...ignorePackages.reduce((acc, packageName) => {
              acc[packageName] = 'no-op';
              return acc;
            }, {} as { [key: string]: string }),
            ...opts.moduleResolver?.alias,
          },
        },
      ],
    ],
    babelrc: false,
    ...opts.babelOptions,
  });

  const revert = addHook(
    (code: string, filename: string) => {
      const result = babel.transform(code, babelConfig(filename));

      if (!result?.code) {
        // TODO: better error message
        throw new Error('No transform');
      }

      return result.code;
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

    const stylesToPull = attempt(
      () =>
        (() => {
          const result = requireFromString(transformedCode);
          return Object.values(result).filter(
            (maybeFn: any) => maybeFn.__atomicCssInJsExtractable
          ) as Array<
            { [key: string]: string } & { __atomicCssInJsExtractable: true }
          >;
        })(),
      'Failed to execute file'
    );

    const reduceCompilationResult = (
      acc: CompilationResult,
      next: CompilationResult
    ) => {
      for (const [key, value] of Object.entries(next.atomicRules)) {
        acc.atomicRules[key] = value;
      }
      for (const key of Object.keys(next.globalRules)) {
        acc.globalRules[key] = true;
      }

      return acc;
    };

    const combinedCompilations = attempt(
      () =>
        stylesToPull.reduce(
          (acc, styleObj) => {
            return Object.values(styleObj)
              .map(compile)
              .reduce(reduceCompilationResult, acc);
          },
          {
            atomicRules: {},
            globalRules: {},
          } as CompilationResult
        ),
      'Failed to compile stylis-CSS'
    );

    return combinedCompilations;
  } catch (e) {
    throw e;
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

        const { atomicRules, globalRules } = collect(
          state.file.opts.filename,
          opts
        );

        const combinedGlobalRules = Object.keys(globalRules).join('\n');
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

        const atomicCssRules = Object.values(atomicRules);
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
