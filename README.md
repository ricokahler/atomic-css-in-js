# atomic-css-in-js

> statically extracted, zero-runtime, atomic css-in-js with **code-splitting support**

> ⚠️ NOT ready yet

`atomic-css-in-js` is not the first library of its kind. There many other amazing libraries that do either statically extracted CSS-in-JS or atomic CSS-in-JS but none that checked all the boxes for me.

- [ ] standalone mode
- [ ] compiler mode (static CSS extraction)
- [ ] loader (reduce code splitting reduction)
- [ ] fallback support (implement with comment, make it change the property hash)
- [ ] global CSS support (with `:global { /* ... */ }`?)
- [ ] @keyframes @supports (does this work?)
- [ ] stylelint
- [ ] grid-template-areas

```js
import React from 'react';
import { css, resolve, createStyles, createVariables } from 'atomic-css-in-js';

const { vars } = createVariables('test');

export const styles = createStyles({
  main: css``,
  get title() {
    return css`
      & ${this.main}:hover {
        background-color: ${vars.test};
      }
    `;
  },
});

function Component({ title }) {
  return (
    <div className={main} style={vars({ test: rest })}>
      <h1 className={resolve(styles.main, styles.title)}>{title}</h1>
      <p>Description</p>
    </div>
  );
}
```

```js
const cache = {};
function css(content) {
  if (has(cache, content)) {
    return classNames;
  }

  styleEl = document.querySelector('style-el');
}
```

```
atomic-css-in-js
  - re-exports standalone
@atomic-css-in-js/babel-plugin-plugin
  - babel
  - require-from-string
@atomic-css-in-js/ssr
  - resolve
  - createVariables
@atomic-css-in-js/loader
@atomic-css-in-js/standalone
```

```css
/* prettier-ignore */
.ee6po47{background-color:red;}
.qxf2hea {
  color: red;
}
```

```
<property_hash>-_-<value_hash>
ee6po47-ee6po47
```

property hash is to remove collisions

```css
.another {
  background-color: red;
}
.test {
  background-color: red;
}
.test:hover {
  background-color: red;
}
```

```
[@media] [pseudo-class] [property] [value]
```

```css
```
