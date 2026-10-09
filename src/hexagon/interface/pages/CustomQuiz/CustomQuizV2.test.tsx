import type { TestUserEmail } from 'mocks/data/serverlike/userTable';
import { mockAudioAdapter } from '@application/adapters/audioAdapter.mock';
import { overrideMockUseUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent.mock';
import {
  mockUseExampleQuery,
  overrideMockUseExampleQuery,
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { CustomQuizV2 } from '@interface/pages/CustomQuiz/CustomQuizV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => mockAudioAdapter,
}));

vi.mock('@application/queries/ExampleQueries/useExampleQuery', () => ({
  useExampleQuery: mockUseExampleQuery,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

const QUIZ_SIZE = 3;

/**
 * jsdom has no `matchMedia`. Prefer reduced motion so next/finish commit
 * immediately without waiting on CSS animationend.
 */
function stubMatchMedia(): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function signInAsStaff(
  email: TestUserEmail,
  roles: { isAdmin: boolean; isCoach: boolean; isStudent: boolean },
): void {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail(email)!,
      isAuthenticated: true,
      isLimited: false,
      ...roles,
    },
    { appUser: getAppUserFromEmail(email) ?? null, isOwnUser: true },
  );
  overrideMockUseUsingAsStudent({ isUsingAsStudent: false });
}

function renderPage(): void {
  render(
    <MockAllProviders>
      <CustomQuizV2 />
    </MockAllProviders>,
  );
}

async function runWholeQuiz(): Promise<void> {
  const user = userEvent.setup();

  expect(
    (await screen.findAllByRole('heading', { name: 'Set up your quiz' }))
      .length,
  ).toBeGreaterThan(0);

  await user.click(
    screen.getAllByRole('button', { name: `Quiz ${QUIZ_SIZE} flashcards` })[0],
  );

  for (let card = 1; card <= QUIZ_SIZE; card++) {
    await user.click(
      await screen.findByRole('button', {
        name: 'Flashcard, showing the prompt. Press to flip.',
      }),
    );
    expect(
      await screen.findByRole('button', {
        name: 'Flashcard, showing the answer. Press to flip.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add to my flashcards' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove from my flashcards' }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: card === QUIZ_SIZE ? 'Finish' : 'Next',
      }),
    );
  }

  expect(await screen.findByText('Quiz Complete!')).toBeInTheDocument();
}

describe('custom quiz v2 without a selected student', () => {
  beforeEach(() => {
    stubMatchMedia();
    overrideMockUseStudentUiVersion({ version: 'v2' });
    overrideMockUseExampleQuery({
      filteredExamples: createMockExampleWithVocabularyList(QUIZ_SIZE),
      totalCount: QUIZ_SIZE,
      isLoading: false,
      isDependenciesLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    resetMockUseExampleQuery();
    resetMockUseStudentUiVersion();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('lets an admin with no student record run a quiz end to end, with no add/remove controls', async () => {
    signInAsStaff('admin-empty-role@fake.not', {
      isAdmin: true,
      isCoach: false,
      isStudent: false,
    });

    renderPage();

    await runWholeQuiz();
  });

  it('keeps add/remove hidden for a coach who also holds the Student role', async () => {
    signInAsStaff('student-admin@fake.not', {
      isAdmin: false,
      isCoach: true,
      isStudent: true,
    });

    renderPage();

    await runWholeQuiz();
  });
});
