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
  Dropdown,
  DropdownWithEditToggle,
  FormControls,
  LinkInput,
  TextAreaInput,
} from '../../general';

import verifyRequiredInputs from '../../general/formValidationFunctions';

const assignmentTypes = [
  'Pronunciation',
  'Writing',
  'placement test',
  'journal',
  'verbal tenses review',
  'audio quiz',
  'Student Testimonial',
  '_other',
];
const ratings = [
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
];

function AssignmentCell({ assignment }: { assignment: Assignment }) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {assignment.assignmentType}:{assignment.rating}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <AssignmentView assignment={assignment} />
      )}
    </div>
  );
}

function AssignmentView({ assignment }: { assignment: Assignment }) {
  const {
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    coachListQuery,
  } = useCoaching();
  const { setContextualRef, closeContextual, updateDisableClickOutside } =
    useContextualMenu();
  const { closeModal, openModal } = useModal();
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
    //Check for all required fields
    const badInput = verifyRequiredInputs([
      { label: 'Assignment Type', value: assignmentType },
      { label: 'Homework Corrector', value: homeworkCorrector },
      { label: 'Rating', value: rating },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is required`,
        type: 'error',
      });
      return;
    }
    submitEdit();
  }
  return (
    <div className="contextualWrapper" key={`assignment${assignment.recordId}`}>
      <div className="contextual" ref={setContextualRef}>
        <ContextualControlls editFunction={enableEditMode} />
        {editMode ? (
          <h4>Edit Assignment</h4>
        ) : (
          <h4>
            {assignmentType} by{' '}
            {
              getStudentFromMembershipId(
                getMembershipFromWeekRecordId(assignment.relatedWeek)?.recordId,
              )?.fullName
            }
          </h4>
        )}

        <DropdownWithEditToggle
          label="Assignment Type"
          editMode={editMode}
          value={assignmentType}
          onChange={setAssignmentType}
          options={assignmentTypes}
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
          options={ratings}
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

  const { getStudentFromMembershipId } = useCoaching();
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
    const badInput = verifyRequiredInputs([
      { label: 'Assignment Type', value: assignmentType },
      { label: 'Homework Corrector', value: homeworkCorrector },
      { label: 'Rating', value: rating },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is required`,
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

            <Dropdown
              label="Assignment Type"
              value={assignmentType}
              onChange={setAssignmentType}
              options={assignmentTypes}
            />

            <CoachDropdown
              label="Corrected by"
              editMode
              coachEmail={homeworkCorrector}
              onChange={updateHomeworkCorrector}
            />

            <Dropdown
              label="Rating"
              value={rating}
              onChange={setRating}
              options={ratings}
            />

            <TextAreaInput
              label="Notes"
              editMode
              value={notes}
              onChange={setNotes}
            />

            <TextAreaInput
              label="Areas of Difficulty"
              editMode
              value={areasOfDifficulty}
              onChange={setAreasOfDifficulty}
            />

            <LinkInput
              label="Assignment Link"
              value={assignmentLink}
              onChange={setAssignmentLink}
              editMode
            />

            <FormControls
              editMode
              cancelEdit={closeContextual}
              captureSubmitForm={captureSubmitForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
