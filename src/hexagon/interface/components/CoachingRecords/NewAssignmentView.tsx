import type {
  BaseAssignmentRating,
  BaseAssignmentType,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAssignmentLookupsQuery } from '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery';
import { useAssignmentsMutations } from '@application/queries/AssignmentsQueries/useAssignmentMutations';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import {
  subtractWeeks,
  toShortReadableMonthDay,
} from '@interface/components/CoachingRecords/helpers';
import ContextualView from '@interface/components/Contextual/ContextualView';
import { Dropdown } from '@interface/components/FormComponents';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useModal } from '@interface/hooks/useModal';
import { useState } from 'react';
import x_dark from 'src/assets/icons/x_dark.svg';
import { CustomStudentSelector } from 'src/components/Coaching/general/CustomStudentSelector';
import {
  CoachDropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import FormControls from 'src/components/FormComponents/FormControls';
import verifyRequiredInputs, {
  isValidUrl,
} from 'src/components/FormComponents/functions/inputValidation';

interface StudentObj {
  studentFullname: string;
  relatedWeek: FurnishedWeekWithCoach;
}

export function NewAssignmentView({
  weekStartsDefaultValue,
  onSuccess,
}: {
  weekStartsDefaultValue: string;
  onSuccess?: () => void;
}): React.JSX.Element {
  const { closeContextual, openContextual } = useContextualMenu();
  const { assignmentTypes, assignmentRatings } = useAssignmentLookupsQuery();
  const { authUser } = useAuthAdapter();
  const { openModal } = useModal();
  const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
  const [numWeeks, setNumWeeks] = useState(4);
  const { weeks } = useWeeksByStartDate(weekStarts);
  const { coaches } = useAllCoachesQuery();
  const [editMode, setEditMode] = useState(true);
  const { createAssignmentMutation } = useAssignmentsMutations();

  const handleLoadMore = (): void => {
    setNumWeeks((prev) => prev * 2);
  };

  const dateRangeList = Array.from({ length: numWeeks }, (_, i) =>
    subtractWeeks(weekStartsDefaultValue, i),
  );

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

  const updateHomeworkCorrector = (coach_id: number): void => {
    setHomeworkCorrector(coaches?.find((coach) => coach.coach_id === coach_id));
  };

  const updateStudent = (relatedWeekId: number): void => {
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

  const updateWeekStarts = (value: string): void => {
    if (value === 'loadMore') {
      handleLoadMore();
      return;
    }
    setStudent(undefined);
    setWeekStarts(value);
  };

  function createNewAssignment(): void {
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
        onSuccess: (newAssignment) => {
          onSuccess?.();
          openContextual(`assignment${newAssignment.assignmentId}`);
        },
      },
    );
  }

  function captureSubmitForm(): void {
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

  function toggleEditMode(): void {
    setEditMode((prev) => !prev);
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
                      : toShortReadableMonthDay(date);
              return (
                <option key={date} value={date}>
                  {i < 3
                    ? `${label} (${toShortReadableMonthDay(date)})`
                    : label}
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
          const nextAssignmentType = assignmentTypes?.find(
            (type) => type.assignmentType === value,
          );
          if (!nextAssignmentType) {
            console.error('No assignment type found with value:', value);
            return;
          }
          setAssignmentType(nextAssignmentType);
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
          const nextAssignmentRating = assignmentRatings?.find(
            (rating) => rating.assignmentRating === value,
          );
          if (!nextAssignmentRating) {
            console.error('No assignment rating found with value:', value);
            return;
          }
          setAssignmentRating(nextAssignmentRating);
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
