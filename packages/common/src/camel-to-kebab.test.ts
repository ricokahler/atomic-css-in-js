import camelToKebab from './camel-to-kebab';

test('typical case', () => {
  expect(camelToKebab('theQuickBrownFox')).toMatchInlineSnapshot(
    `"the-quick-brown-fox"`
  );
});

test('uppercase first letter', () => {
  expect(camelToKebab('FooBarBaz')).toMatchInlineSnapshot(`"foo-bar-baz"`);
});
