import { Link, Route, Routes } from 'react-router-dom';
import {
  // CoursesTable,
  // LessonsTable,
  ProgramsTable,
  QuizGroupsTable,
  QuizzesTable,
  StudentsTable,
  VqdLessonsTable,
} from 'src/components/DatabaseTables';
import NotAvailablePage from 'src/NotAvailablePage';
import useDatabaseTables from './useDatabaseTables';
import './DatabaseTables.scss';

function DatabaseTablesMenu() {
  return (
    <>
      <h2>Database Tables</h2>
      <h3>Vocabulary/Quiz Database</h3>
      <div className="buttonBox">
        <Link className="linkButton" to="/database-tables/students">
          Students Table
        </Link>
      </div>
      <div className="buttonBox">
        <Link className="linkButton" to="/database-tables/programs">
          Programs Table
        </Link>
      </div>

      <div className="buttonBox">
        <Link className="linkButton" to="/database-tables/quizzes">
          Quizzes Table
        </Link>
      </div>
      <div className="buttonBox">
        <Link className="linkButton" to="/database-tables/quiz-groups">
          Quiz Groups Table
        </Link>
      </div>
      <div className="buttonBox">
        <Link className="linkButton" to="/database-tables/vqd-lessons">
          Lessons Table
        </Link>
      </div>
      <h3>Student Records Database</h3>
      <div className="buttonBox">
        <button className="linkButton disabledButton" disabled type="button">
          Lessons Table
        </button>
      </div>
      <div className="buttonBox">
        <button className="linkButton disabledButton" disabled type="button">
          Courses Table
        </button>
      </div>
    </>
  );
}

export default function DatabaseTables() {
  const { dataReady } = useDatabaseTables();

  return (
    dataReady && (
      <div className="vocab-qu  z-db-menu">
        <Routes>
          <Route index element={<DatabaseTablesMenu />} />
          <Route path="students" element={<StudentsTable />} />
          <Route path="programs" element={<ProgramsTable />} />
          <Route path="quiz-groups" element={<QuizGroupsTable />} />
          <Route path="vqd-lessons" element={<VqdLessonsTable />} />
          <Route path="quizzes" element={<QuizzesTable />} />
          <Route path="lessons" element={<NotAvailablePage />} />
          <Route path="courses" element={<NotAvailablePage />} />
        </Routes>
      </div>
    )
  );
}
