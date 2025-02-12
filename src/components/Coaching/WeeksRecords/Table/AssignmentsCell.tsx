import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import useAssignments from 'src/hooks/CoachingData/useAssignments';
import type { Assignment, Week } from 'src/types/CoachingTypes';
import ContextualControlls from 'src/components/ContextualControlls';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useState } from 'react';

import { useModal } from 'src/hooks/useModal';
import {
  CoachDropdown,
  DeleteRecord,
  DropdownWithEditToggle,
  FormControls,
  LinkInput,
  TextAreaInput,
} from '../../general';

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
    closeContextual,
    updateDisableClickOutside,
  } = useContextualMenu();
  const { closeModal } = useModal();
  const { updateAssignmentMutation, deleteAssignmentMutation } =
    useAssignments();

  const [editMode, setEditMode] = useState(false);

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    assignment.homeworkCorrector.email,
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
    setHomeworkCorrector(corrector.user.email);
  }

  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }
  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function cancelEdit() {
    disableEditMode();

    // reset states to assignment values
    setHomeworkCorrector(assignment.homeworkCorrector.email);
    setAssignmentType(assignment.assignmentType);
    setRating(assignment.rating);
    setNotes(assignment.notes);
    setAreasOfDifficulty(assignment.areasOfDifficulty);
    setAssignmentLink(assignment.assignmentLink);
  }
  function deleteRecordFunction() {
    deleteAssignmentMutation.mutate(assignment.recordId, {
      onSuccess: () => {
        closeModal();
        cancelEdit();
        closeContextual();
      },
    });
  }

  function submitEdit() {
    updateAssignmentMutation.mutate({
      relatedWeek: assignment.relatedWeek,
      recordId: assignment.recordId,
      homeworkCorrector,
      assignmentType,
      rating,
      notes,
      areasOfDifficulty,
      assignmentLink,
    });
    updateDisableClickOutside(false);
    setEditMode(false);
  }

  function captureSubmitForm() {
    // check if any fields have changed from the original assignment
    // if not, do nothing
    if (
      homeworkCorrector === assignment.homeworkCorrector.email &&
      assignmentType === assignment.assignmentType &&
      rating === assignment.rating &&
      notes === assignment.notes &&
      areasOfDifficulty === assignment.areasOfDifficulty &&
      assignmentLink === assignment.assignmentLink
    ) {
      disableEditMode();
      return;
    }
    submitEdit();
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
            {editMode ? (
              <h4>Edit Assignment</h4>
            ) : (
              <h4>
                {assignmentType} by{' '}
                {
                  getStudentFromMembershipId(
                    getMembershipFromWeekRecordId(assignment.relatedWeek)
                      ?.recordId,
                  )?.fullName
                }
              </h4>
            )}
            <DropdownWithEditToggle
              label="Assignment Type"
              editMode={editMode}
              value={assignmentType}
              onChange={setAssignmentType}
              options={[
                'Pronunciation',
                'Writing',
                'placement test',
                'journal',
                'verbal tenses review',
                'audio quiz',
                'Student Testimonial',
                '_other',
              ]}
            />
            <CoachDropdown
              label="Corrected by"
              editMode={editMode}
              coachEmail={homeworkCorrector}
              onChange={updateHomeworkCorrector}
            />
            <DropdownWithEditToggle
              label="Rating"
              editMode={editMode}
              value={rating}
              onChange={setRating}
              options={[
                'Excellent',
                'Very Good',
                'Good',
                'Fair',
                'Bad',
                'Poor',
                'Assigned to M3',
                'No sound',
                'Assigned to Level 2 (L6-9)',
                'Assigned to Level 3 (L10-12)',
                'Assigned to Level 1 (lessons 1-6)',
                'Advanced group',
                'Assigned to Level 1 (L1-L5)',
                'Assigned to 1MC',
                'Assigned to Level 4',
                'New LCS course',
                'Advanced',
              ]}
            />
            <TextAreaInput
              label="Notes"
              editMode={editMode}
              value={notes}
              onChange={setNotes}
            />
            <TextAreaInput
              label="Areas of Difficulty"
              editMode={editMode}
              value={areasOfDifficulty}
              onChange={setAreasOfDifficulty}
            />
            <LinkInput
              label="Assignment Link"
              value={assignmentLink}
              onChange={setAssignmentLink}
              editMode={editMode}
            />
            {editMode && <DeleteRecord deleteFunction={deleteRecordFunction} />}
            <FormControls
              editMode={editMode}
              cancelEdit={cancelEdit}
              captureSubmitForm={captureSubmitForm}
            />
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

  const { coachListQuery, getStudentFromMembershipId } = useCoaching();
  const { openModal } = useModal();
  const [homeworkCorrector, setHomeworkCorrector] = useState(
    userDataQuery.data?.emailAddress || '',
  );
  const [assignmentType, setAssignmentType] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [assignmentLink, setAssignmentLink] = useState('');

  const updateHomeworkCorrector = (email: string) => {
    setHomeworkCorrector(email);
  };

  function createNewAssignment() {
    createAssignmentMutation.mutate({
      relatedWeek: week.recordId,
      homeworkCorrector,
      assignmentType,
      rating,
      notes,
      areasOfDifficulty,
      assignmentLink,
    });
  }
  function captureSubmitForm() {
    if (assignmentType === '') {
      openModal({
        title: 'Error',
        body: 'Assignment Type is required',
        type: 'error',
      });
      return;
    }
    if (homeworkCorrector === '') {
      openModal({
        title: 'Error',
        body: 'Homework Corrector is required',
        type: 'error',
      });
      return;
    }
    if (rating === '') {
      openModal({
        title: 'Error',
        body: 'Rating is required',
        type: 'error',
      });
      return;
    }
    createNewAssignment();
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
            <h4>Create Assignment Record</h4>
            <div className="lineWrapper">
              <div className="label">Student:</div>
              <div className="content">
                {week.relatedMembership
                  ? getStudentFromMembershipId(week.relatedMembership)?.fullName
                  : 'No student found'}
              </div>
            </div>

            <div className="lineWrapper">
              <label className="label" htmlFor="assignmentType">
                Assignment Type:
              </label>
              <select
                id="assignmentType"
                name="assignmentType"
                className="content"
                defaultValue={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Pronunciation">Pronunciation</option>
                <option value="Writing">Writing</option>
                <option value="placement test">placement test</option>
                <option value="journal">journal</option>
                <option value="verbal tenses review">
                  verbal tenses review
                </option>
                <option value="audio quiz">audio quiz</option>
                <option value="Student Testimonial">Student Testimonial</option>
                <option value="_other">_other</option>
              </select>
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="homeworkCorrector">
                Corrected by:{' '}
              </label>
              <select
                id="homeworkCorrector"
                name="homeworkCorrector"
                className="content"
                defaultValue={homeworkCorrector}
                onChange={(e) => updateHomeworkCorrector(e.target.value)}
              >
                <option value="">Select</option>

                {coachListQuery.data?.map((coach) => (
                  <option key={coach.coach} value={coach.user.email}>
                    {coach.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="rating">
                Rating:
              </label>
              <select
                id="rating"
                name="rating"
                className="content"
                defaultValue={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Select</option>
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
                <option value="Assigned to Level 4">Assigned to Level 4</option>
                <option value="New LCS course">New LCS course</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="notes">
                Notes:
              </label>
              <textarea
                id="notes"
                name="notes"
                className="content"
                defaultValue={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="areasOfDifficulty">
                Areas of Difficulty:
              </label>
              <textarea
                id="areasOfDifficulty"
                name="areasOfDifficulty"
                className="content"
                defaultValue={areasOfDifficulty}
                onChange={(e) => setAreasOfDifficulty(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="assignmentLink">
                Assignment Link:
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
                onClick={captureSubmitForm}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
