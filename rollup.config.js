// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts', '.tsx'];

const umdCjsPlugins = [
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
    plugins: umdCjsPlugins,
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
  // ssr
  {
    input: './src/ssr.ts',
    output: {
      file: './dist/ssr.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: esmPlugins,
  },
  // babel plugin
  {
    input: './src/babel/index.ts',
    output: {
      file: './dist/babel.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: umdCjsPlugins,
    external: ['pirates', 'require-from-string', 'fs', 'stylis', /^@babel\/.*/],
  },
  // load
  {
    input: './src/load.ts',
    output: {
      file: './dist/load.atomic-css-in-js',
      format: 'esm',
    },
    plugins: esmPlugins,
  },
];
