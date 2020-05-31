import css from './css';
import { appliedAtomicCssRules, appliedGlobalRules } from './caches';

beforeEach(() => {
  for (const key of Object.keys(appliedAtomicCssRules)) {
    delete appliedAtomicCssRules[key];
  }

  for (const key of Object.keys(appliedGlobalRules)) {
    delete appliedGlobalRules[key];
  }
});

it('creates a class name', () => {
  const className = css`
    color: black;

    &:hover {
      text-decoration: underline;
    }
  `;

  expect(className).toMatchInlineSnapshot(
    `"acj_10x192_1jxplcz acj_1m4qrlx_32wtia"`
  );

  expect(appliedAtomicCssRules).toMatchInlineSnapshot(`
    Object {
      ".acj_10x192_1jxplcz:hover{text-decoration:underline}": true,
      ".acj_1m4qrlx_32wtia{color:black}": true,
    }
  `);
});

it('is cached for speed', () => {
  const start = Date.now();
  for (let i = 0; i < 10000; i += 1) {
    css`
      color: black;

      &:hover {
        text-decoration: underline;
      }
    `;
  }
  const end = Date.now();

  expect(end - start < 3000).toBe(true);
});

it("doesn't re-apply a rule if it's already applied", () => {
  css`
    .foo {
      color: red;
    }
  `;

  css`
    .foo {
      background-color: black;
    }
  `;

  // clone
  const appliedRules = Object.entries(appliedAtomicCssRules).reduce(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {} as any
  );

  css`
    .foo {
      background-color: black;
      color: red;
    }
  `;

  // proves it's not the same reference
  expect(appliedRules).not.toBe(appliedAtomicCssRules);
  expect(appliedRules).toEqual(appliedAtomicCssRules);
});
