import type { Assignment, Week } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMemo, useState } from 'react';
import x_dark from 'src/assets/icons/x_dark.svg';
import ContextualView from 'src/components/Contextual/ContextualView';
import {
  CoachDropdown,
  DeleteRecord,
  Dropdown,
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';
import { toReadableMonthDay } from 'src/functions/dateUtils';
import useWeeks from 'src/hooks/CoachingData/queries/useWeeks';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

import { useModal } from 'src/hooks/useModal';

import CustomStudentSelector from '../../general/CustomStudentSelector';
import getDateRange from '../../general/functions/dateRange';
import getLoggedInCoach from '../../general/functions/getLoggedInCoach';
import getWeekEnds from '../../general/functions/getWeekEnds';

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

export function AssignmentCell({
  assignment,
  tableEditMode,
}: {
  assignment: Assignment;
  tableEditMode: boolean;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {`${assignment.assignmentType}: ${assignment.rating}`}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <AssignmentView assignment={assignment} tableEditMode={tableEditMode} />
      )}
    </div>
  );
}

export function AssignmentView({
  assignment,
  tableEditMode,
  onSuccess,
}: {
  assignment: Assignment;
  tableEditMode?: boolean;
  onSuccess?: () => void;
}) {
  const {
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    coachListQuery,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  } = useCoaching();
  const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  const { closeModal, openModal } = useModal();

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

  function toggleEditMode() {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
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
        onSuccess?.();
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
          onSuccess?.();
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
    if (assignmentLink && !isValidUrl(assignmentLink)) {
      openModal({
        title: 'Error',
        body: 'Assignment Link must be a valid url',
        type: 'error',
      });
      return;
    }
    submitEdit();
  }
  return (
    <ContextualView
      key={`assignment${assignment.recordId}`}
      editFunction={tableEditMode ? undefined : toggleEditMode}
    >
      {editMode ? (
        <h4>Edit Assignment</h4>
      ) : (
        <h4>
          {assignmentType} by{' '}
          {
            // Foreign Key lookup, form data in backend
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
        required
      />

      <CoachDropdown
        label="Corrected by"
        editMode={editMode}
        coachEmail={homeworkCorrector}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        editMode={editMode}
        value={rating}
        onChange={setRating}
        options={ratings}
        required
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
    </ContextualView>
  );
}

export default function AssignmentsCell({
  assignments,
  tableEditMode,
}: {
  assignments: Assignment[] | null | undefined;
  tableEditMode: boolean;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            tableEditMode={tableEditMode}
            key={`assignment${assignment.recordId}`}
          />
        ))}
    </div>
  );
}

export function NewAssignmentView({
  weekStartsDefaultValue,
  onSuccess,
}: {
  weekStartsDefaultValue: string;
  onSuccess?: () => void;
}) {
  const { closeContextual } = useContextualMenu();
  const { createAssignmentMutation } = useCoaching();
  const { authUser } = useAuthAdapter();
  const { getStudentFromMembershipId } = useCoaching();
  const { openModal } = useModal();
  const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
  const [numWeeks, setNumWeeks] = useState(4);
  const weekEnds = useMemo(() => getWeekEnds(weekStarts), [weekStarts]);
  const dateRange = useMemo(() => getDateRange(numWeeks), [numWeeks]);
  const { weeksQuery } = useWeeks(weekStarts, weekEnds);
  const { coachListQuery } = useCoaching();

  const handleLoadMore = () => {
    setNumWeeks((prev) => prev * 2);
  };

  interface StudentObj {
    studentFullname: string;
    relatedWeek: Week;
  }
  const [student, setStudent] = useState<StudentObj>();
  const defaultHomeworkCorrector = useMemo(() => {
    return (
      getLoggedInCoach(authUser.email || '', coachListQuery.data || [])?.user
        .email || ''
    );
  }, [authUser.email, coachListQuery.data]);

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    defaultHomeworkCorrector,
  );
  const [assignmentType, setAssignmentType] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [assignmentLink, setAssignmentLink] = useState('');

  const updateHomeworkCorrector = (email: string) => {
    setHomeworkCorrector(email);
  };
  const updateStudent = (relatedWeekId: number) => {
    if (!weeksQuery.data) {
      console.error('No weeks found');
      return;
    }
    const studentWeek = weeksQuery.data.find(
      (week: Week) => week.recordId === relatedWeekId,
    );
    if (!studentWeek) {
      console.error('No student found with recordId:', relatedWeekId);
      return;
    }
    setStudent({
      studentFullname:
        // Foreign Key lookup, form data in backend
        getStudentFromMembershipId(studentWeek.relatedMembership)?.fullName ||
        '',
      relatedWeek: studentWeek,
    });
  };

  const updateWeekStarts = (value: string) => {
    if (value === 'loadMore') {
      handleLoadMore();
      return; // Don't update the selected value
    }
    setStudent(undefined);
    setWeekStarts(value);
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
          onSuccess?.();
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
    if (assignmentLink && !isValidUrl(assignmentLink)) {
      openModal({
        title: 'Error',
        body: 'Assignment Link must be a valid url',
        type: 'error',
      });
      return;
    }
    createNewAssignment();
  }

  return (
    <ContextualView>
      <h4>Create Assignment Record</h4>
      <div className="lineWrapper">
        <label htmlFor="assignmentName" className="label">
          Assignment Name:
        </label>
        <div className="content" id="assignmentName">
          {student && `${student.relatedWeek.weekName} - ${assignmentType}`}
        </div>
      </div>
      <div className="lineWrapper">
        <label htmlFor="primaryCoach" className="label">
          Primary Coach:
        </label>
        <div className="content" id="primaryCoach">
          {student && `${student.relatedWeek.primaryCoachWhenCreated}`}
        </div>
      </div>
      <div className="lineWrapper">
        <label className="label" htmlFor="weekStarts">
          Week Starts:
        </label>
        <select
          id="weekStarts"
          className="content"
          value={weekStarts}
          onChange={(e) => updateWeekStarts(e.target.value)}
        >
          {Array.from({ length: numWeeks }, (_, i) => {
            const dateKey =
              i === 0
                ? 'thisWeekDate'
                : i === 1
                  ? 'lastSundayDate'
                  : i === 2
                    ? 'twoSundaysAgoDate'
                    : `${i + 1}SundaysAgoDate`;
            const date = dateRange[dateKey];
            const label =
              i === 0
                ? 'This Week'
                : i === 1
                  ? 'Last Week'
                  : i === 2
                    ? 'Two Weeks Ago'
                    : toReadableMonthDay(date);
            return (
              <option key={date} value={date}>
                {i < 3 ? `${label} (${toReadableMonthDay(date)})` : label}
              </option>
            );
          })}
          <option value="loadMore" className="loadMoreOption">
            Load More...
          </option>
        </select>
      </div>
      <div className="lineWrapper">
        <label className="label" htmlFor="student">
          Student:
        </label>
        {/* <select
            id="student"
            className="content"
            value={student?.relatedWeek.recordId || ''}
            onChange={(e) => updateStudent(e.target.value)}
          >
            <option value="">Select</option>
            {weeksQuery.data
              ?.filter((filterWeek) => {
                return filterWeek.weekStarts === weekStarts;
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
                  {` -- ${studentWeek.weekStarts}`}
                </option>
              ))}
          </select> */}
        {student ? (
          <>
            <div className="content">{student.studentFullname}</div>
            <button
              type="button"
              className="clearStudent"
              onClick={() => setStudent(undefined)}
            >
              <img src={x_dark} alt="close" />
            </button>
          </>
        ) : (
          <CustomStudentSelector
            weekStarts={weekStarts}
            onChange={updateStudent}
          />
        )}
      </div>

      <Dropdown
        label="Assignment Type"
        value={assignmentType}
        onChange={setAssignmentType}
        options={assignmentTypes}
        editMode
        required
      />

      <CoachDropdown
        label="Corrected by"
        editMode
        coachEmail={homeworkCorrector}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        value={rating}
        onChange={setRating}
        options={ratings}
        editMode
        required
      />
      <LinkInput
        label="Assignment Link"
        value={assignmentLink}
        onChange={setAssignmentLink}
        editMode
      />
      <TextAreaInput
        label="Areas of Difficulty"
        editMode
        value={areasOfDifficulty}
        onChange={setAreasOfDifficulty}
      />
      <TextAreaInput label="Notes" editMode value={notes} onChange={setNotes} />
      <FormControls
        editMode
        cancelEdit={closeContextual}
        captureSubmitForm={captureSubmitForm}
      />
    </ContextualView>
  );
}
