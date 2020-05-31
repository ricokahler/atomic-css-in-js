import getClassName from './get-class-name';
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

it('takes in a compilation result and returns the className string', () => {
  const compilationResult = compile(css`
    .foo {
      color: red;
      font-weight: bold;

      &:hover {
        text-decoration: underline;
      }
    }

    .bar {
      font-size: 21px;
    }
  `);

  const className = getClassName(compilationResult);
  expect(className).toMatchInlineSnapshot(
    `"acj_1a1043w_yirzs0 acj_1jtoon2_yjcvn2 acj_1p6hqho_1jxplcz acj_3yu9gv_375bw6"`
  );
});
