import webpack from 'webpack';

/**
 * this is an extremely simple loader that takes in the result of the babel
 * plugins and sends it back out to other CSS loaders in your webpack loader
 * chain
 */
const loader: webpack.loader.Loader = function () {
  console.log(this.resourceQuery);
  return Buffer.from(
    new URLSearchParams(this.resourceQuery.slice(1)).get('css') || '',
    'base64'
  ).toString();
};

export default loader;
