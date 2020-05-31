module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@atomic-css-in-js/(.+)': '<rootDir>/packages/$1/src',
    '^atomic-css-in-js$': '<rootDir>/packages/atomic-css-in-js/src',
    '^prettier$': '<rootDir>/node_modules/prettier',
  },
};
