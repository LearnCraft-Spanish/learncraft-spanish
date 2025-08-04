import { renderHook } from '@testing-library/react';
import usePagination from './usePagination';

describe('usePagination', () => {
  it('should render', () => {
    const { result } = renderHook(() =>
      usePagination({
        displayOrder: [{ recordId: 1 }, { recordId: 2 }, { recordId: 3 }],
        itemsPerPage: 1,
      }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.maxPage).toBe(3);
    expect(result.current.pageSize).toBe(1);
    expect(result.current.firstItemInPage).toBe(1);
    expect(result.current.displayOrderSegment).toEqual([{ recordId: 1 }]);
    expect(result.current.nextPage).toBeDefined();
    expect(result.current.previousPage).toBeDefined();
  });
});
