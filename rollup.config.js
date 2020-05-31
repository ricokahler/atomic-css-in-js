// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import path from 'path';

// import { get } from 'lodash';

const extensions = ['.js', '.ts', '.tsx'];

const umdPlugins = [
  resolve({
    extensions,
  }),
  babel({
    babelrc: false,
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
    babelHelpers: 'bundled',
    extensions,
  }),
];

const esmPlugins = [
  alias({
    entries: [
      {
        find: '@atomic-css-in-js/common',
        replacement: path.resolve(__dirname, './packages/common/src/index.ts'),
      },
    ],
  }),
  resolve({
    extensions,
    modulesOnly: true,
  }),
  babel({
    babelrc: false,
    presets: ['@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-runtime'],
    babelHelpers: 'runtime',
    extensions,
  }),
];

export default [
  // standalone
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'atomicCssInJs',
      globals: { stylis: 'stylis' },
    },
    plugins: umdPlugins,
    external: ['stylis'],
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
    external: ['stylis'],
  },
];
