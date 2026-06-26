import type { Coach, CoachingStudent } from '@learncraft-spanish/shared';
import { useAllTimeZonesQuery } from '@application/queries/CoachingStudentQueries/useAllTimeZonesQuery';
import { useUpdateCoachingStudentMutation } from '@application/queries/CoachingStudentQueries/useUpdateCoachingStudentMutation';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import CoachStudentDrillDown from '@interface/components/CoachStudentDrillDown/CoachStudentDrillDown';
import { Dropdown, TextInput } from '@interface/components/FormComponents';
import React, { useEffect, useMemo, useState } from 'react';
import pencil from 'src/assets/icons/pencil.svg';
import {
  Checkbox,
  CoachDropdown,
  FormControls,
} from 'src/components/FormComponents';
import { toISODate } from 'src/hexagon/domain/functions/dateUtils';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { BundleCreditsSection } from './BundleCreditsSection';

// Create an interface that extends CoachingStudent to include the primaryCoachEmail field for the form
interface StudentFormData extends Omit<CoachingStudent, 'primaryCoach'> {
  primaryCoach: CoachingStudent['primaryCoach'];
  primaryCoachId?: number;
}

export default function StudentInfoCard({
  student,
  currentCoach,
  isAdmin,
}: {
  student: CoachingStudent;
  currentCoach: Coach | undefined;
  isAdmin: boolean;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <>
      {contextual === 'edit-student' && (
        <StudentInfoContextual
          student={student}
          currentCoach={currentCoach}
          isAdmin={isAdmin}
        />
      )}
      <div className="edit-student">
        <img
          src={pencil}
          alt="Edit Student"
          onClick={() => openContextual('edit-student')}
        />
      </div>
      <h2>Student Details</h2>
      <div className="student-info-card">
        <div className="info-row">
          <div className="info-label">Name:</div>
          <div className="info-value">{student.fullName}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Learning Disabilities:</div>
          <div className="info-value">{student.learningDisabilities}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Email:</div>
          <div className="info-value">{student.email}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Fluency Goal:</div>
          <div className="info-value">{student.fluencyGoal}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Time Zone:</div>
          <div className="info-value">{student.timeZone}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Starting Level:</div>
          <div className="info-value">{student.startingLevel}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Primary Coach:</div>
          <div className="info-value">
            {student.primaryCoach
              ? student.primaryCoach.fullName
              : 'Not assigned'}
          </div>
        </div>
        <div className="info-row">
          <div className="info-label">Advanced Student:</div>
          <div className="info-value">
            {student.advancedStudent ? 'Yes' : 'No'}
          </div>
        </div>
        {/* only show to users who are admins */}
        {isAdmin && <CoachStudentDrillDown studentId={student.student_id} />}
        {isAdmin && (
          <>
            <h3>Billing Information</h3>
            <div className="info-row">
              <div className="info-label">Billing Email:</div>
              <div className="info-value">{student.billingEmail}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Billing Notes:</div>
              <div className="info-value">{student.billingNotes}</div>
            </div>
            <div className="info-row">
              <div className="info-label">First Subscribed:</div>
              <div className="info-value">
                {typeof student.firstSubscribed === 'string'
                  ? student.firstSubscribed
                  : toISODate(student.firstSubscribed)}
              </div>
            </div>
          </>
        )}

        <BundleCreditsSection
          studentId={student.student_id}
          isAdmin={isAdmin}
        />
      </div>
    </>
  );
}

export function StudentInfoContextual({
  student,
  currentCoach,
  isAdmin,
}: {
  student: CoachingStudent;
  currentCoach: Coach | undefined;
  isAdmin: boolean;
}) {
  const { updateCoachingStudentMutation } = useUpdateCoachingStudentMutation();
  const { allCoachesQuery } = useAllCoachesQuery();
  const { allTimeZonesQuery } = useAllTimeZonesQuery();

  const { closeContextual } = useContextualMenu();

  const [data, setData] = useState<StudentFormData | undefined>(undefined);

  const timeZoneOptions = useMemo(
    () => allTimeZonesQuery.data?.map((tz) => tz.timeZone) ?? [],
    [allTimeZonesQuery.data],
  );

  function cancelEdit() {
    setData(student);
    closeContextual();
  }

  function captureSubmitForm() {
    if (!data) return;

    let primaryCoach: number | undefined =
      student?.primaryCoach?.coach_id || undefined;
    if (data.primaryCoachId) {
      const coach = allCoachesQuery.data?.find(
        (coach) => coach.coach_id === data.primaryCoachId,
      );
      if (coach) {
        primaryCoach = coach.coach_id;
      }
    }

    const timeZoneId = allTimeZonesQuery.data?.find(
      (tz) => tz.timeZone === data.timeZone,
    )?.time_zone_id;

    updateCoachingStudentMutation.mutate(
      {
        student_id: student.student_id,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        learningDisabilities: data.learningDisabilities || '',
        email: data.email || undefined,
        timeZone: timeZoneId,
        startingLevel: data.startingLevel || undefined,
        fluencyGoal: data.fluencyGoal || undefined,
        advancedStudent: data.advancedStudent || false,
        billingEmail: data.billingEmail || undefined,
        billingNotes: data.billingNotes || undefined,
        usPhone: data.usPhone || undefined,
        primaryCoach,
      },
      {
        onSuccess: () => {
          closeContextual();
        },
      },
    );
  }

  useEffect(() => {
    if (student) {
      setData({
        ...student,
        primaryCoachId: student.primaryCoach?.coach_id,
      });
    }
  }, [student]);

  if (student.primaryCoach?.email !== currentCoach?.email && !isAdmin) {
    return (
      <div className="contextualWrapper">
        <div className="contextual">
          <h3>Unauthorized</h3>
          <p>Only the primary coach or an admin can edit this student.</p>
          <button onClick={closeContextual} className="redButton" type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    data && (
      <ContextualView>
        <h3>Edit Student Information</h3>
        <TextInput
          label="First Name"
          value={data.firstName}
          onChange={(value) => {
            setData({ ...data, firstName: value });
          }}
          editMode
        />
        <TextInput
          label="Last Name"
          value={data.lastName}
          onChange={(value) => {
            setData({ ...data, lastName: value });
          }}
          editMode
        />
        <TextInput
          label="Learning Disabilities"
          value={data.learningDisabilities}
          onChange={(value) => {
            setData({ ...data, learningDisabilities: value });
          }}
          editMode
        />
        <TextInput
          label="Email"
          value={data.email}
          onChange={(value) => {
            setData({ ...data, email: value });
          }}
          editMode
        />
        <Dropdown
          label="Time Zone"
          value={data.timeZone}
          onChange={(value) => {
            setData({ ...data, timeZone: value });
          }}
          options={timeZoneOptions}
          editMode
        />
        <TextInput
          label="Starting Level"
          value={data.startingLevel}
          onChange={(value) => {
            setData({ ...data, startingLevel: value });
          }}
          editMode
        />
        <TextInput
          label="Fluency Goal"
          value={data.fluencyGoal}
          onChange={(value) => {
            setData({ ...data, fluencyGoal: value });
          }}
          editMode
        />
        <CoachDropdown
          coachId={data.primaryCoachId || 0}
          onChange={(value: number) => {
            setData((prev) =>
              prev ? { ...prev, primaryCoachId: value } : undefined,
            );
          }}
          editMode
        />
        <Checkbox
          labelText="Advanced Student"
          labelFor="advancedStudent"
          value={data.advancedStudent}
          onChange={(value) => {
            setData({ ...data, advancedStudent: value });
          }}
        />
        {isAdmin && (
          <>
            <TextInput
              label="Billing Email"
              value={data.billingEmail}
              onChange={(value) => {
                setData({ ...data, billingEmail: value });
              }}
              editMode
            />
            <TextInput
              label="Billing Notes"
              value={data.billingNotes}
              onChange={(value) => {
                setData({ ...data, billingNotes: value });
              }}
              editMode
            />
          </>
        )}
        <FormControls
          editMode
          cancelEdit={cancelEdit}
          captureSubmitForm={captureSubmitForm}
        />
      </ContextualView>
    )
  );
}
