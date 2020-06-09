const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './Entry.example.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    chunkFilename: '[id].js',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          plugins: [
            [
              require.resolve('../dist/babel'),
              {
                ssrImport: require.resolve('../dist/ssr.js'),
              },
            ],
          ],
        },
      },
      {
        test: /\.atomic-css-in-js$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          require.resolve('../dist/loader'),
        ],
      },
    ],
  },
  resolve: {
    alias: {
      'atomic-css-in-js/ssr': path.resolve(__dirname, '../dist/ssr.js'),
      'atomic-css-in-js/load.atomic-css-in-js': path.resolve(
        __dirname,
        '../dist/load.atomic-css-in-js'
      ),
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
  externals: ['react', 'react-dom'],
  plugins: [new MiniCssExtractPlugin()],
};
