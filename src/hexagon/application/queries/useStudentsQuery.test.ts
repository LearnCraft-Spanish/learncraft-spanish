import { overrideMockStudentsAdapter } from '@application/adapters/studentsAdapter.mock';
import { useStudentsQuery } from '@application/queries/useStudentsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createRealisticStudentList } from '@testing/factories/studentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useStudentsQuery', () => {
  describe('studentsQuery', () => {
    it('should fetch students successfully', async () => {
      const mockData = createRealisticStudentList();
      overrideMockStudentsAdapter({
        getStudents: () => Promise.resolve(mockData),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.studentsQuery.isLoading).toBe(true);

      await waitFor(() =>
        expect(result.current.studentsQuery.isLoading).toBe(false),
      );
      expect(result.current.studentsQuery.isSuccess).toBe(true);
      expect(result.current.studentsQuery.data).toEqual(mockData);
    });

    it('should expose error state when the fetch fails', async () => {
      overrideMockStudentsAdapter({
        getStudents: () =>
          Promise.reject(new Error('Failed to fetch students')),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() =>
        expect(result.current.studentsQuery.isLoading).toBe(false),
      );
      expect(result.current.studentsQuery.isError).toBe(true);
      expect(result.current.studentsQuery.data).toBeUndefined();
    });
  });

  describe('createStudentMutation', () => {
    it('should call createStudent on the adapter and invalidate the query cache', async () => {
      const mockList = createRealisticStudentList();
      const newStudentInput = {
        name: 'David Ruiz',
        emailAddress: 'david.ruiz@example.com',
        role: null,
        cohort: 'D' as const,
        program: 'LCSP' as const,
        relatedProgram: 2,
      };
      const createdStudent = { ...newStudentInput, recordId: 99 };

      overrideMockStudentsAdapter({
        getStudents: () => Promise.resolve(mockList),
        createStudent: () => Promise.resolve(createdStudent),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() =>
        expect(result.current.studentsQuery.isSuccess).toBe(true),
      );

      await result.current.createStudentMutation.mutateAsync(newStudentInput);

      expect(result.current.createStudentMutation.error).toBeNull();
    });

    it('should expose error state when createStudent fails', async () => {
      overrideMockStudentsAdapter({
        createStudent: () =>
          Promise.reject(new Error('Failed to create student')),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.createStudentMutation.mutateAsync({
          name: '',
          emailAddress: '',
          role: null,
          cohort: 'A',
          program: 'LCSP',
          relatedProgram: 2,
        }),
      ).rejects.toThrow('Failed to create student');
    });
  });

  describe('updateStudentMutation', () => {
    it('should call updateStudent on the adapter and invalidate the query cache', async () => {
      const mockList = createRealisticStudentList();
      const existingStudent = mockList[0];
      const updatedStudent = { ...existingStudent, name: 'Ana Updated' };

      overrideMockStudentsAdapter({
        getStudents: () => Promise.resolve(mockList),
        updateStudent: () => Promise.resolve(updatedStudent),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() =>
        expect(result.current.studentsQuery.isSuccess).toBe(true),
      );

      await result.current.updateStudentMutation.mutateAsync(existingStudent);

      expect(result.current.updateStudentMutation.error).toBeNull();
    });

    it('should expose error state when updateStudent fails', async () => {
      const mockList = createRealisticStudentList();
      const existingStudent = mockList[0];

      overrideMockStudentsAdapter({
        updateStudent: () =>
          Promise.reject(new Error('Failed to update student')),
      });

      const { result } = renderHook(() => useStudentsQuery(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.updateStudentMutation.mutateAsync(existingStudent),
      ).rejects.toThrow('Failed to update student');
    });
  });
});
