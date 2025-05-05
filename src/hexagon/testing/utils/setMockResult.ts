import type { vi } from 'vitest';

type AnyMock = ReturnType<typeof vi.fn>;

export function setMockResult<T>(
  mockFn: AnyMock,
  value: T | Error | undefined | null,
): void {
  if (value instanceof Error) {
    mockFn.mockRejectedValue(value);
  } else if (value !== undefined) {
    mockFn.mockResolvedValue(value);
  }
  // Else: do nothing, leave existing default
}
