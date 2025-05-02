import { fakeForTestingMutation } from './fakeForTestingMutation';

describe('fakeForTestingMutation', () => {
  it('should return a fake object', () => {
    const result = fakeForTestingMutation();
    expect(result).toEqual({
      id: '1',
      name: 'Test',
    });
  });
});
