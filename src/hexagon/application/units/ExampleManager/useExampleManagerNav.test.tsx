import useExampleManagerNav from '@application/units/ExampleManager/useExampleManagerNav';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useSelectedExamples
const mockSelectedExamples: any[] = [];
vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: () => ({
      selectedExamples: mockSelectedExamples,
    }),
  }),
);

describe('useExampleManagerNav', () => {
  beforeEach(() => {
    mockSelectedExamples.length = 0;
  });

  describe('activeSegment', () => {
    it('returns "search" as activeSegment when on /example-manager with no segment', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      await waitFor(() => {
        expect(result.current.activeSegment).toBe('search');
      });
    });

    it('returns "search" as activeSegment when on /example-manager/search', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/search']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.activeSegment).toBe('search');
    });

    it('returns "edit" as activeSegment when on /example-manager/edit', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/edit']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.activeSegment).toBe('edit');
    });

    it('returns "create" as activeSegment when on /example-manager/create', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/create']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.activeSegment).toBe('create');
    });

    it('returns "assign" as activeSegment when on /example-manager/assign', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/assign']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.activeSegment).toBe('assign');
    });

    it('handles nested routes correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/some/prefix/example-manager/edit']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.activeSegment).toBe('edit');
    });
  });

  describe('getNavOptionClassName', () => {
    it('returns only base class when segment is not active', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/search']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.getNavOptionClassName('edit')).toBe(
        'exampleManagerNavOption',
      );
      expect(result.current.getNavOptionClassName('create')).toBe(
        'exampleManagerNavOption',
      );
      expect(result.current.getNavOptionClassName('assign')).toBe(
        'exampleManagerNavOption',
      );
    });

    it('returns base class with "isActive" when segment is active', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/edit']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.getNavOptionClassName('edit')).toBe(
        'exampleManagerNavOption isActive',
      );
    });

    it('marks "search" as active when on /example-manager with no segment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.getNavOptionClassName('search')).toBe(
        'exampleManagerNavOption isActive',
      );
    });
  });

  describe('noExamplesSelected', () => {
    it('returns true when no examples are selected', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/search']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.noExamplesSelected).toBe(true);
    });

    it('returns false when examples are selected', () => {
      // Add mock examples
      mockSelectedExamples.push(
        { id: 1, exampleText: 'Example 1' },
        { id: 2, exampleText: 'Example 2' },
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/example-manager/edit']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useExampleManagerNav(), { wrapper });

      expect(result.current.noExamplesSelected).toBe(false);
    });
  });
});
