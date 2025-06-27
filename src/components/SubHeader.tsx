import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useState } from 'react';
import StudentSearch from './StudentSearch';

export default function SubHeader() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    isCoach,
  } = useAuthAdapter();

  const {
    appUser,
    isOwnUser,
    isLoading: activeStudentLoading,
    changeActiveStudent,
  } = useActiveStudent();

  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false);

  function clearSelection() {
    // Clear active student selection
    changeActiveStudent(null);
    setStudentSelectorOpen(false);
  }

  return (
    <div className="div-user-subheader">
      {!authLoading && !isAuthenticated && (
        <p>You must be logged in to use this app.</p>
      )}
      {authLoading && <p>Logging In...</p>}
      {isAuthenticated && activeStudentLoading && <p>Loading user data...</p>}
      {isAuthenticated &&
        !appUser &&
        !activeStudentLoading &&
        !(isAdmin || isCoach) && <p>Welcome back!</p>}

      {isAuthenticated &&
        appUser &&
        !activeStudentLoading &&
        !(isAdmin || isCoach) && <p>Welcome back, {appUser.name}!</p>}

      {(isCoach || isAdmin) &&
        !studentSelectorOpen &&
        !activeStudentLoading && (
          <div className="studentList">
            {appUser && (
              <p>
                {`Using as ${appUser.name}
                  ${isOwnUser ? ' (yourself)' : ''}`}
              </p>
            )}
            {!appUser && <p>No student Selected</p>}
            <button type="button" onClick={() => setStudentSelectorOpen(true)}>
              Change
            </button>
          </div>
        )}
      {(isCoach || isAdmin) && studentSelectorOpen && (
        <div className="studentList">
          <StudentSearch closeMenu={() => setStudentSelectorOpen(false)} />
          <button type="button" onClick={() => setStudentSelectorOpen(false)}>
            Cancel
          </button>
          <button type="button" onClick={() => clearSelection()}>
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
