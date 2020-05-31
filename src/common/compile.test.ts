import compile from './compile';

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
      "atomicRules": Array [
        Object {
          "atomicCss": ".acj_1t4oquc_32wtia{background-color:black}",
          "className": "acj_1t4oquc_32wtia",
        },
        Object {
          "atomicCss": ".acj_z66snb_yisw1n{color:blue}",
          "className": "acj_z66snb_yisw1n",
        },
      ],
      "otherRules": Array [],
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
      "atomicRules": Array [
        Object {
          "atomicCss": ".acj_1ao1yqo_375bw6 .foo.a{color:red}",
          "className": "acj_1ao1yqo_375bw6",
        },
        Object {
          "atomicCss": ".acj_1fc2cvb_yjd7ki .foo.a{display:flex}",
          "className": "acj_1fc2cvb_yjd7ki",
        },
        Object {
          "atomicCss": ".acj_1hxrs9k_yisw1n.bar{color:blue}",
          "className": "acj_1hxrs9k_yisw1n",
        },
      ],
      "otherRules": Array [],
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
      "atomicRules": Array [
        Object {
          "atomicCss": "@supports (display: grid){@media (max-width: 425px){.acj_1bcbv0p_375xa8{grid-template-columns:1fr}}}",
          "className": "acj_1bcbv0p_375xa8",
        },
        Object {
          "atomicCss": "@supports (display: grid){.acj_3in6je_yirxwd{display:grid}}",
          "className": "acj_3in6je_yirxwd",
        },
        Object {
          "atomicCss": "@supports (display: grid){.acj_tt93ot_1201c14{grid-template-columns:repeat(2, 1fr)}}",
          "className": "acj_tt93ot_1201c14",
        },
      ],
      "otherRules": Array [],
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
      "atomicRules": Array [
        Object {
          "atomicCss": ".acj_3yu9gv_yisw1n .foo{color:blue}",
          "className": "acj_3yu9gv_yisw1n",
        },
      ],
      "otherRules": Array [],
    }
  `);
});

test('@keyframes', () => {
  const result = compile(css`
    color: red;

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
  `);

  expect(result).toMatchInlineSnapshot(`
    Object {
      "atomicRules": Array [
        Object {
          "atomicCss": ".acj_z66snb_375bw6{color:red}",
          "className": "acj_z66snb_375bw6",
        },
      ],
      "otherRules": Array [
        "@keyframes mymove{from{top:0px;}to{top:200px;}}",
        "@keyframes mymove{0%{top:0px;}25%{top:200px;}50%{top:100px;}75%{top:200px;}100%{top:0px;}}",
      ],
    }
  `);
});
