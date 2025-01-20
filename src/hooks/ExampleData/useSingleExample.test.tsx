import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { useSingleExample } from 'src/hooks/ExampleData/useSingleExample';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { setupMockAuth } from 'tests/setupMockAuth';
import data from 'mocks/data/serverlike/serverlikeData';

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
    setupMockAuth({ userName: 'admin-empty-role' });
  });
  it('runs without crashing', async () => {
    const { result } = renderHook(() => useSingleExample(exampleId), {
      wrapper: MockAllProviders,
    });
    const query = result.current.singleExampleQuery;
    await waitFor(() => expect(query.isSuccess).toBe(true), {
      timeout: 3000,
      interval: 200,
    });
    expect(query.data).toBeDefined();
  });

  it('data exists', async () => {
    const { result } = renderHook(() => useSingleExample(exampleId), {
      wrapper: MockAllProviders,
    });
    const query = result.current.singleExampleQuery;
    await waitFor(() => expect(query.data).toBeDefined(), {
      timeout: 3000,
      interval: 200,
    });
  });
  describe('when user is not an admin or student', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'limited' });
    });
    it('isSuccess is false, data is undefined', async () => {
      const { result } = renderHook(() => useSingleExample(exampleId), {
        wrapper: MockAllProviders,
      });
      const query = result.current.singleExampleQuery;
      await waitFor(
        () => {
          expect(query.isSuccess).toBe(false);
        },
        { timeout: 10000, interval: 200 },
      );
      expect(query.isSuccess).toBe(false);
      expect(query.data).toEqual(undefined);
    });
  });
});
