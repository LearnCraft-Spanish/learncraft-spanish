import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import useAssignments from 'src/hooks/CoachingData/useAssignments';
import type { Assignment, Week } from 'src/types/CoachingTypes';
import ContextualControlls from 'src/components/ContextualControlls';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useState } from 'react';

function AssignmentCell({ assignment }: { assignment: Assignment }) {
  const {
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    coachListQuery,
  } = useCoaching();
  const {
    contextual,
    openContextual,
    setContextualRef,
    updateDisableClickOutside,
  } = useContextualMenu();
  const [editMode, setEditMode] = useState(false);

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    assignment.homeworkCorrector,
  );
  const [assignmentType, setAssignmentType] = useState(
    assignment.assignmentType,
  );
  const [rating, setRating] = useState(assignment.rating);
  const [notes, setNotes] = useState(assignment.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    assignment.areasOfDifficulty,
  );
  const [assignmentLink, setAssignmentLink] = useState(
    assignment.assignmentLink,
  );

  function updateHomeworkCorrector(email: string) {
    const corrector = coachListQuery.data?.find(
      (coach) => coach.user.email === email,
    );
    if (!corrector) {
      console.error('No coach found with email:', email);
      return;
    }
    setHomeworkCorrector(corrector.user);
  }

  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }
  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function submitEdit() {
    console.error('submitEdit not yet implemented');
  }
  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {assignmentType}:{rating}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <div
          className="contextualWrapper"
          key={`assignment${assignment.recordId}`}
        >
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls editFunction={enableEditMode} />
            <h4>
              {assignmentType} by{' '}
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekRecordId(assignment.relatedWeek)
                    ?.recordId,
                )?.fullName
              }
            </h4>
            <div className="lineWrapper">
              <label className="label" htmlFor="homeworkCorrector">
                Corrected by:{' '}
              </label>
              {editMode ? (
                <select
                  id="homeworkCorrector"
                  name="homeworkCorrector"
                  className="content"
                  defaultValue={homeworkCorrector.email}
                  onChange={(e) => updateHomeworkCorrector(e.target.value)}
                >
                  {coachListQuery.data?.map((coach) => (
                    <option key={coach.coach} value={coach.user.email}>
                      {coach.user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="content">{homeworkCorrector.name}</p>
              )}
            </div>

            <div className="lineWrapper">
              <label className="label" htmlFor="rating">
                Rating:{' '}
              </label>
              {editMode ? (
                <select
                  id="rating"
                  name="rating"
                  className="content"
                  defaultValue={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Bad">Bad</option>
                  <option value="Poor">Poor</option>
                  <option value="Assigned to M3">Assigned to M3</option>
                  <option value="No sound">No sound</option>
                  <option value="Assigned to Level 2 (L6-9)">
                    Assigned to Level 2 (L6-9)
                  </option>
                  <option value="Assigned to Level 3 (L10-12)">
                    Assigned to Level 3 (L10-12)
                  </option>
                  <option value="Assigned to Level 1 (lessons 1-6)">
                    Assigned to Level 1 (lessons 1-6)
                  </option>
                  <option value="Advanced group">Advanced group</option>
                  <option value="Assigned to Level 1 (L1-L5)">
                    Assigned to Level 1 (L1-L5)
                  </option>
                  <option value="Assigned to 1MC">Assigned to 1MC</option>
                  <option value="Assigned to Level 4">
                    Assigned to Level 4
                  </option>
                  <option value="New LCS course">New LCS course</option>
                  <option value="Advanced">Advanced</option>
                </select>
              ) : (
                <p className="content">{rating}</p>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="notes">
                Notes:{' '}
              </label>
              {editMode ? (
                <textarea
                  id="notes"
                  name="notes"
                  className="content"
                  defaultValue={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              ) : (
                <p className="content">{notes}</p>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="areasOfDifficulty">
                Areas of Difficulty:{' '}
              </label>
              {editMode ? (
                <textarea
                  id="areasOfDifficulty"
                  name="areasOfDifficulty"
                  className="content"
                  defaultValue={areasOfDifficulty}
                  onChange={(e) => setAreasOfDifficulty(e.target.value)}
                />
              ) : (
                <p className="content">{areasOfDifficulty}</p>
              )}
            </div>
            {editMode ? (
              <div className="lineWrapper">
                <label className="label" htmlFor="assignmentLink">
                  Assignment Link:{' '}
                </label>
                <input
                  id="assignmentLink"
                  name="assignmentLink"
                  type="text"
                  className="content"
                  defaultValue={assignmentLink}
                  onChange={(e) => setAssignmentLink(e.target.value)}
                />
              </div>
            ) : (
              assignmentLink.length > 0 && (
                <div className="lineWrapper">
                  <label className="label">Assignment Link: </label>
                  <a target="_blank" href={assignmentLink}>
                    Assignment Link
                  </a>
                </div>
              )
            )}
            {editMode && (
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={disableEditMode}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="greenButton"
                  onClick={submitEdit}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssignmentsCell({
  assignments,
  week,
}: {
  assignments: Assignment[] | null | undefined;
  week: Week;
}) {
  const { contextual, openContextual, setContextualRef, closeContextual } =
    useContextualMenu();
  const { createAssignmentMutation } = useAssignments();
  const userDataQuery = useUserData();

  function createNewAssignment() {
    /*
    createAssignmentMutation.mutate({
      relatedWeek: week.recordId,
      homeworkCorrector: userDataQuery.data?.emailAddress || 'no email',
      assignmentType: 'Pronunciation',
      rating: 'Excellent',
      notes: '',
      areasOfDifficulty: '',
      assignmentLink: '',
    });
    */
    console.error('createNewAssignment form not yet implemented');
  }

  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            key={`assignment${assignment.recordId}`}
          />
        ))}
      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual(`addAssignment${week.recordId}`)}
      >
        New
      </button>
      {contextual === `addAssignment${week.recordId}` && (
        <div
          className="contextualWrapper"
          key={`addAssignment${week.recordId}`}
        >
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls />
            <h4>Add Assignment for (student name)</h4>
            <div className="lineWrapper">
              <p className="label">Corrected By: </p>
              <p>will be active coach I assume</p>
              {/* <input type="text" / */}
            </div>
            <div className="lineWrapper">
              <p className="label">Assignment Type: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Rating: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Notes: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Areas of Difficulty: </p>
              <input type="text" />
            </div>
            <div className="lineWrapper">
              <p className="label">Assignment Link: </p>
              <input type="text" />
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Cancel
              </button>
              <button
                type="button"
                className="greenButton"
                onClick={createNewAssignment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
