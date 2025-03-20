import { describe, it } from 'vitest';

import verifyRequiredInputs from './inputValidation';

describe('function verifyRequiredInputs', () => {
  it('returns false when all inputs are filled', () => {
    const inputs = [
      { value: 'value1', label: 'label1' },
      { value: 'value2', label: 'label2' },
    ];
    expect(verifyRequiredInputs(inputs)).toBe(false);
  });

  it('returns the first label of the first empty input', () => {
    const inputs = [
      { value: 'value1', label: 'label1' },
      { value: '', label: 'label2' },
      { value: '', label: 'label3' },
    ];
    expect(verifyRequiredInputs(inputs)).toBe('label2');
  });
});
