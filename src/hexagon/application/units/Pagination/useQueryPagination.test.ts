import { useQueryPagination } from '@application/units/Pagination/useQueryPagination';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useQueryPagination', () => {
  it('jumps to an arbitrary page and updates the query batch', () => {
    const changeQueryPage = vi.fn<(page: number) => void>();
    const { result } = renderHook(() =>
      useQueryPagination({
        queryPage: 1,
        pageSize: 25,
        queryPageSize: 150,
        totalCount: 200,
        changeQueryPage,
      }),
    );

    act(() => {
      result.current.goToPage(7);
    });

    expect(result.current.page).toBe(7);
    expect(changeQueryPage).toHaveBeenCalledWith(2);
  });

  it('does not move past the last page or onto the current page', () => {
    const changeQueryPage = vi.fn<(page: number) => void>();
    const { result } = renderHook(() =>
      useQueryPagination({
        queryPage: 1,
        pageSize: 25,
        queryPageSize: 150,
        totalCount: 50,
        changeQueryPage,
      }),
    );

    act(() => {
      result.current.goToPage(1);
      result.current.goToPage(9);
    });

    expect(result.current.page).toBe(1);
    expect(changeQueryPage).not.toHaveBeenCalled();
  });

  it('steps forward and back through goToPage', () => {
    const changeQueryPage = vi.fn<(page: number) => void>();
    const { result } = renderHook(() =>
      useQueryPagination({
        queryPage: 1,
        pageSize: 25,
        queryPageSize: 150,
        totalCount: 75,
        changeQueryPage,
      }),
    );

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.previousPage();
    });
    expect(result.current.page).toBe(1);
  });
});
