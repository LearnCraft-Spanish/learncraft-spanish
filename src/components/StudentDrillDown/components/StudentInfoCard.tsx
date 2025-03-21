import type { Coach, Student } from 'src/types/CoachingTypes';
import React, { useEffect, useState } from 'react';
import pencil from 'src/assets/icons/pencil.svg';
import ContextualControls from 'src/components/ContextualControls';
import {
  Checkbox,
  CoachDropdown,
  Dropdown,
  FormControls,
  TextInput,
} from 'src/components/FormComponents';
import { toISODate } from 'src/functions/dateUtils';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDrillDown';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
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

export default function StudentInfoCard({
  student,
  currentCoach,
  isAdmin,
}: {
  student: Student;
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

        <BundleCreditsSection studentId={student.recordId} isAdmin={isAdmin} />
      </div>
    </>
  );
}

export function StudentInfoContextual({
  student,
  currentCoach,
  isAdmin,
}: {
  student: Student;
  currentCoach: Coach | undefined;
  isAdmin: boolean;
}) {
  const { updateStudentMutation } = useAllStudents();
  const { coachListQuery } = useCoachList();

  const { closeContextual } = useContextualMenu();

  const [data, setData] = useState<StudentFormData | undefined>(undefined);

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
        recordId: student.recordId,
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

  // if (!student) {
  //   return (
  //     <div>
  //       Error retrieving student information, please report this to support.
  //     </div>
  //   );
  // }

  if (student.primaryCoach?.email !== currentCoach?.user.email && !isAdmin) {
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
        </div>
      </div>
    )
  );
}
