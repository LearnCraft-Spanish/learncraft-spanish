import { createTypedMock } from './typedMock';

describe('createTypedMock', () => {
  it('should create a typed mock function', () => {
    // Create a mock function with a specific type signature
    const mockFn = createTypedMock<(name: string) => string>();

    // Configure the mock to return a specific value
    mockFn.mockReturnValue('Hello, World!');

    // Call the mock function
    const result = mockFn('Test');

    // Verify the mock was called with the expected argument
    expect(mockFn).toHaveBeenCalledWith('Test');

    // Verify the mock returned the expected value
    expect(result).toBe('Hello, World!');
  });

  it('should support mockImplementation', () => {
    // Create a typed mock with an implementation
    const mockFn = createTypedMock<
      (a: number, b: number) => number
    >().mockImplementation((a, b) => a + b);

    // Call the mock
    const result = mockFn(2, 3);

    // Verify the implementation works
    expect(result).toBe(5);
  });

  it('should work with async functions', async () => {
    // Create a typed async mock
    const mockFn =
      createTypedMock<(id: number) => Promise<string>>().mockResolvedValue(
        'data',
      );

    // Call the mock
    const result = await mockFn(123);

    // Verify the mock was called and returned the expected value
    expect(mockFn).toHaveBeenCalledWith(123);
    expect(result).toBe('data');
  });
});
