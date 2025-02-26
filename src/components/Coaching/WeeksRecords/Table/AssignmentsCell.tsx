import type { Assignment, Week } from 'src/types/CoachingTypes';
import { useState } from 'react';
import ContextualControlls from 'src/components/ContextualControlls';
import useAssignments from 'src/hooks/CoachingData/useAssignments';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';
import {
  CoachDropdown,
  DeleteRecord,
  Dropdown,
  FormControls,
  LinkInput,
  TextAreaInput,
} from '../../general';

import getDateRange from '../../general/functions/dateRange';

import verifyRequiredInputs from '../../general/functions/inputValidation';

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
    updateAssignmentMutation.mutate(
      {
        relatedWeek: assignment.relatedWeek,
        recordId: assignment.recordId,
        homeworkCorrector,
        assignmentType,
        rating,
        notes,
        areasOfDifficulty,
        assignmentLink,
      },
      {
        onSuccess: () => {
          disableEditMode();
          closeContextual();
        },
      },
    );
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

        <Dropdown
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

        <Dropdown
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
}: {
  assignments: Assignment[] | null | undefined;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            key={`assignment${assignment.recordId}`}
          />
        ))}
    </div>
  );
}

export function NewAssignmentView({
  weekStartsDefaultValue,
}: {
  weekStartsDefaultValue: string;
}) {
  const { setContextualRef, closeContextual } = useContextualMenu();
  const { createAssignmentMutation } = useAssignments();
  const userDataQuery = useUserData();
  const { getStudentFromMembershipId, weeksQuery } = useCoaching();
  const { openModal } = useModal();

  const dateRange = getDateRange();

  interface StudentObj {
    studentFullname: string;
    relatedWeek: Week;
  }
  const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
  const [student, setStudent] = useState<StudentObj>();

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
  const updateStudent = (relatedWeekId: string) => {
    const weekId = Number.parseInt(relatedWeekId, 10);
    if (!weeksQuery.data) {
      console.error('No weeks found');
      return;
    }
    const studentWeek = weeksQuery.data?.find(
      (week) => week.recordId === weekId,
    );
    if (!studentWeek) {
      console.error('No student found with recordId:', relatedWeekId);
      return;
    }
    setStudent({
      studentFullname:
        getStudentFromMembershipId(studentWeek.relatedMembership)?.fullName ||
        '',
      relatedWeek: studentWeek,
    });
  };

  function createNewAssignment() {
    if (!student) {
      openModal({
        title: 'Error',
        body: 'Student is required',
        type: 'error',
      });
      return;
    }
    createAssignmentMutation.mutate(
      {
        relatedWeek: student.relatedWeek.recordId,
        homeworkCorrector,
        assignmentType,
        rating,
        notes,
        areasOfDifficulty,
        assignmentLink,
      },
      {
        onSuccess: () => {
          closeContextual();

          setHomeworkCorrector(userDataQuery.data?.emailAddress || '');
          setAssignmentType('');
          setRating('');
          setNotes('');
          setAreasOfDifficulty('');
          setAssignmentLink('');
        },
      },
    );
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
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControlls />
        <h4>Create Assignment Record</h4>
        <div className="lineWrapper">
          <label className="label" htmlFor="weekStarts">
            Week Starts:
          </label>
          <select
            id="weekStarts"
            className="content"
            value={weekStarts}
            onChange={(e) => setWeekStarts(e.target.value)}
          >
            <option value={dateRange.thisWeekDate}>
              This Week {`(${dateRange.thisWeekDate})`}
            </option>
            <option value={dateRange.lastSundayDate}>
              Last Week {`(${dateRange.lastSundayDate})`}
            </option>
            <option value={dateRange.twoSundaysAgoDate}>
              Two Weeks Ago {`(${dateRange.twoSundaysAgoDate})`}
            </option>
          </select>
        </div>
        <div className="lineWrapper">
          <label className="label" htmlFor="student">
            Student:
          </label>
          <select
            id="student"
            className="content"
            value={student?.relatedWeek.recordId || ''}
            onChange={(e) => updateStudent(e.target.value)}
          >
            <option value="">Select</option>
            {weeksQuery.data
              ?.filter((filterWeek) => {
                return (
                  filterWeek.membershipCourseHasGroupCalls &&
                  filterWeek.weekStarts === weekStarts
                );
              })
              .map((studentWeek) => ({
                ...studentWeek,
                studentFullName: getStudentFromMembershipId(
                  studentWeek.relatedMembership,
                )?.fullName,
              }))
              .sort(
                (a, b) =>
                  a.studentFullName?.localeCompare(b.studentFullName || '') ||
                  0,
              )
              .map((studentWeek) => (
                <option key={studentWeek.recordId} value={studentWeek.recordId}>
                  {studentWeek.studentFullName || 'No Name Found'}
                </option>
              ))}
          </select>
        </div>

        <Dropdown
          label="Assignment Type"
          value={assignmentType}
          onChange={setAssignmentType}
          options={assignmentTypes}
          editMode
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
          editMode
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
  );
}
