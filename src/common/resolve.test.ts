import resolve from './resolve';
import compile from './compile';
import getClassName from './get-class-name';

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

it('takes in multiple style atomic class names and returns a single resolved class names', () => {
  const classA = getClassName(
    compile(
      css`
        color: red;
        font-weight: bold;
      `
    )
  );

  const classB = getClassName(
    compile(
      css`
        color: blue;
        font-weight: bold;
      `
    )
  );

  const resolved = resolve(classA, classB);

  // notice how there are only two rules.
  // one for the color, and another for the font-weight. no repeat rules
  expect(resolved.split(' ').length).toBe(2);

  expect(resolved).toMatchInlineSnapshot(
    `"acj_1nu230k_yirzs0 acj_z66snb_yisw1n"`
  );
});

it('makes the last applied style win', () => {
  const red = getClassName(
    compile(
      css`
        color: red;
      `
    )
  );
  const blue = getClassName(
    compile(
      css`
        color: blue;
      `
    )
  );

  const shouldBeRed = resolve(blue, red);
  expect(shouldBeRed).toBe(red);

  const shouldBeBlue = resolve(red, blue);
  expect(shouldBeBlue).toBe(blue);
});

it('removes non-string/falsy values', () => {
  const red = getClassName(
    compile(
      css`
        color: red;
      `
    )
  );
  const blue = getClassName(
    compile(
      css`
        color: blue;
      `
    )
  );

  const falsy = null;

  const resolved = resolve(red, falsy && blue);
  expect(resolved.split(' ').length).toBe(1);
  expect(resolved).toBe(red);
});

it('appends non-match (e.g. non atomic) class names to the end of the string', () => {
  const red = getClassName(
    compile(
      css`
        color: red;
      `
    )
  );
  const bold = getClassName(
    compile(
      css`
        font-weight: bold;
      `
    )
  );

  const resolved = resolve('non-atomic-classname', red, bold);
  expect(resolved.split(' ').length).toBe(3);
  expect(resolved).toMatchInlineSnapshot(
    `"acj_z66snb_375bw6 acj_1nu230k_yirzs0 non-atomic-classname"`
  );
});
