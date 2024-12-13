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

/*
Before Testing Notes:
- In order to test all aspects of the filtering function,
  we need to pass in a variety of examples to the component.
- This component is only used by an activeUser of type 'student'.
*/
/*
props: 

  examplesToParse: StudentExample[] | undefined;
  // setExamplesToParse: (examples: StudentExample[] | undefined) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  quizType: 'text' | 'audio';
  setQuizType: (quizType: 'text' | 'audio') => void;
  quizLength: number;
  setQuizLength: (quizLength: number) => void;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  isSrs: boolean;
  setIsSrs: (isSrs: boolean) => void;
  spanishFirst: boolean;
  setSpanishFirst: (spanishFirst: boolean) => void;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
  audioOrComprehension: 'audio' | 'comprehension';
  setAudioOrComprehension: (
    audioOrComprehension: 'audio' | 'comprehension',
    */

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
});
