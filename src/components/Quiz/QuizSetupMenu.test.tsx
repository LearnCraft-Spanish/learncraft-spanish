import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { getUserDataFromName } from '../../../mocks/data/serverlike/studentTable';
import allStudentFlashcards from '../../../mocks/data/hooklike/studentFlashcardData';

import { setupMockAuth } from '../../../tests/setupMockAuth';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';
import QuizSetupMenu from './QuizSetupMenu';

const student = getUserDataFromName('student-lcsp');
const studentFlashcards = allStudentFlashcards.find(
  (x) => x.userName === student?.name,
);

describe('component QuizSetupMenu', () => {
  beforeEach(() => {
    setupMockAuth({ userName: 'student-lcsp' });
  });
  describe('quiz type (text or audio)', () => {
    const TextQuizOptions = ['Start with Spanish', 'Srs Quiz'];
    const AudioQuizOptions = ['Comprehension Quiz', 'Autoplay'];
    it('shows correct options when quizType = text', async () => {
      render(
        <QuizSetupMenu
          examplesToParse={
            studentFlashcards?.studentFlashcardData.studentExamples
          }
          handleSubmit={() => {}}
          quizLength={5}
          setQuizLength={() => {}}
          quizType="text"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.getByRole('radio', { name: /text/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('radio', { name: /audio/i }),
        ).toBeInTheDocument();
      });
      TextQuizOptions.forEach((option) => {
        expect(screen.getByText(option, { exact: false })).toBeInTheDocument();
      });
    });
    it('shows correct options when quizType = audio', async () => {
      render(
        <QuizSetupMenu
          examplesToParse={
            studentFlashcards?.studentFlashcardData.studentExamples
          }
          handleSubmit={() => {}}
          quizLength={5}
          setQuizLength={() => {}}
          quizType="audio"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.getByRole('radio', { name: /text/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('radio', { name: /audio/i }),
        ).toBeInTheDocument();
      });
      AudioQuizOptions.forEach((option) => {
        expect(screen.getByText(option, { exact: false })).toBeInTheDocument();
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
      render(
        <QuizSetupMenu
          examplesToParse={examplesToParse}
          handleSubmit={() => {}}
          quizLength={5}
          setQuizLength={() => {}}
          quizType="text"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.queryByRole('radio', { name: /text/i }),
        ).toBeInTheDocument();
      });
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
      render(
        <QuizSetupMenu
          examplesToParse={
            studentFlashcards?.studentFlashcardData.studentExamples
          }
          handleSubmit={() => {}}
          quizLength={5}
          setQuizLength={() => {}}
          quizType="text"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.queryByRole('radio', { name: /text/i }),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText('Custom Only', { exact: false }),
        ).toBeInTheDocument();
      });
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
      render(
        <QuizSetupMenu
          examplesToParse={examplesToParse}
          handleSubmit={() => {}}
          quizLength={10}
          setQuizLength={() => {}}
          quizType="text"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs // true
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);

        expect(select).toBeInTheDocument();
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
    });
    it('filters examples by customOnly', async () => {
      const verifyCustomIsPresent = examplesToParse.some((example) => {
        return example.coachAdded;
      });
      if (!verifyCustomIsPresent) {
        throw new Error('No custom flashcards found');
      }
      render(
        <QuizSetupMenu
          examplesToParse={examplesToParse}
          handleSubmit={() => {}}
          quizLength={10}
          setQuizLength={() => {}}
          quizType="text"
          setQuizType={() => {}}
          customOnly // true
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);

        expect(select).toBeInTheDocument();
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
    });
    it('filteres examples by audio only ', async () => {
      render(
        <QuizSetupMenu
          examplesToParse={examplesToParse}
          handleSubmit={() => {}}
          quizLength={10}
          setQuizLength={() => {}}
          quizType="audio"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);

        expect(select).toBeInTheDocument();
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
      render(
        <QuizSetupMenu
          examplesToParse={studentExamplesWithoutAudio}
          handleSubmit={() => {}}
          quizLength={10}
          setQuizLength={() => {}}
          quizType="audio"
          setQuizType={() => {}}
          customOnly={false}
          setCustomOnly={() => {}}
          isSrs={false}
          setIsSrs={() => {}}
          spanishFirst={false}
          setSpanishFirst={() => {}}
          autoplay={false}
          setAutoplay={() => {}}
          audioOrComprehension="audio"
          setAudioOrComprehension={() => {}}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        const select = screen.getByLabelText(/number of flashcards:/i);

        expect(select).toBeInTheDocument();
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
