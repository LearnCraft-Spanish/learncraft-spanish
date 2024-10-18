import type { MutableRefObject } from "react";
import React, { useEffect, useRef } from "react";

import { Route, Routes, useNavigate } from "react-router-dom";
import type { QuizCourse } from "./interfaceDefinitions";
import MenuButton from "./components/Buttons/MenuButton";
import { useOfficialQuizzes } from "./hooks/useOfficialQuizzes";
import OfficialQuiz from "./OfficialQuiz";
import "./App.css";

interface CourseQuizzesProps {
  chosenQuiz: number;
  courses: QuizCourse[];
  hideMenu: boolean;
  makeCourseList: () => JSX.Element[];
  makeMenuHidden: () => void;
  makeMenuShow: () => void;
  makeQuizReady: () => void;
  makeQuizSelections: () => JSX.Element[] | undefined;
  quizCourse: string;
  quizReady: boolean;
  studentHasDefaultQuiz: MutableRefObject<boolean>;
  thisCourse: string;
  updateChosenQuiz: (quizNumber: number) => void;
  updateQuizCourseWithNavigate: (course: string) => void;
  updateQuizCourseWithoutNavigate: (course: string) => void;
}

export default function CourseQuizzes({
  chosenQuiz,
  courses,
  hideMenu,
  makeCourseList,
  makeMenuHidden,
  makeMenuShow,
  makeQuizReady,
  makeQuizSelections,
  quizCourse,
  quizReady,
  studentHasDefaultQuiz,
  thisCourse,
  updateChosenQuiz,
  updateQuizCourseWithNavigate,
  updateQuizCourseWithoutNavigate,
}: CourseQuizzesProps) {
  const navigate = useNavigate();
  const rendered = useRef(false);
  const { officialQuizzesQuery } = useOfficialQuizzes(undefined);

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true;

      if (quizCourse !== thisCourse) {
        updateQuizCourseWithoutNavigate(thisCourse);
      }
    }
  }, [quizCourse, thisCourse, updateQuizCourseWithoutNavigate]);

  useEffect(() => {
    if (officialQuizzesQuery.data && !studentHasDefaultQuiz) {
      const firstQuiz = makeQuizSelections()?.[0];
      updateChosenQuiz(firstQuiz?.props.value);
    }
  }, [
    officialQuizzesQuery.data,
    studentHasDefaultQuiz,
    quizCourse,
    makeQuizSelections,
    updateChosenQuiz,
  ]);

  useEffect(() => {
    if (quizReady && chosenQuiz) {
      navigate(chosenQuiz.toString());
    }
  }, [quizReady, chosenQuiz, navigate]);

  return (
    <div className="quizInterface">
      {/* Quiz Selector */}
      {officialQuizzesQuery.data &&
        chosenQuiz &&
        quizCourse !== "lcsp" &&
        !hideMenu && (
          <>
            <h3>Official Quizzes</h3>
            <div className="quizSelector">
              <select
                className="quizMenu"
                role="select"
                aria-label="Select Course"
                value={quizCourse}
                onChange={(e) => updateQuizCourseWithNavigate(e.target.value)}
              >
                {makeCourseList()}
              </select>
              <select
                className="quizMenu"
                role="select"
                aria-label="Select Quiz"
                value={chosenQuiz}
                onChange={(e) =>
                  updateChosenQuiz(Number.parseInt(e.target.value))
                }
              >
                {makeQuizSelections()}
              </select>
              <div className="buttonBox">
                <button type="button" onClick={makeQuizReady}>
                  Begin Review
                </button>
              </div>
              <div className="buttonBox">
                <MenuButton />
              </div>
            </div>
          </>
        )}
      {officialQuizzesQuery.data && quizCourse !== "lcsp" && (
        <Routes>
          <Route
            path=":number"
            element={
              <OfficialQuiz
                chosenQuiz={chosenQuiz}
                courses={courses}
                makeMenuHidden={makeMenuHidden}
                makeMenuShow={makeMenuShow}
                quizCourse={quizCourse}
                updateChosenQuiz={updateChosenQuiz}
              />
            }
          ></Route>
        </Routes>
      )}
    </div>
  );
}
