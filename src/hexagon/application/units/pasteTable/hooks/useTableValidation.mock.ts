import type { TableRow, ValidationState } from '../types';
import { createTypedMock } from '@testing/utils/typedMock';

// Define the hook result interface
export interface TableValidationResult<_T> {
  validationState: ValidationState;
  isSaveEnabled: boolean;
  validateAll: () => ValidationState;
}

// Factory function to create mock results
export const createMockTableValidationResult = <_T>(options?: {
  isValid?: boolean;
  errors?: Record<string, Record<string, string>>;
}): TableValidationResult<_T> => {
  return {
    validationState: {
      isValid: options?.isValid ?? true,
      errors: options?.errors ?? {},
    },
    isSaveEnabled: options?.isValid ?? true,
    validateAll: createTypedMock<() => ValidationState>().mockImplementation(
      () => ({
        isValid: options?.isValid ?? true,
        errors: options?.errors ?? {},
      }),
    ),
  };
};

// Main mock function for the hook
export const mockUseTableValidation = createTypedMock<
  <T>(options: {
    rows: TableRow[];
    validateRow: (row: T) => Record<string, string>;
  }) => TableValidationResult<T>
>().mockImplementation(() => createMockTableValidationResult());
