import { useSubHeader } from '@application/units/SubHeader';
import { StudentSearchComponent } from '@interface/components/StudentSearch';
export default function SubHeader() {
  const {
    isAuthenticated,
    appUser,
    isOwnUser,
    activeStudentLoading,
    studentSelectorOpen,
    setStudentSelectorOpen,
    clearSelection,

    notLoggedIn,
    loggingIn,
    freeUser,
    studentUser,
    isCoachOrAdmin,
  } = useSubHeader();

  return (
    <div className="div-user-subheader">
      {/* Not Logged In */}
      {notLoggedIn && <p>You must be logged in to use this app.</p>}
      {/* Logging In */}
      {loggingIn && <p>Logging In...</p>}
      {/* Loading User Data */}
      {isAuthenticated && activeStudentLoading && <p>Loading user data...</p>}
      {/* Free User */}
      {freeUser && <p>Welcome back!</p>}
      {/* Student User */}
      {studentUser && appUser && <p>Welcome back, {appUser.name}!</p>}
      {/* Coach or Admin */}
      {isCoachOrAdmin && !activeStudentLoading && (
        <>
          {/* Student selector closed */}
          {!studentSelectorOpen ? (
            <div className="studentList">
              {appUser && (
                <p>
                  {`Using as ${appUser.name}
                  ${isOwnUser ? ' (yourself)' : ''}`}
                </p>
              )}
              {!appUser && <p>No student Selected</p>}
              <button
                type="button"
                onClick={() => setStudentSelectorOpen(true)}
              >
                Change
              </button>
            </div>
          ) : (
            /* Student selector open */
            <div className="studentList">
              <StudentSearchComponent
                closeMenu={() => setStudentSelectorOpen(false)}
              />
              <button
                type="button"
                onClick={() => setStudentSelectorOpen(false)}
              >
                Cancel
              </button>
              <button type="button" onClick={() => clearSelection()}>
                Clear Selection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
