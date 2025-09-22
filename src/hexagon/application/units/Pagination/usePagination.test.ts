import { renderHook } from '@testing-library/react';
import { usePagination } from './usePagination';

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
});
