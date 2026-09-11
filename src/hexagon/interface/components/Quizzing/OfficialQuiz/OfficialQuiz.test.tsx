import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import pageShellStyles from '@interface/components/general/PageShell/PageShell.module.scss';
import { OfficialQuiz } from '@interface/components/Quizzing/OfficialQuiz/OfficialQuiz';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockUseOfficialQuizPage = vi.fn();

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock(
  '@application/useCases/useOfficialQuizPage/useOfficialQuizPage',
  () => ({
    useOfficialQuizPage: () => mockUseOfficialQuizPage(),
  }),
);

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@interface/components/Quizzing/TextQuiz', () => ({
  RegularTextQuiz: () => <div data-testid="text-quiz" />,
}));

function renderOfficialQuiz(): void {
  render(
    <MemoryRouter initialEntries={['/officialquizzes/lcsp/1']}>
      <OfficialQuiz />
    </MemoryRouter>,
  );
}

describe('component OfficialQuiz', () => {
  afterEach(() => {
    resetMockUseStudentUiVersion();
    mockUseOfficialQuizPage.mockReset();
    cleanup();
  });

  it('covers loading with PageShell when the official quiz v2 flag is on', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    mockUseOfficialQuizPage.mockReturnValue({
      quizExamples: undefined,
      quizTitle: undefined,
      isLoading: true,
      error: null,
    });

    renderOfficialQuiz();

    const loading = screen.getByText('Loading Quiz...');
    expect(loading).toBeInTheDocument();
    expect(loading.closest(`.${pageShellStyles.root}`)).not.toBeNull();
  });

  it('leaves loading unwrapped on v1 so the legacy paper texture can show', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });
    mockUseOfficialQuizPage.mockReturnValue({
      quizExamples: undefined,
      quizTitle: undefined,
      isLoading: true,
      error: null,
    });

    renderOfficialQuiz();

    const loading = screen.getByText('Loading Quiz...');
    expect(loading).toBeInTheDocument();
    expect(loading.closest(`.${pageShellStyles.root}`)).toBeNull();
  });
});
