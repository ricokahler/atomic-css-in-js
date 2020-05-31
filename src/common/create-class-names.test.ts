import createClassNames from './create-class-names';

it('creates an object that returns namespaced classnames', () => {
  const classes = createClassNames('namespace', ['one', 'two']);

  expect(classes).toMatchInlineSnapshot(`
    Object {
      "one": "c-namespace-one",
      "two": "c-namespace-two",
    }
  `);
});
