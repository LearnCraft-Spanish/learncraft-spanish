import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';

import { useAudioExamples } from 'src/hooks/ExampleData/useAudioExamples';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { useUserData } from 'src/hooks/UserData/useUserData';
import Loading from 'src/components/Loading';
import AudioQuiz from 'src/components/Quizzing/AudioQuiz/AudioQuiz';
import AudioQuizSetupMenu from 'src/components/Quizzing/AudioQuiz/AudioQuizSetupMenu';
import type { Flashcard } from 'src/types/interfaceDefinitions';
import { fisherYatesShuffle } from '../functions/fisherYatesShuffle';
import 'src/App.css';
import 'src/components/Quizzing/AudioQuiz/AudioBasedReview.css';

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
    (userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin' ||
      activeStudentQuery.data?.roles.studentRole === 'student' ||
      activeStudentQuery.data?.roles.studentRole === 'limited');
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
