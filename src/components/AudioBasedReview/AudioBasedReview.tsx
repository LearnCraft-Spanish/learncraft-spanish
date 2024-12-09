import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Flashcard } from '../../interfaceDefinitions';
import { fisherYatesShuffle } from '../../functions/fisherYatesShuffle';
import { useActiveStudent } from '../../hooks/useActiveStudent';

import { useAudioExamples } from '../../hooks/useAudioExamples';
import { useProgramTable } from '../../hooks/useProgramTable';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { useUserData } from '../../hooks/useUserData';
import Loading from '../Loading';
import AudioQuiz from '../Quiz/AudioQuiz';
import AudioQuizSetupMenu from './AudioQuizSetupMenu';
import '../../App.css';
import './AudioBasedReview.css';

interface AudioBasedReviewProps {
  audioOrComprehension?: 'audio' | 'comprehension';
  willAutoplay: boolean;
}

export default function AudioBasedReview({
  audioOrComprehension = 'comprehension',
  willAutoplay,
}: AudioBasedReviewProps) {
  const userDataQuery = useUserData();
  const { activeStudentQuery } = useActiveStudent();
  const { filterExamplesBySelectedLesson } = useSelectedLesson();
  const { audioExamplesQuery } = useAudioExamples();
  const { programTableQuery } = useProgramTable();

  // Define data readiness for UI updates
  const dataReady =
    userDataQuery.isSuccess &&
    activeStudentQuery.isSuccess &&
    programTableQuery.isSuccess &&
    audioExamplesQuery.isSuccess &&
    (userDataQuery.data?.isAdmin ||
      activeStudentQuery.data?.role === 'student' ||
      activeStudentQuery.data?.role === 'limited');
  const isError =
    !dataReady &&
    (userDataQuery.isError ||
      programTableQuery.isError ||
      audioExamplesQuery.isError ||
      activeStudentQuery.isError);
  const isLoading =
    !dataReady &&
    (activeStudentQuery.isLoading ||
      userDataQuery.isLoading ||
      programTableQuery.isLoading ||
      audioExamplesQuery.isLoading);
  const unavailable = !dataReady && !isLoading && !isError;

  const [autoplay, setAutoplay] = useState(willAutoplay || false);
  const [quizReady, setQuizReady] = useState(false); // What single responsibility is this handling?

  function updateAutoplay(newAutoplay: boolean) {
    setAutoplay(newAutoplay);
  }

  function readyQuiz() {
    setQuizReady(true);
  }

  function unReadyQuiz() {
    setQuizReady(false);
  }

  // Memo to parse quiz examples
  const audioQuizExamples = useMemo((): Flashcard[] => {
    if (audioExamplesQuery.isSuccess) {
      const allowedAudioExamples = filterExamplesBySelectedLesson(
        audioExamplesQuery.data,
      );
      const shuffledExamples = fisherYatesShuffle(allowedAudioExamples);
      // This should be display orders rather than examples.
      // Can be fixed later, probably not the source of existing bugs.
      return shuffledExamples;
    }
    return [];
  }, [
    audioExamplesQuery.isSuccess,
    audioExamplesQuery.data,
    filterExamplesBySelectedLesson,
  ]);

  return (
    <div className="quiz">
      {isLoading && <Loading message="Loading Audio..." />}
      {isError && <h2>Error Loading Audio</h2>}
      {unavailable && <Navigate to="/" />}
      {!quizReady && dataReady && (
        <>
          <h2>
            {audioOrComprehension === 'audio'
              ? 'Audio Quiz'
              : 'Comprehension Quiz'}
          </h2>
          <AudioQuizSetupMenu
            autoplay={autoplay}
            updateAutoplay={updateAutoplay}
            examplesToPlayLength={audioQuizExamples?.length}
            readyQuiz={readyQuiz}
          />
        </>
      )}

      {quizReady && dataReady && audioQuizExamples.length > 0 && (
        <AudioQuiz
          examplesToParse={audioQuizExamples}
          audioOrComprehension={audioOrComprehension}
          autoplay={autoplay}
          cleanupFunction={unReadyQuiz}
        />
      )}
    </div>
  );
}
