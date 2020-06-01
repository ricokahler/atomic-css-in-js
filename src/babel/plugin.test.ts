import { transform } from '@babel/core';
import fs from 'fs';
import plugin, { Options } from './plugin';

it('works', async () => {
  const filePath = require.resolve('./Example.example.js');

  const pluginOptions: Options = {
    moduleResolver: {
      alias: {
        // this configuration isn't needed when packaged properly
        'atomic-css-in-js': require.resolve('../ssr'),
      },
    },
  };

  const result = transform((await fs.promises.readFile(filePath)).toString(), {
    babelrc: false,
    filename: filePath,
    presets: ['@babel/preset-react'],
    plugins: [[plugin, pluginOptions]],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "\\"use strict\\";

    Object.defineProperty(exports, \\"__esModule\\", {
      value: true
    });
    exports.default = exports.styles = void 0;

    require(\\"atomic-css-in-js/load.atomic-css-in-js?css=LmFjal8xbTRxcmx4XzJxcGE5dXtjb2xvcjp3aGl0ZX0%3D\\");

    require(\\"atomic-css-in-js/load.atomic-css-in-js?css=LmFjal8xdXg5Z3B5X3lpc3cxbntiYWNrZ3JvdW5kLWNvbG9yOmJsdWV9\\");

    var _react = _interopRequireDefault(require(\\"react\\"));

    var _atomicCssInJs = require(\\"atomic-css-in-js\\");

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    const styles = (0, _atomicCssInJs.createStyles)({
      main: (0, _atomicCssInJs.css)\`
        background-color: blue;
        color: white;
      \`
    });
    exports.styles = styles;

    function MyComponent() {
      return /*#__PURE__*/_react.default.createElement(\\"div\\", {
        className: styles.main
      }, \\"Test\\");
    }

    var _default = MyComponent;
    exports.default = _default;"
  `);
});
