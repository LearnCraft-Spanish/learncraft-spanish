import { describe, expect, it } from 'vitest';
import {
  findLeakedSecrets,
  findUnknownPublicKeys,
  PUBLIC_ENV_KEYS,
} from './env-guard.js';

describe('findUnknownPublicKeys', () => {
  it('accepts every public key', () => {
    const env = Object.fromEntries(PUBLIC_ENV_KEYS.map((key) => [key, 'x']));
    expect(findUnknownPublicKeys(env)).toEqual([]);
  });

  it('ignores keys without the VITE_ prefix', () => {
    expect(
      findUnknownPublicKeys({ GH_PACKAGE_KEY: 'x', MODE: 'production' }),
    ).toEqual([]);
  });

  it('flags VITE_ keys that are not public', () => {
    expect(
      findUnknownPublicKeys({
        VITE_BACKEND_DOMAIN: 'x',
        VITE_SENTRY_AUTH_TOKEN: 'x',
      }),
    ).toEqual(['VITE_SENTRY_AUTH_TOKEN']);
  });
});

describe('findLeakedSecrets', () => {
  const env = {
    GH_PACKAGE_KEY: 'ghp_fakePackageKey123',
    SENTRY_AUTH_TOKEN: 'sntrys_fakeSentryToken456',
    VITE_AUTH0_CLIENTID: 'publicClientId789',
  };

  it('finds a build secret in an output file', () => {
    const files = [
      { file: 'assets/index.js', contents: 'const a = 1;' },
      {
        file: 'assets/index.js.map',
        contents: '{"sourcesContent":["sntrys_fakeSentryToken456"]}',
      },
    ];
    expect(findLeakedSecrets(files, env)).toEqual([
      { key: 'SENTRY_AUTH_TOKEN', file: 'assets/index.js.map' },
    ]);
  });

  it('ignores public values', () => {
    const files = [{ file: 'index.js', contents: 'publicClientId789' }];
    expect(findLeakedSecrets(files, env)).toEqual([]);
  });

  it('ignores unset and very short secrets', () => {
    const files = [{ file: 'index.js', contents: 'abc' }];
    expect(findLeakedSecrets(files, { GH_PACKAGE_KEY: 'abc' })).toEqual([]);
    expect(findLeakedSecrets(files, {})).toEqual([]);
  });
});
