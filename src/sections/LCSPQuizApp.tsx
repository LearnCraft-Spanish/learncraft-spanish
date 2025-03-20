import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import MenuButton from 'src/components/Buttons/MenuButton';
import { Loading } from 'src/components/Loading';
import OfficialQuiz from 'src/components/Quizzing/OfficialQuizzing/OfficialQuiz';
import quizCourses from 'src/functions/QuizCourseList';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import useAuth from 'src/hooks/useAuth';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import 'src/App.css';

export default function LCSPQuizApp(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeStudentQuery, activeProgram, activeLesson } =
    useActiveStudent();
  const { officialQuizzesQuery } = useOfficialQuizzes(undefined);
  const { isAuthenticated, isLoading } = useAuth();
  const [chosenQuiz, setChosenQuiz] = useState(0);
  const [menuHidden, setMenuHidden] = useState(false);
  const [defaultCourseFound, setDefaultCourseFound] = useState(false);

  const dataError = officialQuizzesQuery.isError || activeStudentQuery.isError;
  const dataLoading =
    !dataError &&
    (officialQuizzesQuery.isLoading || activeStudentQuery.isLoading);

  const activeCourseCode = quizCourses.find(
    (course) => course.name === activeProgram?.name,
  )?.code;

  const currentCourseCode = useMemo(() => {
    const splitPath = location.pathname.split('/');
    const courseCodes = quizCourses.map((course) => course.code);
    const foundCourse = courseCodes.find(
      (code: string) => code === splitPath[2],
    );
    return foundCourse || 'lcsp';
  }, [location.pathname]);

  const quizPath = useMemo(() => {
    const splitPath = location.pathname.split('/');
    if (currentCourseCode === 'lcsp') {
      return !!Number(splitPath[2]);
    } else {
      return !!Number(splitPath[3]);
    }
  }, [location.pathname, currentCourseCode]);

  const getCourseUrlFromCode = useCallback((code: string) => {
    const foundCourse = quizCourses.find((course) => course.code === code);
    const url = `/officialquizzes/${foundCourse?.url ? `${foundCourse.url}/` : ''}`;
    return url;
  }, []);

  const hideMenu = useCallback(() => {
    if (!menuHidden) {
      setMenuHidden(true);
    }
  }, [menuHidden]);

  const showMenu = useCallback(() => {
    if (menuHidden) {
      setMenuHidden(false);
    }
  }, [menuHidden]);

  const updateQuizCourse = useCallback(
    (courseCode: string) => {
      const newCourse = quizCourses.find(
        (course) => course.code === courseCode,
      );
      const urlToNavigate = newCourse?.url || '';
      navigate(urlToNavigate);
    },
    [navigate],
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
        (item) => item.quizType === currentCourseCode,
      );
      const quizSelections: React.JSX.Element[] = [];
      const courseObj = quizCourses.find(
        (course) => course.code === currentCourseCode,
      );
      const courseName = courseObj?.name || '';
      let i = 1;
      if (currentCourseCode === 'ser-estar') {
        quizList.forEach((item) => {
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {'Ser/Estar Lesson '}
              {item.lessonNumber}
              {', '}
              {item.subtitle}
            </option>,
          );
          i++;
        });
      } else {
        quizList.forEach((item) => {
          // console.log(item)
          quizSelections.push(
            <option key={i} value={item.quizNumber}>
              {courseName}
              {' Quiz '}
              {item.quizNumber}
            </option>,
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
                    hideMenu={hideMenu}
                    showMenu={showMenu}
                    updateChosenQuiz={updateChosenQuiz}
                  />
                }
              ></Route>
            </Routes>
          }
        />,
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
    if (!defaultCourseFound && activeProgram?.name) {
      // Don't run after first successful run
      // Only run if a course is selected
      const activeCourse = quizCourses.find(
        (course) => course.name === activeProgram.name,
      );
      if (!quizPath && !!activeCourse) {
        // Only run on root path and only if quiz course is found
        setDefaultCourseFound(true);
        const urlToNavigate = activeCourse.url;
        navigate(urlToNavigate);
      }
    }
  }, [activeProgram?.name, defaultCourseFound, quizPath, navigate]);

  useEffect(() => {}, [defaultCourseFound]);

  // Ensures the quiz menu shows when quiz is not active.
  useEffect(() => {
    if (!quizPath && menuHidden) {
      showMenu();
    }
  }, [quizPath, menuHidden, showMenu]);

  // Update chosen quiz when selected course changes
  useEffect(() => {
    //Don't run until data is ready
    if (!dataError && !dataLoading && officialQuizzesQuery.data?.length) {
      if (currentCourseCode === activeCourseCode && activeLesson) {
        // Find Default Quiz if selected course is the same as the current course
        const activeLessonArray = activeLesson?.lesson.split(' ');
        if (activeLessonArray.length) {
          const activeLessonString = activeLessonArray.slice(-1)[0];
          const activeLessonNumber = Number.parseInt(activeLessonString);
          let lastQuizBeforeCurrentLesson = 0;
          const activeQuizzes = officialQuizzesQuery.data.filter(
            (item) => item.quizType === currentCourseCode,
          );
          activeQuizzes.forEach((item) => {
            if (item.quizNumber <= activeLessonNumber) {
              lastQuizBeforeCurrentLesson = item.quizNumber;
            }
          });
          if (lastQuizBeforeCurrentLesson > 0) {
            updateChosenQuiz(lastQuizBeforeCurrentLesson);
          } else {
            // Otherwise set to first quiz of selected course
            const firstQuiz = officialQuizzesQuery.data.filter(
              (item) => item.quizType === currentCourseCode,
            )[0].quizNumber;
            updateChosenQuiz(firstQuiz);
          }
        }
      } else {
        // Otherwise set to first quiz of selected course
        const firstQuiz = officialQuizzesQuery.data.filter(
          (item) => item.quizType === currentCourseCode,
        )[0].quizNumber;
        updateChosenQuiz(firstQuiz);
      }
    }
  }, [
    dataError,
    dataLoading,
    activeCourseCode,
    activeLesson,
    currentCourseCode,
    officialQuizzesQuery.data,
    updateChosenQuiz,
  ]);

  return (
    <>
      {isAuthenticated && !isLoading && (
        <div className="quizInterface">
          {/* Quiz Selector */}
          {dataError && <h2>Error Loading Quizzes</h2>}
          {dataLoading && <Loading message="Loading Quizzes..." />}
          {!dataLoading && !dataError && !menuHidden && (
            <div className="quizSelector">
              <h3>Official Quizzes</h3>
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
                  hideMenu={hideMenu}
                  showMenu={showMenu}
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
