import noUntypedMocks from './no-untyped-mocks.js';

export default {
  plugins: {
    custom: {
      rules: {
        'no-untyped-mocks': noUntypedMocks.rules['no-untyped-mocks'],
      },
    },
  },
};
