import type { OfficialQuizSetupMenuProps } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import type { QuizGroup } from '@learncraft-spanish/shared';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import OfficialQuizzesRoutes from '@interface/pages/OfficialQuizzes/OfficialQuizzesRoutes';
import { cleanup, render, screen } from '@testing-library/react';
import { createMockQuizGroup } from '@testing/factories/quizFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface MockUseOfficialQuizzesReturn {
  isLoading: boolean;
  error: Error | null;
  quizGroups: QuizGroup[];
  isLoggedIn: boolean;
  quizSetupMenuProps: OfficialQuizSetupMenuProps;
}

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

const mockUseOfficialQuizzes = vi.fn();

vi.mock('@application/useCases/useOfficialQuizzes/useOfficialQuizzes', () => ({
  useOfficialQuizzes: () => mockUseOfficialQuizzes(),
}));

const lcspGroup = createMockQuizGroup({
  id: 1,
  name: 'LearnCraft Spanish',
  urlSlug: 'lcsp',
  courseId: 1,
  published: true,
  quizzes: [],
});

function setUseOfficialQuizzes(
  overrides: Partial<MockUseOfficialQuizzesReturn> = {},
): void {
  mockUseOfficialQuizzes.mockReturnValue({
    isLoading: false,
    error: null,
    quizGroups: [lcspGroup],
    isLoggedIn: true,
    quizSetupMenuProps: {
      selectedQuizGroup: lcspGroup,
      setSelectedQuizGroup: vi.fn(),
      quizNumber: 0,
      setUserSelectedQuizNumber: vi.fn(),
      quizOptions: [],
      quizGroups: [lcspGroup],
      startQuiz: vi.fn(),
    },
    ...overrides,
  });
}

function renderRoutes(): ReturnType<typeof render> {
  return render(
    <MockAllProviders>
      <OfficialQuizzesRoutes />
    </MockAllProviders>,
  );
}

describe('component OfficialQuizzesRoutes', () => {
  afterEach(() => {
    resetMockUseStudentUiVersion();
    vi.clearAllMocks();
    cleanup();
  });

  it('renders the legacy setup menu when the v2 flag is off', () => {
    overrideMockUseStudentUiVersion({ version: 'v1' });
    setUseOfficialQuizzes();

    renderRoutes();

    expect(screen.getByText('Official Quizzes')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Begin Review' }),
    ).toBeInTheDocument();
  });

  it('renders the v2 setup menu when the v2 flag is on', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    setUseOfficialQuizzes();

    renderRoutes();

    expect(screen.getByText('Choose a quiz')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Begin quiz' }),
    ).toBeInTheDocument();
  });

  it('shows a login message when the user is not logged in', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    setUseOfficialQuizzes({ isLoggedIn: false });

    renderRoutes();

    expect(
      screen.getByText('You must be logged in to use this app.'),
    ).toBeInTheDocument();
  });

  it('shows a loading message while quizzes are loading', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    setUseOfficialQuizzes({ isLoading: true });

    renderRoutes();

    expect(screen.getByText('Loading Official Quizzes...')).toBeInTheDocument();
  });

  it('shows an error message when loading fails', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });
    setUseOfficialQuizzes({ error: new Error('boom') });

    renderRoutes();

    expect(
      screen.getByText('Error Loading Official Quizzes'),
    ).toBeInTheDocument();
  });
});
