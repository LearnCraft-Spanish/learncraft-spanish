import { Link, Outlet } from 'react-router-dom';
import useDatabaseTables from './useDatabaseTables';
import './DatabaseTables.scss';

export default function DatabaseTables() {
  const { dataReady, isRoot } = useDatabaseTables();

  return (
    dataReady && (
      <div className="vocab-qu  z-db-menu">
        {isRoot ? (
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
            <h3>Student Records Database</h3>
            <div className="buttonBox">
              <Link className="linkButton" to="/database-tables/lessons">
                Lessons Table
              </Link>
            </div>
            <div className="buttonBox">
              <Link className="linkButton" to="/database-tables/courses">
                Courses Table
              </Link>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    )
  );
}
