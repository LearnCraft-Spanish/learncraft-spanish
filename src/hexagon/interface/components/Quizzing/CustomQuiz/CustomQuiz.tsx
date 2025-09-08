import type { preSetQuizzes } from 'src/hexagon/domain/preSetQuizzes';
import { useCustomQuiz } from '@application/useCases/useCustomQuiz/useCustomQuiz';
import { useCallback, useState } from 'react';
import { TextQuiz } from '../TextQuiz';
import CustomPreSetQuizWrapper from './CustomPreSetQuizWrapper';
import CustomPreSetQuizzes from './CustomPreSetQuizzes';
import CustomQuizFilters from './CustomQuizFilters';
import { CustomQuizSetupMenu } from './CustomQuizSetupMenu';
export interface CustomQuizProps {
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
}

export function CustomQuiz() {
  const {
    filterState,
    availableQuizLengths,
    safeQuizLength,
    setSelectedQuizLength,
    customQuizReady,
    presetQuizReady,
    setPresetQuizReady,
    setCustomQuizReady,
    examplesToQuiz,
    startWithSpanish,
    setStartWithSpanish,
    isLoadingExamples,
    totalCount,

    customQuizType,
    setCustomQuizType,
  } = useCustomQuiz();

  const [quizObject, setQuizObject] = useState<{
    quizTitle: string;
    quizSkillTagKeys: string[];
  } | null>(null);

  const handleSetQuizObject = useCallback(
    (quiz: (typeof preSetQuizzes)[0]) => {
      setQuizObject({
        quizTitle: quiz.quizTitle,
        quizSkillTagKeys: quiz.SkilltagKeys,
      });
      setPresetQuizReady(true);
    },
    [setQuizObject, setPresetQuizReady],
  );
  return (
    <>
      {!customQuizReady && !presetQuizReady && (
        <div className="customQuizTypeSelector buttonBox header">
          <input
            type="radio"
            id="customQuizType"
            value="custom-filters"
            name="customQuizType"
          />
          <label
            htmlFor="customQuizType"
            className={customQuizType === 'custom-filters' ? 'selected' : ''}
            onClick={() => setCustomQuizType('custom-filters')}
          >
            Custom Filters
          </label>
          <input
            type="radio"
            id="preSetQuizzes"
            value="preSetQuizzes"
            name="preSetQuizzes"
          />
          <label
            htmlFor="preSetQuizzes"
            className={customQuizType === 'pre-set-quizzes' ? 'selected' : ''}
            onClick={() => setCustomQuizType('pre-set-quizzes')}
          >
            Pre-set Quizzes
          </label>
        </div>
      )}

      {customQuizType === 'custom-filters' &&
        (!customQuizReady ? (
          <>
            <CustomQuizFilters filterState={filterState} />
            <CustomQuizSetupMenu
              availableQuizLengths={availableQuizLengths}
              safeQuizLength={safeQuizLength}
              setSelectedQuizLength={setSelectedQuizLength}
              startQuizFunction={() => setCustomQuizReady(true)}
              startWithSpanish={startWithSpanish}
              updateStartWithSpanish={() =>
                setStartWithSpanish(!startWithSpanish)
              }
              isLoadingExamples={isLoadingExamples}
              totalCount={totalCount ?? 0}
            />
          </>
        ) : (
          <TextQuiz
            textQuizProps={{
              examples: examplesToQuiz,
              startWithSpanish,
              cleanupFunction: () => setCustomQuizReady(false),
            }}
          />
        ))}
      {customQuizType === 'pre-set-quizzes' && !presetQuizReady && (
        <CustomPreSetQuizzes handleSetQuizObject={handleSetQuizObject} />
      )}
      {customQuizType === 'pre-set-quizzes' &&
        presetQuizReady &&
        quizObject?.quizTitle &&
        quizObject?.quizSkillTagKeys && (
          <CustomPreSetQuizWrapper
            quizTitle={quizObject.quizTitle}
            quizSkillTagKeys={quizObject.quizSkillTagKeys}
            cleanupFunction={() => {
              setPresetQuizReady(false);
              setQuizObject(null);
            }}
          />
        )}
    </>
  );
}
