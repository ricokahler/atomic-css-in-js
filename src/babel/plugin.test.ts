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
    configFile: false,
    filename: filePath,
    presets: ['@babel/preset-react'],
    plugins: [[plugin, pluginOptions]],
  });

  expect(result.code).toMatchInlineSnapshot(`
    "import \\"atomic-css-in-js/load.atomic-css-in-js?css=LmFjal8xbTRxcmx4XzJxcGE5dXtjb2xvcjp3aGl0ZX0%3D\\";
    import \\"atomic-css-in-js/load.atomic-css-in-js?css=LmFjal8xdXg5Z3B5X3lpc3cxbntiYWNrZ3JvdW5kLWNvbG9yOmJsdWV9\\";
    export const styles = {
      main: \\"acj_1ux9gpy_yisw1n acj_1m4qrlx_2qpa9u\\"
    };
    import React from 'react';
    import { createStyles, css } from \\"atomic-css-in-js/ssr\\";

    function MyComponent() {
      return /*#__PURE__*/React.createElement(\\"div\\", {
        className: styles.main
      }, \\"Test\\");
    }

    export default MyComponent;"
  `);
});
