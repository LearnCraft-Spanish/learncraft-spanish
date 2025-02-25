import type { StudentExample } from 'src/types/interfaceDefinitions';
import React, { useMemo } from 'react';
import MenuButton from 'src/components/Buttons/MenuButton';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';

interface QuizSetupMenuProps {
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
  ) => void;
}
export default function QuizSetupMenu({
  examplesToParse,
  handleSubmit,
  quizLength,
  setQuizLength,
  quizType,
  setQuizType,
  customOnly,
  setCustomOnly,
  isSrs,
  setIsSrs,
  spanishFirst,
  setSpanishFirst,
  autoplay,
  setAutoplay,
  audioOrComprehension,
  setAudioOrComprehension,
}: QuizSetupMenuProps) {
  const { flashcardDataQuery } = useStudentFlashcards();
  const hasCustomExamples = useMemo(() => {
    return flashcardDataQuery.data?.studentExamples?.some(
      (studentExample) => studentExample?.coachAdded,
    );
  }, [flashcardDataQuery.data?.studentExamples]);

  // const [quizLength, setQuizLength] = useState(10);

  const calculateQuizLengthOptions = useMemo(() => {
    let currentAllowedExamples = examplesToParse;
    if (customOnly) {
      currentAllowedExamples = flashcardDataQuery.data?.studentExamples?.filter(
        (studentExample) => studentExample.coachAdded,
      );
    }
    if (quizType === 'audio') {
      // Get Examples from current allowed studentExamples
      const currentExamples = currentAllowedExamples?.map((studentExample) => {
        return flashcardDataQuery.data?.examples.find(
          (example) => example.recordId === studentExample.relatedExample,
        );
      });
      // Filter out examples without audio
      const allowedCurrentExamples = currentExamples?.filter(
        (example) =>
          example?.englishAudio?.length && example?.englishAudio?.length > 0,
      );
      // Filter out studentExamples that don't have an example (with audio)
      currentAllowedExamples = currentAllowedExamples?.filter(
        (studentExample) =>
          allowedCurrentExamples?.find(
            (example) => example?.recordId === studentExample?.relatedExample,
          ),
      );
    } else {
      if (isSrs) {
        currentAllowedExamples = currentAllowedExamples?.filter(
          (studentExample) =>
            studentExample.nextReviewDate
              ? new Date(studentExample.nextReviewDate) <= new Date()
              : true,
        );
      }
    }
    if (!currentAllowedExamples?.length) {
      return [0];
    }
    // Calculate quiz length options
    const exampleCount = currentAllowedExamples.length;
    const quizLengthOptions = [];
    if (currentAllowedExamples?.length > 5) {
      for (let i = 5; i < exampleCount; i = i * 2) {
        quizLengthOptions.push(i);
      }
    }
    quizLengthOptions.push(exampleCount);
    return quizLengthOptions;
  }, [
    customOnly,
    examplesToParse,
    flashcardDataQuery.data?.examples,
    flashcardDataQuery.data?.studentExamples,
    isSrs,
    quizType,
  ]);

  return (
    <form className="myFlashcardsForm" onSubmit={(e) => handleSubmit(e)}>
      <div className="myFlashcardsFormContentWrapper">
        <h3>Review My Flashcards</h3>
        <h4>Quiz Type:</h4>
        <div className="buttonBox header">
          <input type="radio" id="quizType" value="text" name="quizType" />
          <label
            htmlFor="quizType"
            className={quizType === 'text' ? 'selected' : ''}
            onClick={() => setQuizType('text')}
          >
            Text
          </label>
          <input type="radio" id="audio" value="audio" name="quizType" />
          <label
            htmlFor="audio"
            className={quizType === 'audio' ? 'selected' : ''}
            onClick={() => setQuizType('audio')}
          >
            Audio
          </label>
        </div>
        {quizType === 'text' && (
          <div className="quizTypeSettingsWrapper">
            <div>
              <p>Start with Spanish:</p>
              <label htmlFor="spanishFirst" className="switch">
                <input
                  type="checkbox"
                  name="Spanish First"
                  id="spanishFirst"
                  checked={spanishFirst}
                  onChange={(e) => setSpanishFirst(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>SRS Quiz:</p>
              <label htmlFor="isSrs" className="switch">
                <input
                  type="checkbox"
                  name="Srs"
                  id="isSrs"
                  checked={isSrs}
                  onChange={(e) => setIsSrs(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
        {quizType === 'audio' && (
          <div className="quizTypeSettingsWrapper">
            <div>
              <p>Comprehension Quiz:</p>
              <label htmlFor="isComprehension" className="switch">
                <input
                  type="checkbox"
                  name="comprehension"
                  id="isComprehension"
                  checked={audioOrComprehension === 'comprehension'}
                  onChange={(e) =>
                    setAudioOrComprehension(
                      e.target.checked ? 'comprehension' : 'audio',
                    )
                  }
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>Autoplay:</p>
              <label htmlFor="autoplay" className="switch">
                <input
                  type="checkbox"
                  name="autoplay"
                  id="autoplay"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        )}
        {hasCustomExamples && (
          <div className="QuizMenuCustomOnly">
            <p>Custom Only:</p>
            <label htmlFor="customOnly" className="switch">
              <input
                type="checkbox"
                name="Custom Only"
                id="customOnly"
                checked={customOnly}
                onChange={(e) => setCustomOnly(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}
        <label htmlFor="quizLength">
          <p>Number of Flashcards:</p>
          <select
            name="length"
            id="quizLength"
            onChange={(e) => setQuizLength(Number.parseInt(e.target.value))}
            defaultValue={quizLength}
          >
            {calculateQuizLengthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="buttonBox">
        <button type="submit" disabled={calculateQuizLengthOptions[0] === 0}>
          Start Quiz
        </button>
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </form>
  );
}
