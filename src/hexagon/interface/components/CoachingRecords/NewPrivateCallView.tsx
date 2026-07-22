import type {
  FurnishedWeekWithCoach,
  PrivateCallRating,
  PrivateCallType,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { usePrivateCallLookupsQuery } from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery';
import { usePrivateCallMutations } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { toReadableMonthDay } from '@domain/functions/dateUtils';
import {
  formatDateInput,
  subtractWeeks,
  toShortReadableMonthDay,
} from '@interface/components/CoachingRecords/helpers';
import ContextualView from '@interface/components/Contextual/ContextualView';
import { Dropdown } from '@interface/components/FormComponents';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useModal } from '@interface/hooks/useModal';
import { useEffect, useState } from 'react';
import x_dark from 'src/assets/icons/x_dark.svg';
import { CustomStudentSelector } from 'src/components/Coaching/general/CustomStudentSelector';
import {
  CoachDropdown,
  DateInput,
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';

interface WeekSlice {
  weekId: number;
  studentName?: string;
  weekStarts?: string | Date;
}

type NewPrivateCallViewProps =
  | {
      week: WeekSlice;
      weekStartsDefaultValue?: never;
      onSuccess?: () => void;
    }
  | {
      weekStartsDefaultValue: string;
      week?: never;
      onSuccess?: () => void;
    };

interface StudentObj {
  studentFullname: string;
  relatedWeek: FurnishedWeekWithCoach;
}

export function NewPrivateCallView(
  props: NewPrivateCallViewProps,
): React.JSX.Element {
  if ('week' in props) {
    const { week, onSuccess } = props;
    return <NewPrivateCallViewContent week={week} onSuccess={onSuccess} />;
  }

  const { weekStartsDefaultValue, onSuccess } = props;
  return (
    <NewPrivateCallViewContent
      weekStartsDefaultValue={weekStartsDefaultValue}
      onSuccess={onSuccess}
    />
  );
}

function NewPrivateCallViewContent({
  week,
  weekStartsDefaultValue,
  onSuccess,
}: {
  week?: WeekSlice;
  weekStartsDefaultValue?: string;
  onSuccess?: () => void;
}): React.JSX.Element {
  const weekProvided = week != null;

  const { createPrivateCallMutation } = usePrivateCallMutations();
  const { callRatings, callTypes } = usePrivateCallLookupsQuery();
  const { closeContextual, openContextual } = useContextualMenu();
  const { authUser } = useAuthAdapter();
  const { openModal } = useModal();
  const { coaches } = useAllCoachesQuery();

  const [weekStarts, setWeekStarts] = useState(
    weekStartsDefaultValue ?? (formatDateInput(week?.weekStarts) || ''),
  );
  const [numWeeks, setNumWeeks] = useState(4);
  const { weeks } = useWeeksByStartDate(weekProvided ? '' : weekStarts);
  const [student, setStudent] = useState<StudentObj>();

  const defaultCaller =
    coaches?.find((coach) => coach.email === authUser.email)?.coach_id || 0;

  const [caller, setCaller] = useState(defaultCaller);
  const [date, setDate] = useState(
    new Date(Date.now()).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [recording, setRecording] = useState('');
  const [callRating, setCallRating] = useState<PrivateCallRating>();
  const [callType, setCallType] = useState<PrivateCallType>();
  const [editMode, setEditMode] = useState(true);

  const dateRangeList = weekStartsDefaultValue
    ? Array.from({ length: numWeeks }, (_, i) =>
        subtractWeeks(weekStartsDefaultValue, i),
      )
    : [];

  const displayStudentName = weekProvided
    ? week?.studentName || 'No Student'
    : student?.studentFullname || 'No Student';

  useEffect(() => {
    if (caller === 0 && defaultCaller !== 0) {
      setCaller(defaultCaller);
    }
  }, [caller, defaultCaller]);

  useEffect(() => {
    if (!callType && callTypes && callTypes.length > 0) {
      setCallType(
        callTypes.find((type) => type.callType === 'Monthly Call') ||
          callTypes[0],
      );
    }
  }, [callType, callTypes]);

  const updateStudent = (relatedWeekId: number): void => {
    if (!weeks.length) {
      console.error('No weeks found');
      return;
    }
    const studentWeek = weeks.find(
      (possibleWeek: FurnishedWeekWithCoach) =>
        possibleWeek.weekId === relatedWeekId,
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
      setNumWeeks((prev) => prev * 2);
      return;
    }
    setStudent(undefined);
    setWeekStarts(value);
  };

  function resolveWeekId(): number | null {
    if (weekProvided && week) {
      return week.weekId;
    }
    return student?.relatedWeek.weekId ?? null;
  }

  function createNewPrivateCall(): void {
    const weekId = resolveWeekId();
    if (weekId == null) {
      openModal({
        title: 'Error',
        body: 'Student is required',
        type: 'error',
      });
      return;
    }

    const badInput = verifyRequiredInputs([
      { value: callRating?.rating || '', label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller ? String(caller) : '', label: 'Caller' },
      { value: callType?.callType || '', label: 'Call Type' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
        type: 'error',
      });
      return;
    }
    if (!callRating || !callType) {
      openModal({
        title: 'Error',
        body: 'Rating and Call Type are required',
        type: 'error',
      });
      return;
    }
    if (recording && !isValidUrl(recording)) {
      openModal({
        title: 'Error',
        body: 'Recording Link must be a valid url',
        type: 'error',
      });
      return;
    }
    setEditMode(false);
    createPrivateCallMutation.mutate(
      {
        weekId,
        callRating,
        callType,
        caller,
        callDate: date,
        notes,
        areasOfDifficulty,
        recording,
      },
      {
        onSuccess: (newPrivateCall) => {
          onSuccess?.();
          openContextual(`call${newPrivateCall.callId}`);
        },
      },
    );
  }

  function toggleEditMode(): void {
    setEditMode((prev) => !prev);
  }

  return (
    <ContextualView editFunction={toggleEditMode}>
      {editMode ? (
        <h4>Create Call</h4>
      ) : (
        <h4>
          {displayStudentName} on {toReadableMonthDay(date)}
        </h4>
      )}
      {editMode && weekProvided && (
        <div className="lineWrapper">
          <label htmlFor="privateCallName" className="label">
            Private Call:
          </label>
          <div className="content" id="privateCallName">
            {formatDateInput(week?.weekStarts)} - {displayStudentName}
          </div>
        </div>
      )}
      {editMode && weekProvided && (
        <div className="lineWrapper">
          <label className="label" htmlFor="student">
            Student:
          </label>
          <div className="content" id="student">
            {displayStudentName}
          </div>
        </div>
      )}
      {editMode && !weekProvided && (
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
            {dateRangeList.map((rangeDate, i) => {
              const label =
                i === 0
                  ? 'This Week'
                  : i === 1
                    ? 'Last Week'
                    : i === 2
                      ? 'Two Weeks Ago'
                      : toShortReadableMonthDay(rangeDate);
              return (
                <option key={rangeDate} value={rangeDate}>
                  {i < 3
                    ? `${label} (${toShortReadableMonthDay(rangeDate)})`
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
      {editMode && !weekProvided && (
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
        label="Rating"
        value={callRating?.rating || ''}
        onChange={(value) => {
          const selectedRating = callRatings?.find(
            (rating) => rating.rating === value,
          );
          if (!selectedRating) {
            console.error('No private call rating found with value:', value);
            return;
          }
          setCallRating(selectedRating);
        }}
        options={callRatings?.map((rating) => rating.rating) || []}
        editMode={editMode}
        required
      />

      <CoachDropdown
        label="Caller"
        coachId={caller}
        onChange={setCaller}
        editMode={editMode}
        required
      />

      <DateInput value={date} onChange={setDate} required editMode={editMode} />

      <TextAreaInput
        label="Notes"
        value={notes}
        onChange={setNotes}
        editMode={editMode}
      />

      <TextAreaInput
        label="Difficulties"
        value={areasOfDifficulty}
        onChange={setAreasOfDifficulty}
        editMode={editMode}
      />

      <LinkInput
        label="Recording Link"
        value={recording}
        onChange={setRecording}
        editMode={editMode}
      />

      <Dropdown
        label="Call Type"
        value={callType?.callType || ''}
        onChange={(value) => {
          const selectedCallType = callTypes?.find(
            (type) => type.callType === value,
          );
          if (!selectedCallType) {
            console.error('No private call type found with value:', value);
            return;
          }
          setCallType(selectedCallType);
        }}
        options={callTypes?.map((type) => type.callType) || []}
        editMode={editMode}
        required
      />

      <FormControls
        captureSubmitForm={createNewPrivateCall}
        cancelEdit={() => closeContextual()}
        editMode={editMode}
      />
    </ContextualView>
  );
}
