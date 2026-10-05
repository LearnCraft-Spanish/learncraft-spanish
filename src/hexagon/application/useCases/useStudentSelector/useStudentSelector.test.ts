import {
  mockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseUsingAsStudent,
  overrideMockUseUsingAsStudent,
  resetMockUseUsingAsStudent,
} from '@application/coordinators/hooks/useUsingAsStudent.mock';
import {
  mockUseAppStudentList,
  overrideMockUseAppStudentList,
  resetMockUseAppStudentList,
} from '@application/queries/useAppStudentList.mock';
import {
  mockUseAppUserLookup,
  overrideMockUseAppUserLookup,
  resetMockUseAppUserLookup,
} from '@application/queries/useAppUserLookup.mock';
import { useStudentSelector } from '@application/useCases/useStudentSelector';
import { act, renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/useAppStudentList', () => ({
  useAppStudentList: () => mockUseAppStudentList,
}));

vi.mock('@application/queries/useAppUserLookup', () => ({
  useAppUserLookup: () => mockUseAppUserLookup,
}));

const ana = { name: 'Ana Ruiz', emailAddress: 'ana@fake.not' };
const ben = { name: 'Ben Cho', emailAddress: 'ben@fake.not' };

describe('useStudentSelector', () => {
  beforeEach(() => {
    overrideMockUseAppStudentList({ appStudentList: [ben, ana] });
  });

  afterEach(() => {
    resetMockUseAppStudentList();
    resetMockUseAppUserLookup();
    resetMockActiveStudent();
    resetMockUseUsingAsStudent();
  });

  it('returns no options until something is typed', () => {
    const { result } = renderHook(() => useStudentSelector());
    expect(result.current.options).toEqual([]);
  });

  it('filters the list by name or email', () => {
    const { result } = renderHook(() => useStudentSelector());

    act(() => result.current.setSearchTerm('ana'));

    expect(result.current.options).toEqual([ana]);
  });

  it('uses the app as a full student', async () => {
    overrideMockUseAppUserLookup({
      fetchAppUserByEmail: async () =>
        createMockAppUser({
          emailAddress: ana.emailAddress,
          studentRole: 'student',
        }),
    });
    const { result } = renderHook(() => useStudentSelector());
    act(() => result.current.setSearchTerm('ana'));

    let ok = false;
    await act(async () => {
      ok = await result.current.selectStudent(ana);
    });

    expect(ok).toBe(true);
    expect(mockActiveStudent.changeActiveStudent).toHaveBeenCalledWith(
      ana.emailAddress,
    );
    expect(mockUseUsingAsStudent.setIsUsingAsStudent).toHaveBeenCalledWith(
      true,
    );
    expect(result.current.searchTerm).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('rejects a user without full student access', async () => {
    overrideMockUseAppUserLookup({
      fetchAppUserByEmail: async () =>
        createMockAppUser({
          emailAddress: ben.emailAddress,
          studentRole: 'limited',
        }),
    });
    const { result } = renderHook(() => useStudentSelector());

    let ok = true;
    await act(async () => {
      ok = await result.current.selectStudent(ben);
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe(
      "Ben Cho doesn't have full student access, so you can't use the app as them.",
    );
    expect(mockActiveStudent.changeActiveStudent).not.toHaveBeenCalled();
    expect(mockUseUsingAsStudent.setIsUsingAsStudent).not.toHaveBeenCalled();
  });

  it('reports a failed lookup', async () => {
    overrideMockUseAppUserLookup({
      fetchAppUserByEmail: async () => {
        throw new Error('network');
      },
    });
    const { result } = renderHook(() => useStudentSelector());

    await act(async () => {
      await result.current.selectStudent(ana);
    });

    expect(result.current.error).toBe("Couldn't load that student. Try again.");
    expect(result.current.isSelecting).toBe(false);
    expect(mockActiveStudent.changeActiveStudent).not.toHaveBeenCalled();
  });

  it('exits back to the staff view', () => {
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });
    const { result } = renderHook(() => useStudentSelector());

    expect(result.current.isUsingAsStudent).toBe(true);
    act(() => result.current.exitUsingAsStudent());

    expect(mockActiveStudent.resetActiveStudent).toHaveBeenCalledOnce();
    expect(mockUseUsingAsStudent.setIsUsingAsStudent).toHaveBeenCalledWith(
      false,
    );
  });
});
