import type { Student } from 'src/types/CoachingTypes';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  CoachDropdown,
  Dropdown,
  FormControls,
  TextInput,
} from 'src/components/Coaching/general';
import ContextualControls from 'src/components/ContextualControls';
import { toISODate } from 'src/functions/dateUtils';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import { useAllStudents } from 'src/hooks/CoachingData/queries/useStudentDeepDive';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { BundleCreditsSection } from './BundleCreditsSection';
const timezones = [
  'AZ',
  'CT',
  'Eastern - US',
  'Central - US',
  'Pacific - US',
  'BST',
  'UK',
  'Mountain - US',
  'GMT + 1',
  'CET',
  'Western Australia',
  'Shanghai',
  'PR',
  'Sydney',
  'AEST',
  'New Zealand',
  'Central Australia',
  'Trinidad',
  'India',
  'Atlantic Standard',
  'Mexico City',
  'Colombia Standard Time',
  'GMT +8',
  'Central - MX',
  'GMT+0',
  'GMT-5',
  'Costa Rica',
  'PST',
  'other',
  'Peru',
  'Kuala Lumpur/Malaysia',
  'Kuwait',
  'Taiwan',
  'South Africa',
  'Saudi',
  'Jamaica - EST',
  'Alaska',
  'Ecuador',
  'Uruguay',
  'Pacific - MX',
  'AEDT',
  'Mountain - CA',
  'Paraguay',
  'AWST',
  'GTM + 4',
  'Eastern - Canada',
  'Argentina',
  'Hawaii',
  'Georgia',
  'Chile',
  'MST - Arizona',
];

// Create an interface that extends Student to include the primaryCoachEmail field for the form
interface StudentFormData extends Omit<Student, 'primaryCoach'> {
  primaryCoach: Student['primaryCoach'];
  primaryCoachEmail?: string;
}

export default function StudentInfoCard({ studentId }: { studentId: number }) {
  const { allStudentsQuery } = useAllStudents();
  const userDataQuery = useUserData();
  const student = useMemo(
    () =>
      allStudentsQuery.data?.find((s) => s.recordId === studentId) as
        | Student
        | undefined,
    [allStudentsQuery.data, studentId],
  );

  if (!student) {
    return (
      <div>
        Error retrieving student information, please report this to support.
      </div>
    );
  }

  return (
    <div className="student-info-card">
      <div className="info-row">
        <div className="info-label">Name:</div>
        <div className="info-value">{student.fullName}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Pronoun:</div>
        <div className="info-value">{student.pronoun}</div>
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
          {student.primaryCoach ? student.primaryCoach.name : 'Not assigned'}
        </div>
      </div>
      <div className="info-row">
        <div className="info-label">Advanced Student:</div>
        <div className="info-value">
          {student.advancedStudent ? 'Yes' : 'No'}
        </div>
      </div>
      {/* only show to users who are admins */}
      {userDataQuery.data?.roles.adminRole === 'admin' && (
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

      <BundleCreditsSection studentId={studentId} />
    </div>
  );
}

export function StudentInfoContextual({ studentId }: { studentId: number }) {
  const { allStudentsQuery, updateStudentMutation } = useAllStudents();
  const userDataQuery = useUserData();
  const { coachListQuery } = useCoachList();

  const { closeContextual } = useContextualMenu();

  const [data, setData] = useState<StudentFormData | undefined>(undefined);

  const student = useMemo(
    () =>
      allStudentsQuery.data?.find((s) => s.recordId === studentId) as
        | Student
        | undefined,
    [allStudentsQuery.data, studentId],
  );

  const currentUserAsQbUser = useMemo(() => {
    const possibleEmailDomains = [
      '@learncraftspanish.com',
      '@masterofmemory.com',
    ];

    if (userDataQuery.data?.emailAddress) {
      const currentUserCoach = coachListQuery.data?.find((coach) => {
        const emailPrefix = userDataQuery.data.emailAddress
          .split('@')[0]
          .toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coach.user.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
  }, [userDataQuery.data, coachListQuery.data]);

  function cancelEdit() {
    setData(student);
    closeContextual();
  }

  function captureSubmitForm() {
    // if data is undefined, return
    if (!data) return;
    // for each field, if it was previously defined, include it. if it was not defined, remove it
    let relatedCoach: number | string | undefined =
      student?.primaryCoach?.id || undefined;
    if (data.primaryCoachEmail) {
      const coach = coachListQuery.data?.find(
        (coach) => coach.user.email === data.primaryCoachEmail,
      );
      if (coach) {
        relatedCoach = coach.recordId;
      }
    }

    updateStudentMutation.mutate(
      {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        pronoun: data.pronoun || undefined,
        email: data.email || undefined,
        timeZone: data.timeZone || undefined,
        startingLevel: data.startingLevel || undefined,
        fluencyGoal: data.fluencyGoal || undefined,
        advancedStudent: data.advancedStudent || false,
        billingEmail: data.billingEmail || undefined,
        billingNotes: data.billingNotes || undefined,
        recordId: studentId,
        usPhone: data.usPhone || undefined,
        relatedCoach,
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
        primaryCoachEmail: student.primaryCoach?.email,
      });
    }
  }, [student]);

  if (!student) {
    return (
      <div>
        Error retrieving student information, please report this to support.
      </div>
    );
  }

  if (
    student.primaryCoach?.email !== currentUserAsQbUser?.user.email &&
    userDataQuery.data?.roles.adminRole !== 'admin'
  ) {
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
      <div className="contextualWrapper">
        <div className="contextual">
          <h3>Edit Student Information</h3>
          <ContextualControls />
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
          <Dropdown
            label="Pronoun"
            value={data.pronoun}
            onChange={(value) => {
              setData({ ...data, pronoun: value });
            }}
            options={['He', 'She', 'They', 'Other']}
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
            options={timezones}
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
            coachEmail={data.primaryCoachEmail || ''}
            onChange={(value: string) => {
              setData((prev) =>
                prev ? { ...prev, primaryCoachEmail: value } : undefined,
              );
            }}
            editMode
          />
          {/* checkbox for advancedStudent */}
          <Checkbox
            label="Advanced Student"
            value={data.advancedStudent}
            onChange={(value) => {
              setData({ ...data, advancedStudent: value });
            }}
          />
          {userDataQuery.data?.roles.adminRole === 'admin' && (
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
        </div>
      </div>
    )
  );
}
