import mockUseFrequensay, {
  defaultResult,
} from '@application/useCases/useFrequensay.mock';
import { render, screen } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { vi } from 'vitest';
import FrequensayPage from './FrequensayPage';

// Fix: Use a string to refer to the module path instead of an import variable
vi.mock('@application/useCases/useFrequensay', () => {
  return {
    useFrequensay: () => mockUseFrequensay(),
  };
});

describe('frequensayPage', () => {
  beforeEach(() => {
    mockUseFrequensay.mockReturnValue(defaultResult);
  });

  it('should render', () => {
    render(
      <TestQueryClientProvider>
        <FrequensayPage />
      </TestQueryClientProvider>,
    );

    expect(screen.getByText('FrequenSay')).toBeInTheDocument();
  });

  //isError true,
  it('should render error message if isError is true', () => {
    mockUseFrequensay.mockReturnValue({
      ...defaultResult,
      isError: true,
    });

    render(
      <TestQueryClientProvider>
        <FrequensayPage />
      </TestQueryClientProvider>,
    );

    expect(
      screen.getByText('Error Loading Frequensay Data'),
    ).toBeInTheDocument();
  });

  //isLoading true,
  it('should render loading message if isLoading is true', () => {
    mockUseFrequensay.mockReturnValue({
      ...defaultResult,
      isLoading: true,
    });

    render(
      <TestQueryClientProvider>
        <FrequensayPage />
      </TestQueryClientProvider>,
    );

    expect(screen.getByText('Loading Frequensay Data...')).toBeInTheDocument();
  });

  // component is not ready, renders "Please select a course and lesson range to enable Frequensay"
  it('should render "Please select a course and lesson range to enable Frequensay" if component is not ready', () => {
    mockUseFrequensay.mockReturnValue({
      ...defaultResult,
      isSuccess: false,
      isLoading: false,
      isError: false,
    });

    render(
      <TestQueryClientProvider>
        <FrequensayPage />
      </TestQueryClientProvider>,
    );

    expect(
      screen.getByText(
        'Please select a course and lesson range to enable Frequensay',
      ),
    ).toBeInTheDocument();
  });
});
