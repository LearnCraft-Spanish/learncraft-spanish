import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { c } from "vite/dist/node/types.d-aGj9QkWt";
import useAuth from "./hooks/useAuth";
import quizCourses from "./functions/QuizCourseList";
import MenuButton from "./components/Buttons/MenuButton";
import Loading from "./components/Loading";
import { useOfficialQuizzes } from "./hooks/useOfficialQuizzes";
import { useSelectedLesson } from "./hooks/useSelectedLesson";
import OfficialQuiz from "./OfficialQuiz";
import "./App.css";

export default function LCSPQuizApp(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedProgram, selectedToLesson } = useSelectedLesson();
  const { officialQuizzesQuery } = useOfficialQuizzes(undefined);
  const { isAuthenticated, isLoading } = useAuth();
  const [chosenQuiz, setChosenQuiz] = useState(2);
  const [hideMenu, setHideMenu] = useState(false);
  const defaultUnselected = useRef(true);

  const selectedCourseCode = quizCourses.find(
    (course) => course.name === selectedProgram?.name
  )?.code;

  const currentCourseCode = useMemo(() => {
    const splitPath = location.pathname.split("/");
    const courseCodes = quizCourses.map((course) => course.code);
    const foundCourse = courseCodes.find(
      (code: string) => code === splitPath[2]
    );
    console.log("Current Course:", foundCourse || "lcsp");
    return foundCourse || "lcsp";
  }, [location.pathname]);

  const quizPath = useMemo(() => {
    const splitPath = location.pathname.split("/");
    if (currentCourseCode === "lcsp") {
      return !!Number(splitPath[2]);
    } else {
      return !!Number(splitPath[3]);
    }
  }, [location.pathname, currentCourseCode]);

  const getCourseUrlFromCode = useCallback((code: string) => {
    const foundCourse = quizCourses.find((course) => course.code === code);
    const url = `/officialquizzes/${foundCourse?.url ? `${foundCourse.url}/` : ""}`;
    return url;
  }, []);

  const makeMenuHidden = useCallback(() => {
    if (!hideMenu) {
      setHideMenu(true);
    }
  }, [hideMenu]);

  const makeMenuShow = useCallback(() => {
    if (hideMenu) {
      setHideMenu(false);
    }
  }, [hideMenu]);

  const updateQuizCourse = useCallback(
    (courseCode: string) => {
      console.log("New Course:", courseCode);
      const newCourse = quizCourses.find(
        (course) => course.code === courseCode
      );
      const urlToNavigate = newCourse?.url || "";
      navigate(urlToNavigate);
    },
    [navigate]
  );

  const updateChosenQuiz = useCallback((quizNumber: number) => {
    setChosenQuiz(quizNumber);
  }, []);

  const makeCourseList = () => {
    const courseList: React.JSX.Element[] = [];
    let i = 1;
    quizCourses.forEach((course) => {
      const courseOption = (
        <option key={i} value={course.code}>
          {course.name}
        </option>
      );
      courseList.push(courseOption);
      i++;
    });
    if (!courseList) {
      return null;
    }
    return courseList;
  };

  const makeQuizSelections = useCallback(() => {
    if (officialQuizzesQuery.data) {
      const quizList = officialQuizzesQuery.data.filter(
        (item) => item.quizType === currentCourseCode
      );
      const quizSelections: React.JSX.Element[] = [];
      const courseObj = quizCourses.find(
        (course) => course.code === currentCourseCode
      );
      const courseName = courseObj?.name || "";
      let i = 1;
      if (currentCourseCode === "ser-estar") {
        quizList.forEach((item) => {
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {"Ser/Estar Lesson "}
              {item.lessonNumber}
              {", "}
              {item.subtitle}
            </option>
          );
          i++;
        });
      } else {
        quizList.forEach((item) => {
          // console.log(item)
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {courseName}
              {" Quiz "}
              {item.quizNumber}
            </option>
          );
          i++;
        });
      }
      if (!quizSelections) {
        return null;
      }
      return quizSelections;
    }
  }, [currentCourseCode, officialQuizzesQuery.data]);

  const startQuiz = useCallback(() => {
    if (chosenQuiz) {
      const courseUrl = getCourseUrlFromCode(currentCourseCode);
      const navigateTarget = `${courseUrl}${chosenQuiz.toString()}`;
      navigate(navigateTarget);
    }
  }, [currentCourseCode, chosenQuiz, getCourseUrlFromCode, navigate]);

  function createRoutesFromCourses() {
    const routes: React.JSX.Element[] = [];
    quizCourses.forEach((course) => {
      routes.push(
        <Route
          key={course.code}
          path={`${course.url}/*`}
          element={
            <Routes>
              <Route
                path=":number"
                element={
                  <OfficialQuiz
                    chosenQuiz={chosenQuiz}
                    quizCourse={currentCourseCode}
                    makeMenuHidden={makeMenuHidden}
                    makeMenuShow={makeMenuShow}
                    updateChosenQuiz={updateChosenQuiz}
                  />
                }
              ></Route>
            </Routes>
          }
        />
      );
    });
    if (!routes) {
      return null;
    }
    return routes;
  }

  // Ensures the default course is selected, but only when the quiz opens
  // Finds the student's course and navigates to it
  useEffect(() => {
    if (defaultUnselected.current) {
      if (selectedProgram?.name) {
        const activeCourse = quizCourses.find(
          (course) => course.name === selectedProgram.name
        );
        if (
          location.pathname === "/officialquizzes" &&
          activeCourse &&
          defaultUnselected.current
        ) {
          defaultUnselected.current = false;
          const urlToNavigate = activeCourse.url;
          defaultUnselected.current = false;
          navigate(urlToNavigate);
        }
      }
    }
  }, [selectedProgram?.name, location.pathname, navigate]);

  // Ensures the quiz menu shows when quiz is not active.
  useEffect(() => {
    if (!quizPath && hideMenu) {
      makeMenuShow();
    }
  }, [quizPath, hideMenu, makeMenuShow]);

  // Update chosen quiz when selected course changes
  useEffect(() => {
    if (officialQuizzesQuery.data) {
      if (currentCourseCode === selectedCourseCode && selectedToLesson) {
        const selectedLessonArray = selectedToLesson?.lesson.split(" ");
        if (selectedLessonArray) {
          const selectedLessonString = selectedLessonArray.slice(-1)[0];
          const selectedLessonNumber = Number.parseInt(selectedLessonString);
          let lastQuizBeforeCurrentLesson = 0;
          const activeQuizzes = officialQuizzesQuery.data.filter(
            (item) => item.quizType === currentCourseCode
          );
          activeQuizzes.forEach((item) => {
            if (item.quizNumber <= selectedLessonNumber) {
              lastQuizBeforeCurrentLesson = item.quizNumber;
            }
          });
          if (lastQuizBeforeCurrentLesson > 0) {
            setChosenQuiz(lastQuizBeforeCurrentLesson);
          }
        }
      } else {
        const firstQuiz = officialQuizzesQuery.data.filter(
          (item) => item.quizType === currentCourseCode
        )[0].quizNumber;
        setChosenQuiz(firstQuiz);
      }
    }
  }, [
    selectedCourseCode,
    selectedToLesson,
    currentCourseCode,
    officialQuizzesQuery.data,
  ]);

  return (
    <>
      {isAuthenticated && !isLoading && (
        <div className="quizInterface">
          {/* Quiz Selector */}
          {officialQuizzesQuery.isLoading && (
            <Loading message="Loading Quizzes..." />
          )}
          {officialQuizzesQuery.isError && <h2>Error Loading Quizzes</h2>}
          {officialQuizzesQuery.isSuccess && chosenQuiz && !hideMenu && (
            <div className="quizSelector">
              <h3> Official Quizzes</h3>
              <select
                className="quizMenu"
                role="select"
                aria-label="Select Course"
                value={currentCourseCode}
                onChange={(e) => updateQuizCourse(e.target.value)}
              >
                {makeCourseList()}
              </select>
              <select
                className="quizMenu"
                role="select"
                aria-label="Select Quiz"
                value={chosenQuiz}
                onChange={(e) =>
                  updateChosenQuiz(Number.parseInt(e.target.value) || 0)
                }
              >
                {makeQuizSelections()}
              </select>
              <div className="buttonBox">
                <button type="button" onClick={startQuiz}>
                  Begin Review
                </button>
              </div>
              <div className="buttonBox">
                <MenuButton />
              </div>
            </div>
          )}
          <Routes>
            {createRoutesFromCourses()}
            <Route
              path=":number"
              element={
                <OfficialQuiz
                  chosenQuiz={chosenQuiz}
                  quizCourse={currentCourseCode}
                  makeMenuHidden={makeMenuHidden}
                  makeMenuShow={makeMenuShow}
                  updateChosenQuiz={updateChosenQuiz}
                />
              }
            ></Route>
          </Routes>
        </div>
      )}
    </>
  );
}
