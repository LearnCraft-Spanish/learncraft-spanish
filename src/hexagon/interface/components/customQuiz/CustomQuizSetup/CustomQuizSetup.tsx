import type { UseCustomQuizV2Return } from '@application/useCases/useCustomQuizV2';
import type { JSX } from 'react';
import { CourseCard } from '@interface/components/customQuiz/CourseCard';
import { QuizOptionsCard } from '@interface/components/customQuiz/QuizOptionsCard';
import { SetupHeader } from '@interface/components/customQuiz/SetupHeader';
import { TagsCard } from '@interface/components/customQuiz/TagsCard';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { useState } from 'react';
import styles from './CustomQuizSetup.module.scss';

type Step = 1 | 2;

export interface CustomQuizSetupProps {
  quiz: UseCustomQuizV2Return;
  onLeave: () => void;
}

/**
 * The setup surface itself. One tree serves both layouts: below 768px it is a
 * two-step flow and CSS hides the half the learner is not on, above it the
 * settings and tags sit side by side with a single action underneath.
 * Rendering both halves always keeps control ids unique.
 */
export function CustomQuizSetup({
  quiz,
  onLeave,
}: CustomQuizSetupProps): JSX.Element {
  const [step, setStep] = useState<Step>(1);

  return (
    <div className={styles.page} data-step={step}>
      <div className={styles.mobileOnly}>
        {step === 1 ? (
          <SetupHeader
            backLabel="Back to home"
            onBack={onLeave}
            eyebrow="Step 1 of 2"
            title="Set up your quiz"
            progress={{ total: 2, complete: 1 }}
          />
        ) : (
          <SetupHeader
            backLabel="Back to setup"
            onBack={() => setStep(1)}
            eyebrow="Step 2 of 2"
            title="Choose tags"
            titleSuffix="(optional)"
            caption="Choose tags if you want to review specific grammar"
            progress={{ total: 2, complete: 2 }}
          />
        )}
      </div>

      <div className={styles.desktopOnly}>
        <SetupHeader
          backLabel="Back to home"
          onBack={onLeave}
          eyebrow="Custom quiz"
          title="Set up your quiz"
        />
      </div>

      <div className={styles.columns}>
        <div className={styles.settings}>
          <CourseCard
            exampleFilter={quiz.exampleFilter}
            fromLessonText={quiz.fromLessonText}
          />
          <div className={styles.optionsSlot}>
            <QuizOptionsCard
              quizType={quiz.quizType}
              onQuizTypeChange={quiz.setQuizType}
              startWithSpanish={quiz.startWithSpanish}
              onStartWithSpanishChange={quiz.setStartWithSpanish}
              excludeSpanglish={quiz.exampleFilter.excludeSpanglish}
              onExcludeSpanglishChange={
                quiz.exampleFilter.updateExcludeSpanglish
              }
              audioQuizType={quiz.audioQuizType}
              onAudioQuizTypeChange={quiz.setAudioQuizType}
              autoplay={quiz.autoplay}
              onAutoplayChange={quiz.setAutoplay}
              quizLength={quiz.quizLength}
              quizLengthOptions={quiz.quizLengthOptions}
              onQuizLengthChange={quiz.setQuizLength}
              countLabel={quiz.countLabel}
            />
          </div>
        </div>

        <div className={styles.tagsSlot}>
          <TagsCard exampleFilter={quiz.exampleFilter} showHeader />
        </div>
      </div>

      <div className={styles.action}>
        <p className={styles.actionCount}>{quiz.countLabel}</p>

        <div className={styles.footer}>
          <div className={styles.mobileOnly}>
            {step === 1 ? (
              <div className={styles.cta}>
                <Button trailingIcon="arrowRight" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.cta}>
                  <Button disabled={quiz.quizNotReady} onClick={quiz.readyQuiz}>
                    {quiz.ctaLabel}
                  </Button>
                </div>
                <div className={styles.ctaSecondary}>
                  <Button
                    variant="ghost"
                    leadingIcon="arrowLeft"
                    onClick={() => setStep(1)}
                  >
                    Back to setup
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className={styles.desktopOnly}>
            <div className={styles.cta}>
              <Button disabled={quiz.quizNotReady} onClick={quiz.readyQuiz}>
                {quiz.ctaLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
