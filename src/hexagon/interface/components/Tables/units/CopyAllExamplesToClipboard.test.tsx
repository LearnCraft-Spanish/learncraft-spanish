import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { mockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { CopyAllExamplesToClipboard } from '@interface/components/Tables/units/CopyAllExamplesToClipboard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseCombinedFilters = vi.fn();
const mockCopyTableToClipboard = vi.fn();
const mockToastPromise = vi.fn();

vi.mock('@application/units/Filtering/useCombinedFilters', () => ({
  useCombinedFilters: (props: unknown) => mockUseCombinedFilters(props),
}));

vi.mock('@interface/components/Tables/units/functions', () => ({
  copyTableToClipboard: (...args: unknown[]) =>
    mockCopyTableToClipboard(...args),
}));

vi.mock('react-toastify', () => ({
  toast: {
    promise: (...args: unknown[]) => mockToastPromise(...args),
  },
}));

const defaultCombinedFilters = {
  filterState: {
    lessonRanges: [],
    excludeSpanglish: false,
    audioOnly: false,
    skillTags: [],
    includeUnpublished: false,
  },
  isLoading: false,
} as unknown as UseCombinedFiltersReturnType;

function renderComponent() {
  return render(<CopyAllExamplesToClipboard />);
}

describe('copyAllExamplesToClipboard', () => {
  beforeEach(() => {
    mockUseCombinedFilters.mockReturnValue(defaultCombinedFilters);
  });

  it('renders a button with the correct label', () => {
    renderComponent();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(
      screen.getByText('Copy all examples to clipboard'),
    ).toBeInTheDocument();
  });

  it('is enabled when the user is an admin and filters are not loading', () => {
    overrideMockAuthAdapter({ isAdmin: true });
    renderComponent();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('is disabled when the user is not an admin', () => {
    overrideMockAuthAdapter({ isAdmin: false });
    renderComponent();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when filters are loading', () => {
    overrideMockAuthAdapter({ isAdmin: true });
    mockUseCombinedFilters.mockReturnValue({
      ...defaultCombinedFilters,
      isLoading: true,
    });
    renderComponent();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls toast.promise with the correct messages when the button is clicked', () => {
    overrideMockAuthAdapter({ isAdmin: true });
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    expect(mockToastPromise).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        pending: 'Loading examples...',
        success: 'Added to clipboard',
        error: 'Failed to load examples',
      }),
    );
  });

  it('calls getFilteredExamples with the active filter state when the button is clicked', async () => {
    overrideMockAuthAdapter({ isAdmin: true });
    mockUseCombinedFilters.mockReturnValue({
      ...defaultCombinedFilters,
      filterState: {
        lessonRanges: [{ minLesson: 1, maxLesson: 10, courseId: 1 }],
        excludeSpanglish: true,
        audioOnly: false,
        skillTags: [],
        includeUnpublished: false,
      },
    } as unknown as UseCombinedFiltersReturnType);
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockExampleAdapter.getFilteredExamples).toHaveBeenCalledWith(
        expect.objectContaining({
          lessonRanges: [{ minLesson: 1, maxLesson: 10, courseId: 1 }],
          excludeSpanglish: true,
          audioOnly: false,
          skillTags: [],
          includeUnpublished: false,
          page: 1,
          limit: 1000000,
          disableCache: true,
        }),
      );
    });
  });

  it('calls copyTableToClipboard with the fetched examples after a successful fetch', async () => {
    overrideMockAuthAdapter({ isAdmin: true });
    renderComponent();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockCopyTableToClipboard).toHaveBeenCalled();
    });
  });
});
