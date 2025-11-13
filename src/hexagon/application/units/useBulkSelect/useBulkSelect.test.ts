import useBulkSelect from '@application/units/useBulkSelect/useBulkSelect';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

describe('useBulkSelect', () => {
  it('should render with initial state', () => {
    const { result } = renderHook(() =>
      useBulkSelect(vi.fn(() => Promise.resolve())),
    );
    expect(result.current.bulkSelectMode).toBe(false);
    expect(result.current.bulkOperationInProgress).toBe(false);
    expect(result.current.bulkSelectIds).toEqual([]);
  });

  it('should add and remove items from bulk select', () => {
    const { result } = renderHook(() =>
      useBulkSelect(vi.fn(() => Promise.resolve())),
    );

    act(() => {
      result.current.addToBulkSelect(1);
      result.current.addToBulkSelect(2);
    });
    expect(result.current.bulkSelectIds).toEqual([1, 2]);

    act(() => {
      result.current.removeFromBulkSelect(1);
    });
    expect(result.current.bulkSelectIds).toEqual([2]);
  });

  it('should add all items with deduplication', () => {
    const { result } = renderHook(() =>
      useBulkSelect(vi.fn(() => Promise.resolve())),
    );

    act(() => {
      result.current.addToBulkSelect(1);
      result.current.addAllToBulkSelect([1, 2, 3]);
    });
    expect(result.current.bulkSelectIds).toEqual([1, 2, 3]);
  });

  it('should clear bulk select and toggle mode', () => {
    const { result } = renderHook(() =>
      useBulkSelect(vi.fn(() => Promise.resolve())),
    );

    act(() => {
      result.current.addToBulkSelect(1);
      result.current.toggleBulkSelectMode();
    });
    expect(result.current.bulkSelectMode).toBe(true);
    expect(result.current.bulkSelectIds).toEqual([1]);

    act(() => {
      result.current.clearBulkSelect();
    });
    expect(result.current.bulkSelectIds).toEqual([]);
  });

  it('should handle bulk operation success', async () => {
    const mockBulkOperation = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useBulkSelect(mockBulkOperation));

    act(() => {
      result.current.addToBulkSelect(1);
      result.current.addToBulkSelect(2);
    });

    await act(async () => {
      await result.current.triggerBulkOperation();
    });

    expect(mockBulkOperation).toHaveBeenCalledWith([1, 2]);
    expect(result.current.bulkSelectIds).toEqual([]);
    expect(result.current.bulkOperationInProgress).toBe(false);
  });
});
