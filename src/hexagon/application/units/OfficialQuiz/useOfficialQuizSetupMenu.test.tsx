import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockOfficialQuizRecord } from 'src/hexagon/testing/factories/quizFactory';
import { TestQueryClientProvider } from 'src/hexagon/testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';
import { overrideMockOfficialQuizAdapter } from '../../adapters/officialQuizAdapter.mock';
import { overrideMockActiveStudent } from '../../coordinators/hooks/useActiveStudent.mock';
import { overrideMockSelectedCourseAndLessons } from '../../coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useOfficialQuizSetupMenu } from './useOfficialQuizSetupMenu';

describe('useOfficialQuizSetupMenu', () => {
  beforeEach(() => {
    overrideMockOfficialQuizAdapter({
      getOfficialQuizRecords: async () => [
        createMockOfficialQuizRecord({
          id: 1,
          courseCode: 'lcsp',
          quizNumber: 1,
          quizTitle: 'LCSP 1',
        }),
        createMockOfficialQuizRecord({
          id: 2,
          courseCode: 'si1m',
          quizNumber: 1,
          quizTitle: 'SI1M 1',
        }),
      ],
    });
    overrideMockSelectedCourseAndLessons({
      course: { id: 1, name: 'LearnCraft Spanish' } as any,
      toLesson: { lessonNumber: 1 } as any,
      isLoading: false,
    });
    overrideMockActiveStudent({
      appUser: { studentRole: 'student', lessonNumber: 1 } as any,
    });
  });

  it('prefills course and quiz number, filters quizOptions', async () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.courseCode).toBe('lcsp'));
    await waitFor(() => expect(result.current.quizNumber).toBe(1));
    await waitFor(() =>
      expect(result.current.quizOptions.map((q) => q.courseCode)).toEqual([
        'lcsp',
      ]),
    );
  });
});
