import { vi } from 'vitest';

describe('testing environment', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async tests', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should handle mocks without imports', () => {
    // Create a mock function directly with vi
    const mockFn = vi.fn().mockReturnValue('mocked value');

    const result = mockFn();

    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('mocked value');
  });
});
