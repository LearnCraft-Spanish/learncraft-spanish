import type { JSX } from 'react';
import { useQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { EmptyState } from '@interface/components/general/EmptyState/EmptyState';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Loading } from '@interface/components/Loading';
import { MyFlashcardsQuizSetup } from '@interface/components/myFlashcards/MyFlashcardsQuizSetup';
import { ReviewMyFlashcardsAudioQuiz } from '@interface/components/Quizzing/AudioQuiz/ReviewMyFlashcardsAudioQuiz';
import {
  ReviewMyFlashcardsTextQuiz,
  SrsTextQuiz,
} from '@interface/components/Quizzing/TextQuiz';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * The v2 "Quiz my flashcards" setup screen. Structured like `CustomQuizV2`
 * (one use case, error / loading / setup / active-quiz branches), but the
 * setup surface is `MyFlashcardsQuizSetup` rather than `CustomQuizSetup` —
 * there is no course to choose here, so "advanced filtering" is the whole
 * scope-narrowing affordance rather than a secondary tags step.
 */
export function ReviewMyFlashcardsV2(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  // Check for URL parameter to enable filtering by default
  const searchParams = new URLSearchParams(location.search);
  const enableFiltering = searchParams.get('enableFiltering') === 'true';

  const quiz = useQuizMyFlashcards({
    initialFilterOwnedFlashcards: enableFiltering,
  });

  // Clean up URL parameter after initialization
  useEffect(() => {
    if (enableFiltering) {
      // Remove the parameter from the URL without causing a page refresh
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('enableFiltering');
      const newSearch = newSearchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      navigate(newUrl, { replace: true });
    }
  }, [enableFiltering, location.pathname, location.search, navigate]);

  if (quiz.error) {
    return (
      <PageShell>
        <p role="alert">{`Error: ${quiz.error.message}`}</p>
      </PageShell>
    );
  }

  if (quiz.isLoading) {
    return (
      <PageShell>
        <Loading message="Loading Flashcard Data..." />
      </PageShell>
    );
  }

  if (quiz.noFlashcards) {
    return (
      <PageShell>
        <EmptyState
          icon="cards"
          title="No flashcards found"
          guidance={
            'You have not collected any flashcards yet. Add flashcards from ' +
            'the back of a card during a quiz, or use the Flashcard Finder ' +
            'to search for cards to collect.'
          }
          action={
            <Button onClick={() => navigate('/flashcardfinder')}>
              Find flashcards
            </Button>
          }
        />
      </PageShell>
    );
  }

  if (quiz.quizReady) {
    if (quiz.isAudioQuiz) {
      return (
        <ReviewMyFlashcardsAudioQuiz audioQuizProps={quiz.audioQuizProps} />
      );
    }
    return quiz.textQuizSetup.srsQuiz ? (
      <SrsTextQuiz textQuizProps={quiz.textQuizProps} />
    ) : (
      <ReviewMyFlashcardsTextQuiz textQuizProps={quiz.textQuizProps} />
    );
  }

  return (
    <PageShell>
      <MyFlashcardsQuizSetup quiz={quiz} onLeave={() => navigate('/')} />
    </PageShell>
  );
}

export default ReviewMyFlashcardsV2;
