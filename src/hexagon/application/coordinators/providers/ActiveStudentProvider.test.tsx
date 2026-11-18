import type { ActiveStudentContextType } from '@application/coordinators/contexts/ActiveStudentContext';
import type { ReactNode } from 'react';
import ActiveStudentContext from '@application/coordinators/contexts/ActiveStudentContext';
import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { act, renderHook } from '@testing-library/react';
import { use } from 'react';
import { describe, expect, it } from 'vitest';

function wrapper({ children }: { children: ReactNode }) {
  return <ActiveStudentProvider>{children}</ActiveStudentProvider>;
}

function renderContext() {
  return renderHook(
    (): ActiveStudentContextType => use(ActiveStudentContext)!,
    {
      wrapper,
    },
  );
}

describe('activeStudentProvider', () => {
  it('starts with no student selected and no selection made', () => {
    const { result } = renderContext();

    expect(result.current.studentSelectionState).toEqual({
      email: null,
      changed: false,
    });
  });

  it('stores the selection it is given', () => {
    const { result } = renderContext();

    act(() =>
      result.current.updateSelectedStudent({
        email: 'student-lcsp@fake.not',
        changed: true,
      }),
    );

    expect(result.current.studentSelectionState).toEqual({
      email: 'student-lcsp@fake.not',
      changed: true,
    });
  });

  it('can return to having made no selection', () => {
    const { result } = renderContext();
    act(() =>
      result.current.updateSelectedStudent({
        email: 'student-lcsp@fake.not',
        changed: true,
      }),
    );

    act(() =>
      result.current.updateSelectedStudent({ email: null, changed: false }),
    );

    expect(result.current.studentSelectionState).toEqual({
      email: null,
      changed: false,
    });
  });
});
