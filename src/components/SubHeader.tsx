import { useEffect, useState } from 'react';

import useAuth from 'src/hooks/useAuth';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useUserData } from 'src/hooks/UserData/useUserData';

import StudentSearch from './StudentSearch';

export default function SubHeader() {
  const { activeStudentQuery, chooseStudent } = useActiveStudent();
  const userDataQuery = useUserData();

  const isLoading = activeStudentQuery.isLoading || userDataQuery.isLoading;
  const { isAuthenticated } = useAuth();

  const [studentSelectorOpen, setStudentSelectorOpen] = useState(false);

  function clearSelection() {
    // Clear active student selection
    chooseStudent(null);
    setStudentSelectorOpen(false);
  }

  // Close Student Selector on selection
  useEffect(() => {
    setStudentSelectorOpen(false);
  }, [activeStudentQuery?.data]);
  return (
    <div className="div-user-subheader">
      {!isLoading && !isAuthenticated && (
        <p>You must be logged in to use this app.</p>
      )}
      {isLoading && <p>Logging In...</p>}
      {!isLoading && isAuthenticated && userDataQuery.isLoading && (
        <p>Loading user data...</p>
      )}
      {!isLoading && isAuthenticated && userDataQuery.isError && (
        <p>Error loading user data.</p>
      )}
      {!isLoading &&
        isAuthenticated &&
        userDataQuery.isSuccess &&
        (userDataQuery.data?.roles.studentRole === 'student' ||
          userDataQuery.data?.roles.studentRole === 'limited') &&
        !(
          userDataQuery.data?.roles.adminRole === 'coach' ||
          userDataQuery.data?.roles.adminRole === 'admin'
        ) &&
        (userDataQuery.data.name ? (
          <p>{`Welcome back, ${userDataQuery.data.name}!`}</p>
        ) : (
          <p>Welcome back!</p>
        ))}

      {!isLoading &&
        isAuthenticated &&
        userDataQuery.isSuccess &&
        userDataQuery.data?.roles.studentRole !== 'student' &&
        userDataQuery.data?.roles.studentRole !== 'limited' &&
        !(
          userDataQuery.data?.roles.adminRole === 'coach' ||
          userDataQuery.data?.roles.adminRole === 'admin'
        ) && <p>Welcome back!</p>}

      {(userDataQuery.data?.roles.adminRole === 'coach' ||
        userDataQuery.data?.roles.adminRole === 'admin') &&
        !studentSelectorOpen && (
          <div className="studentList">
            {activeStudentQuery.data?.recordId && (
              <p>
                {`Using as ${activeStudentQuery.data?.name}
                  ${
                    activeStudentQuery.data?.recordId ===
                    userDataQuery.data?.recordId
                      ? ' (yourself)'
                      : ''
                  }`}
              </p>
            )}
            {!activeStudentQuery.data?.recordId && <p>No student Selected</p>}
            <button type="button" onClick={() => setStudentSelectorOpen(true)}>
              Change
            </button>
          </div>
        )}
      {(userDataQuery.data?.roles.adminRole === 'coach' ||
        userDataQuery.data?.roles.adminRole === 'admin') &&
        studentSelectorOpen && (
          <div className="studentList">
            <StudentSearch />
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
