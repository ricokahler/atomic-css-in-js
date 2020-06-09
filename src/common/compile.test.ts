import compile from './compile';
import getClassName from './get-class-name';
import resolve from './resolve';

// simple string re-export tag for syntax highlighting in VS-code
function css(strings: TemplateStringsArray, ...values: Array<string | number>) {
  let combined = '';

  for (let i = 0; i < strings.length; i += 1) {
    const currentString = strings[i];
    const currentValue = values[i] || '';
    combined += currentString + currentValue;
  }

  return combined;
}

it('takes in a stylis CSS string and outputs atomic CSS', () => {
  const result = compile(css`
    color: blue;
    background-color: black;
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_1m4qrlx_yisw1n": ".acj_1m4qrlx_yisw1n{color:blue}",
        "acj_1ux9gpy_32wtia": ".acj_1ux9gpy_32wtia{background-color:black}",
      },
      "globalRules": Object {},
    }
  `);
});

test('nested rules', () => {
  const result = compile(css`
    .foo {
      &.a {
        color: red;
        display: flex;
      }
    }

    &.bar {
      color: blue;
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_1trhafu_yisw1n": ".acj_1trhafu_yisw1n.bar{color:blue}",
        "acj_ar4wx1_yjd7ki": ".acj_ar4wx1_yjd7ki .foo.a{display:flex}",
        "acj_wb3rc2_375bw6": ".acj_wb3rc2_375bw6 .foo.a{color:red}",
      },
      "globalRules": Object {},
    }
  `);
});

test('nested media queries and @supports', () => {
  const result = compile(css`
    @supports (display: grid) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);

      @media (max-width: 425px) {
        .test {
          grid-template-columns: 1fr;
        }
      }
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_1ra1r88_yirxwd": "@supports (display: grid){.acj_1ra1r88_yirxwd{display:grid}}",
        "acj_4sfctr_1201c14": "@supports (display: grid){.acj_4sfctr_1201c14{grid-template-columns:repeat(2, 1fr)}}",
        "acj_z4fr5f_375xa8": "@supports (display: grid){@media (max-width: 425px){.acj_z4fr5f_375xa8 .test{grid-template-columns:1fr}}}",
      },
      "globalRules": Object {},
    }
  `);
});

it('hashes to the same result', () => {
  const resultA = compile(css`
    color: red;
    background-color: blue;
  `);
  const resultB = compile(css`
    background-color: blue;
    color: red;
  `);

  const a = resultA.atomicRules;
  const b = resultB.atomicRules;

  expect(a).toEqual(b);
});

it('removes duplicate rules', () => {
  const result = compile(css`
    .foo {
      color: blue;
    }

    .foo {
      color: blue;
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_131kqy5_yisw1n": ".acj_131kqy5_yisw1n .foo{color:blue}",
      },
      "globalRules": Object {},
    }
  `);
});

it('allows for global css with the `@supports (--atomic-css-in-js: global)` rule', () => {
  const result = compile(css`
    @supports (--atomic-css-in-js: global) {
      .red {
        color: red;
        background-color: red;
      }

      .black {
        color: black;
      }

      .bold {
        font-weight: bold;

        .nested {
          background-color: purple;
        }
      }

      @media (max-width: 425px) {
        .test {
          font-weight: 900;
        }
      }
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {},
      "globalRules": Object {
        ".black{color:black;}": true,
        ".bold .nested{background-color:purple;}": true,
        ".bold{font-weight:bold;}": true,
        ".red{color:red;background-color:red;}": true,
        "@media (max-width: 425px){ .test{font-weight:900;}}": true,
      },
    }
  `);
});

test('@keyframes with @supports (--atomic-css-in-js: global)', () => {
  const result = compile(css`
    color: red;

    @supports (--atomic-css-in-js: global) {
      @keyframes mymove {
        from {
          top: 0px;
        }
        to {
          top: 200px;
        }
      }

      .nested {
        @keyframes mymove {
          0% {
            top: 0px;
          }
          25% {
            top: 200px;
          }
          50% {
            top: 100px;
          }
          75% {
            top: 200px;
          }
          100% {
            top: 0px;
          }
        }
      }
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_1m4qrlx_375bw6": ".acj_1m4qrlx_375bw6{color:red}",
      },
      "globalRules": Object {
        "@keyframes mymove{0%{top:0px;}25%{top:200px;}50%{top:100px;}75%{top:200px;}100%{top:0px;}}": true,
        "@keyframes mymove{from{top:0px;}to{top:200px;}}": true,
      },
    }
  `);
});

it('allows for fallback css values with comments', () => {
  const result = compile(css`
    /* fallback */
    color: red;
    color: var(--my-var);
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Object {
        "acj_1m4qrlx_1li620t": ".acj_1m4qrlx_1li620t{color:var(--my-var)}",
        "acj_hfmt3i_375bw6": ".acj_hfmt3i_375bw6{color:red}",
      },
      "globalRules": Object {},
    }
  `);

  const className = resolve(getClassName(result));
  // if there was no falback, there would only be one
  expect(className.split(' ').length).toBe(2);
  expect(className).toMatchInlineSnapshot(
    `"acj_1m4qrlx_1li620t acj_hfmt3i_375bw6"`
  );
});
