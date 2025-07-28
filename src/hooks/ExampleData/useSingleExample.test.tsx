import { renderHook, waitFor } from '@testing-library/react';
import data from 'mocks/data/serverlike/serverlikeData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { useSingleExample } from 'src/hooks/ExampleData/useSingleExample';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('useSingleExample', () => {
  let exampleId: number;
  beforeAll(async () => {
    const api = data().api;
    const getExistingSampleId = async () => {
      const randNumber = Math.floor(
        Math.random() * api.verifiedExamplesTable.length,
      );
      const example = api.verifiedExamplesTable[randNumber];
      return example.recordId;
    };

    exampleId = await getExistingSampleId();
  });
  beforeEach(() => {
    overrideMockAuthAdapter({
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useSingleExample(exampleId), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () => expect(result.current.singleExampleQuery.isSuccess).toBe(true),
      {
        timeout: 7500,
        interval: 200,
      },
    );
    expect(result.current.singleExampleQuery.data).toBeDefined();
  });

  it('data exists', async () => {
    const { result } = renderHook(() => useSingleExample(exampleId), {
      wrapper: MockAllProviders,
    });
    await waitFor(
      () => expect(result.current.singleExampleQuery.data).toBeDefined(),
      {
        timeout: 7500,
        interval: 200,
      },
    );
  });
  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: false,
        isLimited: true,
      });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useSingleExample(exampleId), {
        wrapper: MockAllProviders,
      });
      await waitFor(
        () => {
          expect(result.current.singleExampleQuery.isSuccess).toBe(false);
        },
        { timeout: 10000, interval: 200 },
      );
      expect(result.current.singleExampleQuery.isSuccess).toBe(false);
      expect(result.current.singleExampleQuery.data).toEqual(undefined);
    });
  });
});
