// src/components/VocabQuizDbTables/VocabQuizDbTables.tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/UserData/useUserData';
import './DatabaseTables.scss';

export default function DatabaseTables() {
  const { isAuthenticated, isLoading } = useAuth();
  const userDataQuery = useUserData();

  const location = useLocation();
  const isRoot = location.pathname === '/database-tables';

  const dataReady = userDataQuery.isSuccess && !isLoading && isAuthenticated;

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
            <h3>Student Records Database</h3>
            <div className="buttonBox">
              <Link className="linkButton" to="/database-tables/lessons">
                Lessons Table
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
