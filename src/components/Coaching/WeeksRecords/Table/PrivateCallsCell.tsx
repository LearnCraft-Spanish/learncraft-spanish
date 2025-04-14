import type { PrivateCall, Student, Week } from 'src/types/CoachingTypes';
import { getWeekEnds } from 'mocks/data/serverlike/studentRecords/scripts/functions';
import React, { useEffect, useMemo, useState } from 'react';
import x_dark from 'src/assets/icons/x_dark.svg';
import CustomStudentSelector from 'src/components/Coaching/general/CustomStudentSelector';
import getDateRange from 'src/components/Coaching/general/functions/dateRange';
import ContextualView from 'src/components/Contextual/ContextualView';
import {
  CoachDropdown,
  DateInput,
  DeleteRecord,
  Dropdown,
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';
import { toReadableMonthDay } from 'src/functions/dateUtils';
import { useWeeks } from 'src/hooks/CoachingData/queries';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';

const ratingOptions = [
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Poor',
  'Bad',
  'Late Cancel',
  'No-Show',
];
const callTypeOptions = ['Monthly Call', 'Uses Credit (Bundle)'];
function PrivateCallInstance({
  call,
  tableEditMode,
}: {
  call: PrivateCall;
  tableEditMode: boolean;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual" key={call.recordId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.recordId}`)}
      >
        {call.rating}
      </button>
      {contextual === `call${call.recordId}` && (
        <PrivateCallView call={call} tableEditMode={tableEditMode} />
      )}
    </div>
  );
}

export function PrivateCallView({
  call,
  tableEditMode,
  onSuccess,
}: {
  call: PrivateCall;
  tableEditMode?: boolean;
  onSuccess?: () => void;
}) {
  const userDataQuery = useUserData();
  const { updateDisableClickOutside, closeContextual } = useContextualMenu();
  const {
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  } = useCoaching();

  const { openModal, closeModal } = useModal();

  const [editMode, setEditMode] = useState(false);
  // inputs & defaults
  const [rating, setRating] = useState(call.rating);
  const [caller, setCaller] = useState(call.caller.email || '');
  const [date, setDate] = useState(
    new Date(call.date).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState(call.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    call.areasOfDifficulty,
  );
  const [callType, setCallType] = useState(call.callType);
  const [recording, setRecording] = useState(call.recording);

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

    setRating(call.rating);
    setNotes(call.notes);
    setAreasOfDifficulty(call.areasOfDifficulty);
    setRecording(call.recording);
    setDate(new Date(call.date).toISOString().split('T')[0]);
    setCaller(call.caller.email);
    setCallType(call.callType);
  }

  function submitEdit() {
    // Verify inputs
    const badInput = verifyRequiredInputs([
      { value: rating, label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller, label: 'Caller' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
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
    updatePrivateCallMutation.mutate(
      {
        recordId: call.recordId,
        relatedWeek: call.relatedWeek,
        rating,
        notes,
        areasOfDifficulty,
        recording,
        date,
        caller,
        callType,
      },
      {
        onSuccess: () => {
          disableEditMode();
          onSuccess?.();
        },
      },
    );
  }

  function deleteRecordFunction() {
    deletePrivateCallMutation.mutate(call.recordId, {
      onSuccess: () => {
        closeModal();
        cancelEdit();
        closeContextual();
        onSuccess?.();
      },
    });
  }

  function captureSubmitForm() {
    // check if fields have changed from original call
    // if not, do nothing
    if (
      call.rating === rating &&
      call.notes === notes &&
      call.areasOfDifficulty === areasOfDifficulty &&
      call.recording === recording &&
      call.date === date &&
      call.caller.email === caller
    ) {
      cancelEdit();
      return;
    }
    // if they have, submit the form
    submitEdit();
  }

  return (
    <ContextualView editFunction={tableEditMode ? undefined : toggleEditMode}>
      {editMode ? (
        <h4>Edit Call</h4>
      ) : (
        <h4>
          {
            getStudentFromMembershipId(
              getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
            )?.fullName
          }{' '}
          on {typeof call.date === 'string' ? call.date : call.date.toString()}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <p className="label">Student: </p>
          <p>
            {
              getStudentFromMembershipId(
                getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
              )?.fullName
            }
          </p>
        </div>
      )}

      <CoachDropdown
        label="Caller"
        coachEmail={caller}
        onChange={setCaller}
        editMode={editMode}
      />

      {editMode && <DateInput value={date} onChange={setDate} />}

      <Dropdown
        label="Rating"
        value={rating}
        onChange={setRating}
        options={ratingOptions}
        editMode={editMode}
      />

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
        value={callType}
        onChange={setCallType}
        options={callTypeOptions}
        editMode={editMode}
      />

      {editMode && userDataQuery.data?.roles.adminRole === 'admin' && (
        <DeleteRecord deleteFunction={deleteRecordFunction} />
      )}

      <FormControls
        captureSubmitForm={captureSubmitForm}
        cancelEdit={cancelEdit}
        editMode={editMode}
      />
    </ContextualView>
  );
}

export default function PrivateCallsCell({
  week,
  calls,
  tableEditMode,
  student,
}: {
  week: Week;
  calls: PrivateCall[] | null;
  tableEditMode: boolean;
  student?: Student | undefined | null;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="callBox">
      {/* Existing Calls */}
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.recordId}
            call={call}
            tableEditMode={tableEditMode}
          />
        ))}
      {/* New Call Form */}
      {!tableEditMode && (
        <button
          type="button"
          className="greenButton"
          onClick={() => openContextual(`addPrivateCall${week.recordId}`)}
        >
          New
        </button>
      )}
      {contextual === `addPrivateCall${week.recordId}` && (
        <NewPrivateCallView
          weekStartsDefaultValue={
            typeof week.weekStarts === 'string'
              ? week.weekStarts
              : week.weekStarts.toISOString()
          }
          studentObj={{
            studentFullname: student?.fullName || '',
            relatedWeek: week,
          }}
        />
      )}
    </div>
  );
}

export function NewPrivateCallView({
  onSuccess,
  weekStartsDefaultValue,
  studentObj,
}: {
  onSuccess?: () => void;
  weekStartsDefaultValue: string;
  studentObj?:
    | {
        studentFullname: string;
        relatedWeek: Week;
      }
    | undefined
    | null;
}) {
  const { getStudentFromMembershipId, createPrivateCallMutation } =
    useCoaching();
  const { closeContextual } = useContextualMenu();
  const userDataQuery = useUserData();
  const { openModal } = useModal();

  // New Record Inputs
  const [caller, setCaller] = useState(userDataQuery.data?.emailAddress || '');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState(
    new Date(Date.now()).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [recording, setRecording] = useState('');
  const [callType, setCallType] = useState('Monthly Call');

  const [student, setStudent] = useState<
    | {
        studentFullname: string;
        relatedWeek: Week;
      }
    | undefined
  >(undefined);

  const [numWeeks, setNumWeeks] = useState(4);
  const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
  const weekEnds = useMemo(() => getWeekEnds(weekStarts), [weekStarts]);
  const dateRange = useMemo(() => getDateRange(numWeeks), [numWeeks]);
  const { weeksQuery } = useWeeks(weekStarts, weekEnds);

  const handleLoadMore = () => {
    setNumWeeks((prev) => prev * 2);
  };

  function createNewPrivateCall() {
    // Verify inputs
    const badInput = verifyRequiredInputs([
      { value: rating, label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller, label: 'Caller' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
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
    if (!student) {
      openModal({
        title: 'Error',
        body: 'Please select a student',
        type: 'error',
      });
      return;
    }
    createPrivateCallMutation.mutate(
      {
        relatedWeek: student?.relatedWeek.recordId,
        rating,
        notes,
        areasOfDifficulty,
        recording,
        callType,
        date,
        caller,
      },
      {
        onSuccess: () => {
          closeContextual();

          // Reset State
          setRating('');
          setNotes('');
          setAreasOfDifficulty('');
          setRecording('');
          setDate(new Date(Date.now()).toISOString().split('T')[0]);
          setCaller(userDataQuery.data?.emailAddress || '');
          setCallType('Monthly Call');

          onSuccess?.();
        },
      },
    );
  }
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

  useEffect(() => {
    if (studentObj && studentObj.studentFullname.length > 0) {
      setStudent(studentObj);
    }
  }, [studentObj]);

  return (
    <ContextualView>
      {!studentObj ? (
        <>
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
        </>
      ) : (
        <Dropdown
          label="Student"
          value={student?.studentFullname}
          onChange={() => {}}
          options={[student?.studentFullname || '']}
          editMode={false}
        />
      )}

      <Dropdown
        label="Rating"
        value={rating}
        onChange={setRating}
        options={ratingOptions}
        editMode
        required
      />

      <CoachDropdown
        label="Caller"
        coachEmail={caller}
        onChange={setCaller}
        editMode
        required
      />

      <DateInput value={date} onChange={setDate} required />

      <TextAreaInput label="Notes" value={notes} onChange={setNotes} editMode />

      <TextAreaInput
        label="Difficulties"
        value={areasOfDifficulty}
        onChange={setAreasOfDifficulty}
        editMode
      />

      <LinkInput
        label="Recording Link"
        value={recording}
        onChange={setRecording}
        editMode
      />

      <Dropdown
        label="Call Type"
        value={callType}
        onChange={setCallType}
        options={callTypeOptions}
        editMode
      />

      <FormControls
        captureSubmitForm={createNewPrivateCall}
        cancelEdit={() => closeContextual()}
        editMode
      />
    </ContextualView>
  );
}
