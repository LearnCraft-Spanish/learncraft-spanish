import React, { useState, useEffect, useRef } from 'react';

import './App.css';
import ReactHowler from 'react-howler';
import { useAuth0 } from '@auth0/auth0-react';

import MenuButton from './MenuButton';
import AudioBasedReview from './AudioBasedReview';
import LessonSelector from './LessonSelector';

export default function ComprehensionQuiz({
  programTable,
  activeStudent,
  studentExamplesTable,
  updateBannerMessage,
  audioExamplesTable,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}) {
  const { getAccessTokenSilently } = useAuth0();
  const [currentExample, setCurrentExample] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [examplesToPlay, setExamplesToPlay] = useState([]);
  const [quizReady, setQuizReady] = useState(false);
  let rendered = false;
  const example = examplesToPlay[currentExample] || {};

  useEffect(() => {
    if (!rendered) {
      rendered = true;
    }
  }, []);

  return (
    <div className="quiz">
      <h2 className="comprehensionHeader">Comprehension Quiz</h2>
      <AudioBasedReview
        activeStudent={activeStudent}
        programTable={programTable}
        studentExamplesTable={studentExamplesTable}
        updateBannerMessage={updateBannerMessage}
        audioExamplesTable={audioExamplesTable}
        filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
        willAutoplay={false}
        willStartWithSpanish={true}
        selectedLesson={selectedLesson}
        selectedProgram={selectedProgram}
        updateSelectedLesson={updateSelectedLesson}
        updateSelectedProgram={updateSelectedProgram}
      />
    </div>
  );
}
