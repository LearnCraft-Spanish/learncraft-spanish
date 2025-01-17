import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import MockAllProviders from '../../../mocks/Providers/MockAllProviders';

import { useProgramTable } from './useProgramTable';

describe('useProgramTable', async () => {
  it('isSuccess is true', async () => {
    const { result } = renderHook(() => useProgramTable(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.programTableQuery.isSuccess).toBe(true);
    });
    expect(result.current.programTableQuery.isSuccess).toBe(true);
  });

  it('renders with data, length greater than 0', async () => {
    const { result } = renderHook(() => useProgramTable(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.programTableQuery.isSuccess).toBe(true);
    });
    expect(result.current.programTableQuery.data?.length).toBeGreaterThan(0);
  });

  describe('data structure', () => {
    it('each program has lessons array with length greater than 0', async () => {
      const { result } = renderHook(() => useProgramTable(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(result.current.programTableQuery.isSuccess).toBe(true);
      });
      result.current.programTableQuery.data?.forEach((program) => {
        expect(program.lessons.length).toBeGreaterThan(0);
      });
    });
    it("for each course, last lesson's vocabKnown array length greater than first lesson, excluding: Ser Estar Mini Course", async () => {
      const { result } = renderHook(() => useProgramTable(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(result.current.programTableQuery.isSuccess).toBe(true);
      });
      result.current.programTableQuery.data?.forEach((program) => {
        const randomLesson = program.lessons[program.lessons.length - 1];
        if (program.name === 'Ser Estar Mini Course') {
          return;
        }
        expect(randomLesson.vocabKnown.length).toBeGreaterThan(
          program.lessons[0].vocabKnown.length,
        );
      });
    });
  });
});
