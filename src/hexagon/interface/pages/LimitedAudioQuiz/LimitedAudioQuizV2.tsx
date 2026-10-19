import type { JSX } from 'react';
import { useLimitedAudioQuizV2 } from '@application/useCases/useLimitedAudioQuizV2';
import { AudioQuizOptionsCard } from '@interface/components/customQuiz/QuizOptionsCard';
import { SetupHeader } from '@interface/components/customQuiz/SetupHeader';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Card } from '@interface/components/general/Card/Card';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { LessonRangeScope } from '@interface/components/lessonRange/LessonRangeScope/LessonRangeScope';
import { Loading } from '@interface/components/Loading';
import { RegularAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/RegularAudioQuiz';
import { useNavigate } from 'react-router-dom';
import styles from './LimitedAudioQuizV2.module.scss';

/**
 * Audio quiz setup for limited users: one column with the lesson range, the
 * audio options, and the start action. The Custom Quiz look without its
 * quiz type choice or tags. On mobile the header back arrow replaces the
 * "Back to home" ghost.
 */
export function LimitedAudioQuizV2(): JSX.Element {
  const quiz = useLimitedAudioQuizV2();
  const navigate = useNavigate();

  if (quiz.error) {
    return (
      <PageShell>
        <p role="alert">{`Error: ${quiz.error.message}`}</p>
      </PageShell>
    );
  }

  if (quiz.isInitialLoading) {
    return (
      <PageShell>
        <Loading message="Loading audio quiz..." />
      </PageShell>
    );
  }

  if (quiz.quizReady) {
    return <RegularAudioQuiz audioQuizProps={quiz.audioQuizProps} />;
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <SetupHeader eyebrow="Audio quiz" title="Set up your quiz" />

        <div className={styles.cards}>
          <Card clip={false}>
            <div className={styles.rangeBody}>
              <LessonRangeScope
                idPrefix="limited-audio-quiz"
                course={quiz.lessonRange.course}
                coursesWithLessons={quiz.coursesWithLessons}
                fromLessonNumber={quiz.lessonRange.fromLessonNumber}
                toLessonNumber={quiz.lessonRange.toLessonNumber}
                onCourseChange={quiz.lessonRange.updateUserSelectedCourseId}
                onFromLessonChange={quiz.lessonRange.updateFromLessonNumber}
                onToLessonChange={quiz.lessonRange.updateToLessonNumber}
              />
            </div>
          </Card>

          <AudioQuizOptionsCard
            idPrefix="limited-audio-quiz"
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

        <div className={styles.actions}>
          <div className={styles.cta}>
            <Button disabled={quiz.quizNotReady} onClick={quiz.readyQuiz}>
              {quiz.ctaLabel}
            </Button>
          </div>
          <div className={styles.ctaSecondary}>
            <Button
              variant="ghost"
              muted
              leadingIcon="arrowLeft"
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
