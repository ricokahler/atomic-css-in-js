import loader from './loader';

it('takes in a resource query and passes it to the next loader', () => {
  const result = loader.apply({
    resourceQuery:
      '?css=LmFjal8xdXg5Z3B5X3lpc3cxbntiYWNrZ3JvdW5kLWNvbG9yOmJsdWV9',
  });
  expect(result).toMatchInlineSnapshot(
    `".acj_1ux9gpy_yisw1n{background-color:blue}"`
  );
});
