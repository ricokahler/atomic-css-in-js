import createVariables from './create-variables';

it('takes in a list of keys and returns a vars object/func', () => {
  const vars = createVariables('exampleNamespace', ['test', 'anotherThing']);

  expect(vars.test).toMatchInlineSnapshot(`"var(--example-namespace-test)"`);
  expect(vars.anotherThing).toMatchInlineSnapshot(
    `"var(--example-namespace-another-thing)"`
  );
  expect(vars({ anotherThing: 'red' })).toMatchInlineSnapshot(`
    Object {
      "--example-namespace-another-thing": "red",
    }
  `);
});
