import type {
  FurnishedWeekWithCoach,
  SrLesson,
  UpdateWeekCommand,
} from '@learncraft-spanish/shared';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import checkmark from 'src/assets/icons/checkmark_green.svg';
import pencil from 'src/assets/icons/pencil.svg';
import x from 'src/assets/icons/x.svg';
import { SearchableDropdown, Switch } from 'src/components/FormComponents';
import { useSrLessonsQuery } from 'src/hexagon/application/queries/useSrLessonsQuery';
import { useWeekMutations } from 'src/hexagon/application/queries/WeekQueries/useWeekMutations';
import { useModal } from 'src/hexagon/interface/hooks/useModal';

import AssignmentsCell from './AssignmentsCell';
import GroupSessionsCell from './GroupSessionsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';

function toUpdateWeekCommand(week: FurnishedWeekWithCoach): UpdateWeekCommand {
  const updateWeekCommand: UpdateWeekCommand = {
    weekId: week.weekId,
    notes: week.notes,
    holdWeek: week.holdWeek,
    recordComplete: week.recordComplete,
  };
  if (week.lesson) {
    updateWeekCommand.lesson = week.lesson;
  }
  return updateWeekCommand;
}

function hasWeekChanges(
  originalWeek: FurnishedWeekWithCoach,
  localWeek: UpdateWeekCommand,
): boolean {
  return (
    localWeek.notes !== originalWeek.notes ||
    localWeek.holdWeek !== originalWeek.holdWeek ||
    localWeek.recordComplete !== originalWeek.recordComplete ||
    localWeek.lesson?.srLessonId !== originalWeek.lesson?.srLessonId
  );
}

interface WeeksTableItemProps {
  week: FurnishedWeekWithCoach;
  updateActiveDataWeek?: (week: UpdateWeekCommand) => void;
  editMode: boolean;
  hiddenFields: string[];
  srLessons?: SrLesson[];
  allowSingleRecordUpdate?: boolean;
  toggleEditMode?: () => void;
  cancelEdit?: () => void;
  handleSubmit?: () => void;
  handleRecordCompleteableChange?: (newValue: boolean) => void;
  submitDisabled?: boolean;
}

export default function WeeksTableItem({
  week,
  updateActiveDataWeek,
  editMode,
  hiddenFields,
  srLessons,
  allowSingleRecordUpdate,
  toggleEditMode,
  cancelEdit,
  handleSubmit,
  handleRecordCompleteableChange,
  submitDisabled,
}: WeeksTableItemProps) {
  // Foreign Key lookup, form data in backend
  const assignments = useMemo(() => week.assignments, [week.assignments]);
  // Foreign Key lookup, form data in backend
  const groupSessions = useMemo(() => week.groupCalls, [week.groupCalls]);
  // Foreign Key lookup, form data in backend
  const privateCalls = useMemo(() => week.privateCalls, [week.privateCalls]);
  const lessonOptions = useMemo(
    () =>
      srLessons?.map((lesson) => ({
        label: lesson.lessonName,
        value: lesson.srLessonId.toString(),
      })) || [],
    [srLessons],
  );

  function getUpdatedWeekCommand(
    updates: Partial<UpdateWeekCommand>,
  ): UpdateWeekCommand {
    return {
      weekId: week.weekId,
      notes: week.notes,
      holdWeek: week.holdWeek,
      recordComplete: week.recordComplete,
      lesson: week.lesson,
      ...updates,
    };
  }

  return (
    <tr>
      <td>
        <StudentCell
          week={week}
          // Foreign Key lookup, form data in backend
          student={week.student}
          hiddenFields={hiddenFields}
        />
      </td>
      <td>
        <AssignmentsCell
          week={week}
          assignments={assignments}
          tableEditMode={editMode}
        />
      </td>
      <td>
        {groupSessions && (
          <GroupSessionsCell
            week={week}
            groupSessions={groupSessions}
            tableEditMode={editMode}
          />
        )}
      </td>
      <td>
        {/* We should only show the private calls if:
          - the student has private calls
          OR
          - they have valid bundle credits

          We should implement this when we update the data parsing to be handleled on the backend
           */}
        <PrivateCallsCell
          week={week}
          calls={privateCalls}
          tableEditMode={editMode}
        />
      </td>
      <td className="notesCell">
        {editMode ? (
          <textarea
            value={week.notes ?? ''}
            onChange={(e) =>
              updateActiveDataWeek?.(
                getUpdatedWeekCommand({ notes: e.target.value }),
              )
            }
            disabled={!editMode}
          />
        ) : (
          <p>{week.notes}</p>
        )}
      </td>
      <td>
        {editMode ? (
          <SearchableDropdown
            value={week.lesson?.srLessonId.toString() ?? '0'}
            valueText={week.lesson?.lessonName ?? ''}
            onChange={(value) => {
              const selectedLesson = srLessons?.find(
                (lesson) => lesson.srLessonId === Number.parseInt(value),
              );
              updateActiveDataWeek?.(
                getUpdatedWeekCommand({ lesson: selectedLesson }),
              );
            }}
            options={lessonOptions}
          />
        ) : (
          week.lesson?.lessonName
        )}
      </td>
      <td className="checkboxCell">
        {editMode ? (
          <Switch
            htmlFor={`holdWeek-${week.weekId}`}
            value={week.holdWeek}
            onChange={(value) =>
              updateActiveDataWeek?.(getUpdatedWeekCommand({ holdWeek: value }))
            }
          />
        ) : (
          week.holdWeek && (
            <img className="checkmark" src={checkmark} alt="Checkmark" />
          )
        )}
      </td>
      <td className="checkboxCell">
        {editMode ? (
          <Switch
            htmlFor={`recordCompleteable-${week.weekId}`}
            value={week.recordComplete}
            onChange={(value) => handleRecordCompleteableChange?.(value)}
          />
        ) : (
          week.recordComplete && (
            <img className="checkmark" src={checkmark} alt="Checkmark" />
          )
        )}
      </td>
      {allowSingleRecordUpdate && (
        <td className="editIconCell">
          {editMode ? (
            <>
              <img
                src={x}
                alt="Cancel Edit"
                onClick={cancelEdit}
                className="cancelEditIcon"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="submitEditButton"
                disabled={submitDisabled}
              >
                Submit Changes
              </button>
            </>
          ) : (
            <img
              src={pencil}
              className="editIconRowRecord"
              alt="Edit Record"
              onClick={() => toggleEditMode?.()}
            />
          )}
        </td>
      )}
    </tr>
  );
}

export function WeeksTableItemWithSiingleRecordEdit({
  week,
  tableEditMode,
  hiddenFields,
}: {
  week: FurnishedWeekWithCoach;
  tableEditMode: boolean;
  hiddenFields: string[];
}) {
  const { closeModal, openModal } = useModal();
  const { data: srLessons } = useSrLessonsQuery();
  const { updateWeekMutation } = useWeekMutations();
  const [editMode, setEditMode] = useState(false);
  const [localWeek, setLocalWeek] = useState<UpdateWeekCommand>(() =>
    toUpdateWeekCommand(week),
  );

  useEffect(() => {
    setLocalWeek(toUpdateWeekCommand(week));
  }, [week]);

  function validateRecordCompleteable(
    weekToValidate: UpdateWeekCommand,
  ): boolean {
    if (week.weekNumber === 0) {
      return true;
    }
    if (!weekToValidate.lesson?.srLessonId) {
      return false;
    }
    if (
      week.privateCalls.length === 0 &&
      (weekToValidate.notes ?? '').trim() === '' &&
      week.groupCalls.length === 0
    ) {
      return false;
    }

    return true;
  }

  function handleRecordCompleteableChange(newValue: boolean): void {
    const updatedWeek = {
      ...localWeek,
      recordComplete: newValue,
    };
    if (newValue && !validateRecordCompleteable(updatedWeek)) {
      openModal({
        title: 'Error',
        body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
        type: 'error',
      });
      return;
    }
    setLocalWeek(updatedWeek);
  }

  function captureCancelEdit(): void {
    if (!hasWeekChanges(week, localWeek)) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }
    openModal({
      title: 'Cancel Edit',
      body: 'Are you sure you want to cancel your changes?',
      type: 'confirm',
      confirmFunction: () => cancelEdit(),
    });
  }

  function cancelEdit(): void {
    setLocalWeek(toUpdateWeekCommand(week));
    closeModal();
    setEditMode(false);
  }

  function handleSubmit(): void {
    if (!hasWeekChanges(week, localWeek)) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }

    if (localWeek.recordComplete && !validateRecordCompleteable(localWeek)) {
      openModal({
        title: 'Error',
        body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
        type: 'error',
      });
      return;
    }

    updateWeekMutation.mutate([localWeek], {
      onSuccess: () => {
        toast.success('Week updated!');
        setEditMode(false);
      },
      onError: () => {
        toast.error('Error updating week');
      },
    });
  }

  function handleDataUpdate(updatedWeek: UpdateWeekCommand): void {
    setLocalWeek(updatedWeek);
  }

  const modifiedWeek: FurnishedWeekWithCoach = {
    ...week,
    notes: localWeek.notes,
    holdWeek: localWeek.holdWeek,
    recordComplete: localWeek.recordComplete,
    lesson: localWeek.lesson,
  };

  function toggleEditMode(): void {
    setEditMode(!editMode);

    if (!editMode) {
      setTimeout(() => {
        const tableWrapper = document.querySelector('.tableWrapper');
        if (tableWrapper) {
          tableWrapper.scrollLeft = tableWrapper.scrollWidth;
        }
      }, 50);
    }
  }

  return (
    <WeeksTableItem
      week={modifiedWeek}
      updateActiveDataWeek={handleDataUpdate}
      editMode={tableEditMode || editMode}
      hiddenFields={hiddenFields}
      srLessons={srLessons}
      allowSingleRecordUpdate={!tableEditMode}
      toggleEditMode={toggleEditMode}
      cancelEdit={captureCancelEdit}
      handleSubmit={handleSubmit}
      handleRecordCompleteableChange={handleRecordCompleteableChange}
      submitDisabled={updateWeekMutation.isPending}
    />
  );
}
