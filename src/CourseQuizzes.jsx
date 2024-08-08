import React, { useState, useEffect, useRef } from 'react';
import {
  Link,
  redirect,
  Navigate,
  useNavigate,
  Routes,
  Route,
  useParams,
  useOutletContext,
  Outlet,
} from 'react-router-dom';

import { qb } from './DataModel';
import {
  updateStudentExample,
  createStudentExample,
} from './BackendFetchFunctions';

import './App.css';
import ReactHowler from 'react-howler';

import OfficialQuiz from './OfficialQuiz';

import { useAuth0 } from '@auth0/auth0-react';

import MenuButton from './MenuButton';

import { render } from '@testing-library/react';

export default function CourseQuizzes({
  thisCourse,
  courses,
  makeQuizList,
  quizReady,
  makeQuizReady,
  quizCourse,
  updateChosenQuiz,
  makeCourseList,
  createRoutesFromCourses,
  updateQuizCourseWithoutNavigate,
  updateQuizCourseWithNavigate,
  makeQuizSelections,
  activeStudent,
  dataLoaded,
  updateExamplesTable,
  chosenQuiz,
  hideMenu,
  makeMenuHidden,
  makeMenuShow,
  quizTable,
  examplesTable,
  studentExamples,
  addFlashcard,
  studentHasDefaultQuiz,
}) {
  const rendered = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true;
      console.log(`Course should be ${thisCourse}`);
      console.log(`Course now ${quizCourse}`);
      if (quizCourse !== thisCourse) {
        console.log('hmm, active course needs updating...');
        updateQuizCourseWithoutNavigate(thisCourse);
      }
    }
  }, []);

  useEffect(() => {
    if (dataLoaded && !studentHasDefaultQuiz) {
      console.log('setting first quiz active');
      const firstQuiz = makeQuizList(quizCourse)[0];
      updateChosenQuiz(firstQuiz);
    }
  }, [dataLoaded]);

  useEffect(() => {
    if (quizReady && chosenQuiz) {
      navigate(chosenQuiz.toString());
    }
  }, [quizReady]);

  return (
    <div className="quizInterface">
      {/* Quiz Selector */}

      {dataLoaded && chosenQuiz && quizCourse !== 'lcsp' && !hideMenu && (
        <div className="quizSelector">
          <select
            className="quizMenu"
            value={quizCourse}
            onChange={(e) => updateQuizCourseWithNavigate(e.target.value)}
          >
            {makeCourseList()}
          </select>
          <select
            className="quizMenu"
            value={chosenQuiz}
            onChange={(e) => updateChosenQuiz(e.target.value)}
          >
            {makeQuizSelections()}
          </select>
          <div className="buttonBox">
            <button onClick={makeQuizReady}>Begin Review</button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </div>
      )}
      {dataLoaded && quizCourse !== 'lcsp' && (
        <Routes>
          <Route
            path=":number"
            element={
              <OfficialQuiz
                courses={courses}
                quizCourse={quizCourse}
                makeCourseList={makeCourseList}
                makeQuizSelections={makeQuizSelections}
                activeStudent={activeStudent}
                dataLoaded={dataLoaded}
                updateExamplesTable={updateExamplesTable}
                chosenQuiz={chosenQuiz}
                updateChosenQuiz={updateChosenQuiz}
                hideMenu={hideMenu}
                makeMenuHidden={makeMenuHidden}
                makeQuizReady={makeQuizReady}
                makeMenuShow={makeMenuShow}
                quizTable={quizTable}
                examplesTable={examplesTable}
                studentExamples={studentExamples}
                addFlashcard={addFlashcard}
              />
            }
          ></Route>
        </Routes>
      )}
    </div>
  );
}
