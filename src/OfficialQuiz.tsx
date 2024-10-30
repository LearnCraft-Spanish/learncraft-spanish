import React, { useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import Loading from './components/Loading';
import QuizComponent from './components/Quiz/QuizComponent';
import { useOfficialQuizzes } from './hooks/useOfficialQuizzes';
import './App.css';
import quizCourses from './functions/QuizCourseList';

interface officialQuizProps {
  chosenQuiz: number;
  quizCourse: string;
  hideMenu: () => void;
  showMenu: () => void;
  updateChosenQuiz: (quizNumber: number) => void;
}

export default function OfficialQuiz({
  chosenQuiz,
  quizCourse,
  hideMenu,
  showMenu,
  updateChosenQuiz,
}: officialQuizProps) {
  // Import Statements
  const navigate = useNavigate();
  const rendered = useRef(false);

  // Defining the current quiz from url
  const thisQuiz = Number.parseInt(useParams().number?.toString() || '0');
  const [thisQuizID, setThisQuizID] = useState<number | undefined>(undefined);
  const { officialQuizzesQuery, quizExamplesQuery } =
    useOfficialQuizzes(thisQuizID);

  function makeQuizTitle() {
    const thisCourse = quizCourses.find((course) => course.code === quizCourse);
    const courseName = thisCourse ? thisCourse.name : quizCourse;
    if (officialQuizzesQuery.data && quizCourse === 'ser-estar') {
      const quizNumberAsString = thisQuiz.toString();
      const lessonNumber = quizNumberAsString[0];
      const thisQuizObject = officialQuizzesQuery.data.find(
        (quiz) => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      );
      const subtitle = thisQuizObject
        ? thisQuizObject.subtitle
        : quizNumberAsString;
      return `Ser/Estar Lesson ${lessonNumber}, ${subtitle}`;
    } else {
      return `${courseName} Quiz ${thisQuiz}`;
    }
  }

  // Ensures the quiz does display if url is accessed directly:
  // Hides Menu and sets chosen quiz from url
  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true;
      hideMenu();
      if (chosenQuiz !== thisQuiz) {
        updateChosenQuiz(thisQuiz);
      }
    }
  }, [thisQuiz, chosenQuiz, updateChosenQuiz, hideMenu]);

  // Finds the current quiz object and sets the quiz example query state to the quiz id
  useEffect(() => {
    if (officialQuizzesQuery.data && thisQuiz) {
      const quizToSearch = officialQuizzesQuery.data.find(
        (quiz) => quiz.quizNumber === thisQuiz && quiz.quizType === quizCourse,
      );
      if (quizToSearch?.recordId) {
        setThisQuizID(quizToSearch.recordId);
      }
    }
  }, [officialQuizzesQuery.data, thisQuiz, quizCourse]);

  useEffect(() => {
    if (quizExamplesQuery.isSuccess && !quizExamplesQuery.data?.length) {
      navigate('..');
    }
  }, [quizExamplesQuery.isSuccess, quizExamplesQuery.data, navigate]);

  return (
    <>
      {officialQuizzesQuery.data && (
        <>
          {quizExamplesQuery.isLoading && <Loading message="Loading Quiz..." />}
          {quizExamplesQuery.isError && (
            <h2 className="error">Error Loading Quiz</h2>
          )}
          {quizExamplesQuery.data && (
            <QuizComponent
              examplesToParse={quizExamplesQuery.data}
              quizTitle={makeQuizTitle()}
              cleanupFunction={showMenu}
            />
          )}
        </>
      )}
    </>
  );
}
