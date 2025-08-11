import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useBulkSelect from './useBulkSelect';

describe('useBulkSelect', () => {
  it('should render', () => {
    const { result } = renderHook(() =>
      useBulkSelect(vi.fn(() => Promise.resolve())),
    );
    expect(result.current.bulkSelectMode).toBe(false);
    expect(result.current.bulkOperationInProgress).toBe(false);
    expect(result.current.bulkSelectIds).toEqual([]);
  });
});
