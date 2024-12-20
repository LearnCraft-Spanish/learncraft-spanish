import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import serverlikeData from '../../../mocks/data/serverlike/serverlikeData';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
import { allStudentsTable } from '../../../mocks/data/serverlike/studentTable';
import { setupMockAuth } from '../../../tests/setupMockAuth';
import LCSPQuizApp from './LCSPQuizApp';
import { fisherYatesShuffle } from '../../functions/fisherYatesShuffle';

const { quizExamplesTableArray } = serverlikeData().api;

describe('official quiz component', () => {
  it('renders the title', async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it('shows two menus', async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole('select')).toHaveLength(2);
    });
  });

  it('shows start button', async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText(/begin review/i)).toBeInTheDocument();
    });
  });

  it('shows menu button', async () => {
    render(
      <MockAllProviders>
        <LCSPQuizApp />
      </MockAllProviders>,
    );

    await waitFor(() => {
      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });
  });

  describe('test by role', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    const testUsers = allStudentsTable;
    testUsers.forEach((user) => {
      const randomizedQuizzes = fisherYatesShuffle(quizExamplesTableArray);
      const sampledQuiz = randomizedQuizzes[0];
      const sampledQuizNickname = sampledQuiz.quizNickname;
      const sampledQuizDetails = sampledQuizNickname.split(' ');
      const courseCode = sampledQuizDetails[0];
      const quizNumber = sampledQuizDetails.slice(-1)[0];
      it(`${user.name} can click through to a flashcard`, async () => {
        setupMockAuth({
          userName: user.name as
            | 'admin-empty-role'
            | 'empty-role'
            | 'none-role'
            | 'limited'
            | 'student-admin'
            | 'student-lcsp'
            | 'student-ser-estar',
        });
        render(
          <MockAllProviders route="/officialquizzes" childRoutes>
            <LCSPQuizApp />
          </MockAllProviders>,
        );

        const courseMenu: HTMLSelectElement = await waitFor(
          () => screen.getByLabelText(/select course/i) as HTMLSelectElement,
        );

        if (courseMenu.value !== courseCode) {
          act(() => {
            fireEvent.change(courseMenu, { target: { value: courseCode } });
          });
        }

        await waitFor(() => {
          expect(courseMenu.value).toBe(courseCode);
          expect(screen.getAllByRole('select')).toHaveLength(2);
        });

        const lessonMenu: HTMLSelectElement = await waitFor(
          () => screen.getByLabelText(/select quiz/i) as HTMLSelectElement,
        );

        await act(async () => {
          fireEvent.change(lessonMenu, { target: { value: quizNumber } });
        });

        await waitFor(() => {
          expect(screen.getAllByRole('select')).toHaveLength(2);
        });

        const startButton = await waitFor(() =>
          screen.getByText(/begin review/i),
        );
        await act(async () => {
          startButton.click();
        });
        const flashcard = await waitFor(() =>
          screen.getByLabelText(/flashcard/i),
        );
        await waitFor(() => {
          expect(flashcard).toBeInTheDocument();
        });
      });
    });
  });

  describe('test by quiz type', () => {
    const testQuizzes = quizExamplesTableArray;

    testQuizzes.forEach((quiz) => {
      const sampledQuizDetails = quiz.quizNickname.split(' ');
      const courseCode = sampledQuizDetails[0];
      const quizNumber = sampledQuizDetails.slice(-1)[0];
      it(`${quiz.quizNickname} lets user click through to a flashcard`, async () => {
        setupMockAuth({
          userName: 'limited',
        });
        render(
          <MockAllProviders route="/officialquizzes" childRoutes>
            <LCSPQuizApp />
          </MockAllProviders>,
        );
        await waitFor(() => {
          expect(screen.getByText(/official quizzes/i)).toBeInTheDocument();
        });

        const courseMenu: HTMLSelectElement = await waitFor(
          () => screen.getByLabelText(/select course/i) as HTMLSelectElement,
        );

        if (courseMenu.value !== courseCode) {
          act(() => {
            fireEvent.change(courseMenu, { target: { value: courseCode } });
          });
        }

        await waitFor(() => {
          expect(courseMenu.value).toBe(courseCode);
          expect(screen.getAllByRole('select')).toHaveLength(2);
        });

        const lessonMenu: HTMLSelectElement = await waitFor(
          () => screen.getByLabelText(/select quiz/i) as HTMLSelectElement,
        );

        await act(async () => {
          fireEvent.change(lessonMenu, { target: { value: quizNumber } });
        });

        await waitFor(() => {
          expect(screen.getAllByRole('select')).toHaveLength(2);
        });

        const startButton = await waitFor(() =>
          screen.getByText(/begin review/i),
        );
        await act(async () => {
          startButton.click();
        });

        const flashcard = await waitFor(() =>
          screen.getByLabelText(/flashcard/i),
        );
        await waitFor(() => {
          expect(flashcard).toBeInTheDocument();
        });
      });
    });
  });
});
