import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function renderQueryPagination(
  overrides: Partial<{
    queryPage: number;
    pageSize: number;
    queryPageSize: number;
    totalCount: number | undefined;
  }> = {},
) {
  const changeQueryPage = vi.fn();
  const defaults = {
    queryPage: 1,
    pageSize: 10,
    queryPageSize: 50,
    totalCount: 100,
  };
  const props = { ...defaults, ...overrides, changeQueryPage };

  const { result } = renderHook(() => useQueryPagination(props));
  return { result, changeQueryPage };
}

describe('useQueryPagination', () => {
  describe('initial state', () => {
    it('starts on page 1 with correct derived values', () => {
      const { result } = renderQueryPagination();
      expect(result.current.page).toBe(1);
      expect(result.current.pagesPerQuery).toBe(5); // 50 / 10
      expect(result.current.pageWithinQueryBatch).toBe(0);
      expect(result.current.maxPageNumber).toBe(10); // 100 / 10
      expect(result.current.maxPageName).toBe('10');
    });

    it('shows "many" for maxPageName when totalCount is undefined', () => {
      const { result } = renderQueryPagination({ totalCount: undefined });
      expect(result.current.maxPageNumber).toBe(0);
      expect(result.current.maxPageName).toBe('many');
    });
  });

  describe('nextPage', () => {
    it('advances to page 2 without changing query page (same batch)', () => {
      const { result, changeQueryPage } = renderQueryPagination();
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(2);
      expect(changeQueryPage).toHaveBeenCalledWith(1);
    });

    it('advances query page when crossing a batch boundary (page 5 → 6)', () => {
      const { result, changeQueryPage } = renderQueryPagination();
      // Advance to page 5 first
      act(() => {
        result.current.nextPage();
      });
      act(() => {
        result.current.nextPage();
      });
      act(() => {
        result.current.nextPage();
      });
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(5);
      changeQueryPage.mockClear();

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(6);
      expect(changeQueryPage).toHaveBeenCalledWith(2);
    });

    it('does not advance past maxPageNumber', () => {
      const { result, changeQueryPage } = renderQueryPagination({
        totalCount: 10,
      });
      // maxPageNumber = 1
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(1);
      expect(changeQueryPage).not.toHaveBeenCalled();
    });
  });

  describe('previousPage', () => {
    it('does not go below page 1', () => {
      const { result, changeQueryPage } = renderQueryPagination();
      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(1);
      expect(changeQueryPage).not.toHaveBeenCalled();
    });

    it('moves back to page 1 from page 2', () => {
      const { result, changeQueryPage } = renderQueryPagination();
      act(() => {
        result.current.nextPage();
      });
      changeQueryPage.mockClear();
      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(1);
      expect(changeQueryPage).toHaveBeenCalledWith(1);
    });
  });

  describe('resetPagination', () => {
    it('resets to page 1 and calls changeQueryPage(1)', () => {
      const { result, changeQueryPage } = renderQueryPagination();
      act(() => {
        result.current.nextPage();
      });
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(3);
      changeQueryPage.mockClear();

      act(() => {
        result.current.resetPagination();
      });
      expect(result.current.page).toBe(1);
      expect(changeQueryPage).toHaveBeenCalledWith(1);
    });
  });
});
