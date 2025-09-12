import type { preSetQuizzes } from 'src/hexagon/application/units/Filtering/FilterPresets/preSetQuizzes';
import { useCustomQuiz } from '@application/useCases/useCustomQuiz/useCustomQuiz';
import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import { useCallback, useState } from 'react';
import { TextQuiz } from '../TextQuiz';
import CustomPreSetQuizWrapper from './CustomPreSetQuizWrapper';
import CustomPreSetQuizzes from './CustomPreSetQuizzes';
import { CustomQuizSetupMenu } from './CustomQuizSetupMenu';
import './CustomQuiz.scss';

export interface CustomQuizProps {
  filtersChanging: boolean;
  setFiltersChanging: (filtersChanging: boolean) => void;
}

export function CustomQuiz() {
  const {
    filterState: _filterState, // Temp fix to avoid lint error
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
    setCustomQuizType: _setCustomQuizType, // Temp fix to avoid lint error
  } = useCustomQuiz();

  const [quizObject, setQuizObject] = useState<{
    quizTitle: string;
    quizSkillTagKeys: string[];
  } | null>(null);

  const handleSetQuizObject = useCallback(
    (quiz: (typeof preSetQuizzes)[0]) => {
      setQuizObject({
        quizTitle: quiz.preset,
        quizSkillTagKeys: quiz.SkillTagKeys,
      });
      setPresetQuizReady(true);
    },
    [setQuizObject, setPresetQuizReady],
  );
  return (
    <>
      {/* {!customQuizReady && !presetQuizReady && (
        <div className="FilterToggle">
          <label
            htmlFor="customQuizType"
            className={`option ${customQuizType === 'custom-filters' ? 'selected' : ''}`}
            onClick={() => setCustomQuizType('custom-filters')}
          >
            Custom Filters
            <input
              type="radio"
              id="customQuizType"
              value="custom-filters"
              name="customQuizType"
            />
          </label>

          <label
            htmlFor="preSetQuizzes"
            className={`option ${customQuizType === 'pre-set-quizzes' ? 'selected' : ''}`}
            onClick={() => setCustomQuizType('pre-set-quizzes')}
          >
            Pre-set Quizzes
            <input
              type="radio"
              id="preSetQuizzes"
              value="preSetQuizzes"
              name="preSetQuizzes"
            />
          </label>
        </div>
      )} */}

      {customQuizType === 'custom-filters' &&
        (!customQuizReady ? (
          <>
            {/* <CustomQuizFilters filterState={filterState} /> */}
            <FlashcardFinderFilter closeable={false} />
            <div className="customQuizSettingsWrapper">
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
            </div>
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
