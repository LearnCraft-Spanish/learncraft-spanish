import { render, screen, waitFor } from '@testing-library/react';
import allStudentFlashcards from 'mocks/data/hooklike/studentFlashcardData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';

import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeEach, describe, expect, it } from 'vitest';
import QuizSetupMenu from './QuizSetupMenu';

const student = getAuthUserFromEmail('student-lcsp@fake.not')!;
const studentFlashcards = allStudentFlashcards.find(
  (x) => x.emailAddress === student?.email,
);
const defaultProps = {
  examplesToParse: studentFlashcards?.studentFlashcardData.studentExamples,
  handleSubmit: () => {},
  quizLength: 5,
  setQuizLength: () => {},
  quizType: 'text',
  setQuizType: () => {},
  customOnly: false,
  setCustomOnly: () => {},
  isSrs: false,
  setIsSrs: () => {},
  spanishFirst: false,
  setSpanishFirst: () => {},
  autoplay: false,
  setAutoplay: () => {},
  audioOrComprehension: 'audio',
  setAudioOrComprehension: () => {},
};
async function successfulRender(overrides: any = {}) {
  const props = { ...defaultProps, ...overrides };
  render(<QuizSetupMenu {...props} />, { wrapper: MockAllProviders });
  await waitFor(() => {
    expect(screen.queryByRole('radio', { name: /text/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /audio/i })).toBeInTheDocument();
  });
}

describe('component QuizSetupMenu', () => {
  beforeEach(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isStudent: true,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
  });
  describe('quiz type (text or audio)', () => {
    const TextQuizOptions = ['Start with Spanish', 'Srs Quiz'];
    const AudioQuizOptions = ['Comprehension Quiz', 'Autoplay'];
    it('shows correct options when quizType = text', async () => {
      await successfulRender({ quizType: 'text' });
      TextQuizOptions.forEach((option) => {
        expect(screen.getByText(option, { exact: false })).toBeInTheDocument();
      });
    });
    it('shows correct options when quizType = audio', async () => {
      await successfulRender({ quizType: 'audio' });
      AudioQuizOptions.forEach((option) => {
        expect(screen.getByText(option, { exact: false })).toBeInTheDocument();
      });
    });

    it('default quiz menu shows options going up to length of examples', async () => {
      await successfulRender();
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);
        const options = select.querySelectorAll('option');
        const optionValues = Array.from(options).map((option) => option.value);
        // @ts-expect-error - I am confident optionValues will have at least one element
        expect(Number.parseInt(optionValues.at(-1))).toBe(
          defaultProps.examplesToParse?.length,
        );
      });
    });
  });
  describe('custom flashcards', () => {
    it('has no custom flashcards, so customOnly is not rendered', async () => {
      const examplesToParse =
        studentFlashcards?.studentFlashcardData.studentExamples.filter(
          (example) => {
            return example.coachAdded;
          },
        );
      await successfulRender({ examplesToParse });
      await waitFor(() => {
        expect(screen.queryByText('Custom Only', { exact: false })).toBeNull();
      });
    });
    it('has custom flashcards, so customOnly is rendered', async () => {
      const verifyCustomIsPresent =
        studentFlashcards?.studentFlashcardData.studentExamples.some(
          (example) => {
            return example.coachAdded;
          },
        );
      if (!verifyCustomIsPresent) {
        throw new Error('No custom flashcards found');
      }
      await successfulRender();
      await waitFor(
        () => {
          expect(
            screen.getByText('Custom Only', { exact: false }),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  });
  describe('filtering functionality', () => {
    const examplesToParse =
      studentFlashcards?.studentFlashcardData.studentExamples;
    if (!examplesToParse) {
      throw new Error('No examples to parse');
    }
    const initialLength = examplesToParse.length;
    it('filters examples by SRS', async () => {
      await successfulRender({ isSrs: true });
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);
        const options = select.querySelectorAll('option');
        const optionValues = Array.from(options).map((option) => option.value);
        // @ts-expect-error - I am confident optionValues will have at least one element
        expect(Number.parseInt(optionValues.at(-1))).toBeLessThan(
          initialLength,
        );
      });
    });
    it('filters examples by customOnly', async () => {
      const verifyCustomIsPresent = examplesToParse.some((example) => {
        return example.coachAdded;
      });
      if (!verifyCustomIsPresent) {
        throw new Error('No custom flashcards found');
      }
      await successfulRender({ customOnly: true });
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);
        const options = select.querySelectorAll('option');
        const optionValues = Array.from(options).map((option) => option.value);

        // @ts-expect-error - I am confident optionValues will have at least one element
        expect(Number.parseInt(optionValues.at(-1))).toBeLessThan(
          initialLength,
        );
      });
    });
    it('filteres examples by audio only ', async () => {
      await successfulRender({ quizType: 'audio' });
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);
        const options = select.querySelectorAll('option');
        const optionValues = Array.from(options).map((option) => option.value);
        // @ts-expect-error - I am confident optionValues will have at least one element
        expect(Number.parseInt(optionValues.at(-1))).toBeLessThan(
          initialLength,
        );
      });
    });
    it('when filtered examples === 0, start button is disabled', async () => {
      // Becase we cant just pass in no examples (breaks component), we are passing in only examples without audio
      // then filtering by audio only, making total # of examples 0
      const examplesWithoutAudio =
        studentFlashcards?.studentFlashcardData.examples.filter((example) => {
          return example.englishAudio.length === 0;
        });
      const studentExamplesWithoutAudio = examplesToParse.filter(
        (studentExample) => {
          return examplesWithoutAudio.some(
            (example) => example.recordId === studentExample.relatedExample,
          );
        },
      );
      if (studentExamplesWithoutAudio.length === 0) {
        throw new Error('No examples without audio found');
      }
      await successfulRender({
        examplesToParse: studentExamplesWithoutAudio,
        quizType: 'audio',
      });
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);
        const options = select.querySelectorAll('option');
        const optionValues = Array.from(options).map((option) => option.value);
        // @ts-expect-error - I am confident optionValues will have at least one element
        expect(Number.parseInt(optionValues.at(-1))).toBeLessThan(
          initialLength,
        );
      });
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /start/i });
        expect(button).toBeDisabled();
      });
    });
  });
});
