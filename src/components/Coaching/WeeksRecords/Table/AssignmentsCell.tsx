import type {
  BaseAssignment,
  BaseAssignmentRating,
  BaseAssignmentType,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAssignmentLookupsQuery } from '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery';
import { Dropdown } from '@interface/components/FormComponents';
import { useState } from 'react';
import x_dark from 'src/assets/icons/x_dark.svg';
import { CustomStudentSelector } from 'src/components/Coaching/general/CustomStudentSelector';
import {
  CoachDropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import DeleteRecord from 'src/components/FormComponents/DeleteRecord';
import FormControls from 'src/components/FormComponents/FormControls';
import verifyRequiredInputs, {
  isValidUrl,
} from 'src/components/FormComponents/functions/inputValidation';
import { useAssignmentsMutations } from 'src/hexagon/application/queries/AssignmentsQueries/useAssignmentMutations';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';
import { useWeeksByStartDate } from 'src/hexagon/application/queries/useWeeksByStartDate/useWeeksByStartDate';

import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
//   'Pronunciation',
//   'Writing',
//   'placement test',
//   'journal',
//   'verbal tenses review',
//   'audio quiz',
//   'Student Testimonial',
//   '_other',
// ];
// const ratings = [
//   'Excellent',
//   'Very Good',
//   'Good',
//   'Fair',
//   'Bad',
//   'Poor',
//   'Assigned to M3',
//   'No sound',
//   'Assigned to Level 2 (L6-9)',
//   'Assigned to Level 3 (L10-12)',
//   'Assigned to Level 1 (lessons 1-6)',
//   'Advanced group',
//   'Assigned to Level 1 (L1-L5)',
//   'Assigned to 1MC',
//   'Assigned to Level 4',
//   'New LCS course',
//   'Advanced',
// ];

export function AssignmentCell({
  week,
  assignment,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignment: BaseAssignment;
  tableEditMode: boolean;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.assignmentId}`)}
      >
        {`${assignment.assignmentType.assignmentType}: ${assignment.assignmentRating.assignmentRating}`}
      </button>
      {contextual === `assignment${assignment.assignmentId}` && (
        <AssignmentView
          week={week}
          assignment={assignment}
          tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export function AssignmentView({
  week,
  assignment,
  tableEditMode,
  onSuccess,
}: {
  week: FurnishedWeekWithCoach;
  assignment: BaseAssignment;
  tableEditMode: boolean;
  onSuccess?: () => void;
}) {
  const { coaches } = useAllCoachesQuery();
  // const {
  //   getStudentFromMembershipId,
  //   coachListQuery,
  //   // updateAssignmentMutation,
  //   // deleteAssignmentMutation,
  // } = useCoaching();
  const { updateAssignmentMutation, deleteAssignmentMutation } =
    useAssignmentsMutations();

  const { assignmentTypes, assignmentRatings } = useAssignmentLookupsQuery();

  const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  const { closeModal, openModal } = useModal();

  const [editMode, setEditMode] = useState(false);

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    assignment.homeworkCorrector,
  );
  const [assignmentType, setAssignmentType] = useState(
    assignment.assignmentType,
  );
  const [assignmentRating, setAssignmentRating] = useState(
    assignment.assignmentRating,
  );
  const [notes, setNotes] = useState(assignment.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    assignment.areasOfDifficulty,
  );
  const [assignmentLink, setAssignmentLink] = useState(
    assignment.assignmentLink,
  );

  function updateHomeworkCorrector(coachId: number) {
    const corrector = coaches?.find((coach) => coach.coach_id === coachId);
    if (!corrector) {
      console.error('No coach found with id:', coachId);
      return;
    }
    setHomeworkCorrector(corrector);
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
    setHomeworkCorrector(assignment.homeworkCorrector);
    setAssignmentType(assignment.assignmentType);
    setAssignmentRating(assignment.assignmentRating);
    setNotes(assignment.notes);
    setAreasOfDifficulty(assignment.areasOfDifficulty);
    setAssignmentLink(assignment.assignmentLink);
  }

  function deleteRecordFunction() {
    deleteAssignmentMutation.mutate(
      { assignmentId: assignment.assignmentId },
      {
        onSuccess: () => {
          closeModal();
          cancelEdit();
          closeContextual();
          onSuccess?.();
        },
      },
    );
  }

  function submitEdit() {
    updateAssignmentMutation.mutate(
      {
        weekId: assignment.weekId,
        assignmentId: assignment.assignmentId,
        homeworkCorrector: homeworkCorrector.coach_id,
        assignmentType,
        assignmentRating,
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
      homeworkCorrector.coach_id === assignment.homeworkCorrector.coach_id &&
      assignmentType.assignmentType ===
        assignment.assignmentType.assignmentType &&
      assignmentRating.assignmentRating ===
        assignment.assignmentRating.assignmentRating &&
      notes === assignment.notes &&
      areasOfDifficulty === assignment.areasOfDifficulty &&
      assignmentLink === assignment.assignmentLink
    ) {
      disableEditMode();
      return;
    }
    //Check for all required fields
    const badInput = verifyRequiredInputs([
      { label: 'Assignment Type', value: assignmentType?.assignmentType || '' },
      {
        label: 'Homework Corrector',
        value: homeworkCorrector?.coach_id.toString() || '',
      },
      { label: 'Rating', value: assignmentRating?.assignmentRating || '' },
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
      key={`assignment${assignment.assignmentId}`}
      editFunction={tableEditMode ? undefined : toggleEditMode}
    >
      {editMode ? (
        <h4>Edit Assignment</h4>
      ) : (
        <h4>
          {assignmentType.assignmentType} by {week.student?.fullName}
        </h4>
      )}

      <Dropdown
        label="Assignment Type"
        editMode={editMode}
        value={assignmentType.assignmentType}
        onChange={(value) => {
          const assignmentType = assignmentTypes?.find(
            (type) => type.assignmentType === value,
          );
          if (!assignmentType) {
            console.error('No assignment type found with value:', value);
            return;
          }
          setAssignmentType(assignmentType);
        }}
        options={assignmentTypes?.map((type) => type.assignmentType) || []}
        required
      />

      <CoachDropdown
        label="Corrected by"
        editMode={editMode}
        coachId={homeworkCorrector.coach_id}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        editMode={editMode}
        value={assignmentRating.assignmentRating}
        onChange={(value) => {
          const assignmentRating = assignmentRatings?.find(
            (rating) => rating.assignmentRating === value,
          );
          if (!assignmentRating) {
            console.error('No assignment rating found with value:', value);
            return;
          }
          setAssignmentRating(assignmentRating);
        }}
        options={
          assignmentRatings?.map((rating) => rating.assignmentRating) || []
        }
        required
      />

      <TextAreaInput
        label="Notes"
        editMode={editMode}
        value={notes || ''}
        onChange={setNotes}
      />

      <TextAreaInput
        label="Areas of Difficulty"
        editMode={editMode}
        value={areasOfDifficulty || ''}
        onChange={setAreasOfDifficulty}
      />

      <LinkInput
        label="Assignment Link"
        value={assignmentLink || ''}
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

function subtractWeeks(dateStr: string, weeks: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day - weeks * 7);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toReadableMonthDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function AssignmentsCell({
  week,
  assignments,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignments: BaseAssignment[] | null | undefined;
  tableEditMode: boolean;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            week={week}
            assignment={assignment}
            tableEditMode={tableEditMode}
            key={`assignment${assignment.assignmentId}`}
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
  const { assignmentTypes, assignmentRatings } = useAssignmentLookupsQuery();
  // const { createAssignmentMutation } = useCoaching();
  const { authUser } = useAuthAdapter();
  // const { getStudentFromMembershipId } = useCoaching();
  const { openModal } = useModal();
  const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
  const [numWeeks, setNumWeeks] = useState(4);
  const { weeks } = useWeeksByStartDate(weekStarts);
  const { coaches } = useAllCoachesQuery();

  const [editMode, setEditMode] = useState(true);
  const { createAssignmentMutation } = useAssignmentsMutations();

  const handleLoadMore = () => {
    setNumWeeks((prev) => prev * 2);
  };

  const dateRangeList = Array.from({ length: numWeeks }, (_, i) =>
    subtractWeeks(weekStartsDefaultValue, i),
  );

  interface StudentObj {
    studentFullname: string;
    relatedWeek: FurnishedWeekWithCoach;
  }
  const [student, setStudent] = useState<StudentObj>();
  const defaultHomeworkCorrector = coaches?.find(
    (coach) => coach.email === authUser.email,
  );

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    defaultHomeworkCorrector,
  );
  const [assignmentType, setAssignmentType] = useState<
    BaseAssignmentType | undefined
  >(undefined);
  const [assignmentRating, setAssignmentRating] = useState<
    BaseAssignmentRating | undefined
  >(undefined);
  const [notes, setNotes] = useState<string | null>(null);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState<string | null>(
    null,
  );
  const [assignmentLink, setAssignmentLink] = useState<string | null>(null);

  const updateHomeworkCorrector = (coach_id: number) => {
    setHomeworkCorrector(coaches?.find((coach) => coach.coach_id === coach_id));
  };
  const updateStudent = (relatedWeekId: number) => {
    if (!weeks.length) {
      console.error('No weeks found');
      return;
    }
    const studentWeek = weeks.find(
      (week: FurnishedWeekWithCoach) => week.weekId === relatedWeekId,
    );
    if (!studentWeek) {
      console.error('No student found with recordId:', relatedWeekId);
      return;
    }
    setStudent({
      studentFullname: studentWeek.student?.fullName || '',
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
    setEditMode(false);
    if (!assignmentType || !assignmentRating) {
      openModal({
        title: 'Error',
        body: 'Assignment Type and Rating are required',
        type: 'error',
      });
      return;
    }
    createAssignmentMutation.mutate(
      {
        weekId: student.relatedWeek.weekId,
        homeworkCorrector: homeworkCorrector?.coach_id || 0,
        assignmentType,
        assignmentRating,
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
    if (!homeworkCorrector) {
      openModal({
        title: 'Error',
        body: 'Homework Corrector is required',
        type: 'error',
      });
      return;
    }
    if (!student) {
      openModal({
        title: 'Error',
        body: 'Student is required',
        type: 'error',
      });
      return;
    }
    const badInput = verifyRequiredInputs([
      { label: 'Assignment Type', value: assignmentType?.assignmentType || '' },
      {
        label: 'Homework Corrector',
        value: homeworkCorrector?.coach_id.toString() || '',
      },
      { label: 'Rating', value: assignmentRating?.assignmentRating || '' },
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

  function toggleEditMode() {
    if (editMode) {
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }

  return (
    <ContextualView editFunction={toggleEditMode}>
      {editMode ? (
        <h4>Create Assignment</h4>
      ) : (
        <h4>
          {assignmentType?.assignmentType} by {student?.studentFullname}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <label htmlFor="assignmentName" className="label">
            Assignment Name:
          </label>
          <div className="content" id="assignmentName">
            {student &&
              `${student.relatedWeek.weekStarts} - ${assignmentType?.assignmentType}`}
          </div>
        </div>
      )}
      {editMode && (
        <div className="lineWrapper">
          <label htmlFor="primaryCoach" className="label">
            Primary Coach:
          </label>
          <div className="content" id="primaryCoach">
            {student && `${student.relatedWeek.coach?.fullName}`}
          </div>
        </div>
      )}
      {editMode && (
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
            {dateRangeList.map((date, i) => {
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
      )}
      {editMode && (
        <div className="lineWrapper">
          <label className="label" htmlFor="student">
            Student:
          </label>

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
      )}

      <Dropdown
        label="Assignment Type"
        value={assignmentType?.assignmentType || ''}
        onChange={(value) => {
          const assignmentType = assignmentTypes?.find(
            (type) => type.assignmentType === value,
          );
          if (!assignmentType) {
            console.error('No assignment type found with value:', value);
            return;
          }
          setAssignmentType(assignmentType);
        }}
        options={assignmentTypes?.map((type) => type.assignmentType) || []}
        editMode={editMode}
        required
      />

      <CoachDropdown
        label="Corrected by"
        editMode={editMode}
        coachId={homeworkCorrector?.coach_id || 0}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        value={assignmentRating?.assignmentRating || ''}
        onChange={(value) => {
          const assignmentRating = assignmentRatings?.find(
            (rating) => rating.assignmentRating === value,
          );
          if (!assignmentRating) {
            console.error('No assignment rating found with value:', value);
            return;
          }
          setAssignmentRating(assignmentRating);
        }}
        options={
          assignmentRatings?.map((rating) => rating.assignmentRating) || []
        }
        editMode={editMode}
        required
      />
      <LinkInput
        label="Assignment Link"
        value={assignmentLink || ''}
        onChange={setAssignmentLink}
        editMode={editMode}
      />
      <TextAreaInput
        label="Areas of Difficulty"
        editMode={editMode}
        value={areasOfDifficulty || ''}
        onChange={setAreasOfDifficulty}
      />
      <TextAreaInput
        label="Notes"
        editMode={editMode}
        value={notes || ''}
        onChange={setNotes}
      />
      <FormControls
        editMode={editMode}
        cancelEdit={closeContextual}
        captureSubmitForm={captureSubmitForm}
      />
    </ContextualView>
  );
}
