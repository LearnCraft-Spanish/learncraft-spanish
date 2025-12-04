import type { TableRow, ValidationState } from '@domain/PasteTable/General';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

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
  const validationState = {
    isValid: options?.isValid ?? true,
    errors: options?.errors ?? {},
  };

  return {
    validationState,
    isSaveEnabled: options?.isValid ?? true,
    validateAll: () => validationState,
  };
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseTableValidation,
  override: overrideMockUseTableValidation,
  reset: resetMockUseTableValidation,
} = createOverrideableMock<
  <T>(options: {
    rows: TableRow[];
    validateRow: (row: T) => Record<string, string>;
  }) => TableValidationResult<T>
>(() => createMockTableValidationResult());

// Export the default result for component testing
export { createMockTableValidationResult as defaultResult };
