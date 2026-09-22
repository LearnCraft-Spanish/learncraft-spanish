import { usePagination } from '@application/units/Pagination/usePagination';
import { act, renderHook } from '@testing-library/react';

describe('usePagination', () => {
  it('should render', () => {
    const { result } = renderHook(() =>
      usePagination({
        itemsPerPage: 5,
        totalItems: 15,
      }),
    );

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.maxPageNumber).toBe(3);
    expect(result.current.pageSize).toBe(5);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(5);
    expect(result.current.nextPage).toBeDefined();
    expect(result.current.previousPage).toBeDefined();
  });

  it('when totalItems is 0, pageNumber is 1 and indices are non-negative', () => {
    const { result } = renderHook(() =>
      usePagination({
        itemsPerPage: 5,
        totalItems: 0,
      }),
    );

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.maxPageNumber).toBe(0);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
  });

  it('jumps directly to a page', () => {
    const { result } = renderHook(() =>
      usePagination({ itemsPerPage: 5, totalItems: 15 }),
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.pageNumber).toBe(3);
    expect(result.current.startIndex).toBe(10);
    expect(result.current.isOnLastPage).toBe(true);
  });

  it('clamps a page past the end back to the last page', () => {
    const { result } = renderHook(() =>
      usePagination({ itemsPerPage: 5, totalItems: 15 }),
    );

    act(() => {
      result.current.goToPage(9);
    });

    expect(result.current.pageNumber).toBe(3);
  });

  it('clamps a page below one back to the first page', () => {
    const { result } = renderHook(() =>
      usePagination({ itemsPerPage: 5, totalItems: 15 }),
    );

    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.pageNumber).toBe(1);
  });

  it('stays on page one when there are no items', () => {
    const { result } = renderHook(() =>
      usePagination({ itemsPerPage: 5, totalItems: 0 }),
    );

    act(() => {
      result.current.goToPage(4);
    });

    expect(result.current.pageNumber).toBe(1);
  });
});
