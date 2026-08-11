import type { LeadsToReEngage as LeadsToReEngageData } from '@learncraft-spanish/shared';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SubSectionHeader from 'src/components/CoachingDashboard/components/SubSectionHeader';

type Student = LeadsToReEngageData['students'][number];

function studentCountString(studentCount: number): string {
  return `${studentCount} student${studentCount === 1 ? '' : 's'} to re-engage`;
}

function formatMembershipEndDate(
  lastMembershipEndDate: Student['lastMembershipEndDate'],
  onHold: boolean,
): string {
  if (onHold) {
    return 'On Hold';
  }
  return new Date(lastMembershipEndDate).toLocaleDateString();
}

function renderStudentRow(student: Student) {
  const { lastMembershipName, lastMembershipEndDate, onHold } = student;
  return (
    <tr key={student.student_id}>
      <td>{student.fullName}</td>
      <td>{student.email}</td>
      <td>{lastMembershipName}</td>
      <td>{formatMembershipEndDate(lastMembershipEndDate, onHold)}</td>
    </tr>
  );
}

export default function LeadsToReEngageCoachSection({
  coachReport,
  isOpen,
  toggleOpen,
}: {
  coachReport: LeadsToReEngageData;
  isOpen: boolean;
  toggleOpen: () => void;
}) {
  const { coach, students } = coachReport;

  return (
    <div className="leadsToReEngage__coachSection">
      <SubSectionHeader
        title={coach.fullName}
        recordCountString={studentCountString(students.length)}
        isOpen={isOpen}
        openFunction={toggleOpen}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={['Name', 'Email', 'Last Membership', 'Membership Ended']}
          data={students}
          renderRow={renderStudentRow}
        />
      )}
    </div>
  );
}
