import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Flashcard } from '../types/interfaceDefinitions';
import { fisherYatesShuffle } from '../functions/fisherYatesShuffle';
import { useActiveStudent } from '../hooks/UserData/useActiveStudent';

import { useAudioExamples } from '../hooks/ExampleData/useAudioExamples';
import { useProgramTable } from '../hooks/CourseData/useProgramTable';
import { useSelectedLesson } from '../hooks/useSelectedLesson';
import { useUserData } from '../hooks/UserData/useUserData';
import Loading from '../components/Loading';
import AudioQuiz from '../components/Quizzing/AudioQuiz/AudioQuiz';
import AudioQuizSetupMenu from '../components/Quizzing/AudioQuiz/AudioQuizSetupMenu';
import '../App.css';
import '../components/Quizzing/AudioQuiz/AudioBasedReview.css';

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
          quizTitle={
            audioOrComprehension === 'audio'
              ? 'Audio Quiz'
              : 'Comprehension Quiz'
          }
          examplesToParse={audioQuizExamples}
          audioOrComprehension={audioOrComprehension}
          autoplay={autoplay}
          cleanupFunction={unReadyQuiz}
          incrementOnAdd={false}
        />
      )}
    </div>
  );
}
