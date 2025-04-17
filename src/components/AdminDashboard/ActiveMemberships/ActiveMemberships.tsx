// import type { Membership } from 'src/types/CoachingTypes';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
// import ContextualView from 'src/components/Contextual/ContextualView';
import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';
// import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function ActiveMemberships() {
  const { activeMembershipsReportQuery } = useActiveMembershipsReport();
  // const { contextual } = useContextualMenu();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Course - Name', 'Number of Memberships'];

  return (
    <div>
      <SectionHeader
        title="Active Memberships"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={activeMembershipsReportQuery.data ?? []}
          renderRow={RenderRowForReport}
        />
      )}
      {/* 
      {contextual.startsWith('active-memberships-by-course-') && (
        <ActiveMembershipsByCourse
          courseName={contextual.split('active-memberships-by-course-')[1]}
        />
      )} */}
    </div>
  );
}
function RenderRowForReport({
  'Course - Name': courseName,
  'Number of Memberships': numberOfMemberships,
}: {
  'Course - Name': string;
  'Number of Memberships': number;
}) {
  // const { openContextual } = useContextualMenu();
  return (
    <tr>
      <td
      // onClick={() =>
      //   openContextual(`active-memberships-by-course-${row['Course - Name']}`)
      // }
      >
        {courseName}
      </td>
      <td>{numberOfMemberships}</td>
    </tr>
  );
}

// function renderRow(row: Membership) {
//   return (
//     <tr>
//       <td>{row.student}</td>
//       <td>{row.studentEmail}</td>
//       <td>{row.courseName}</td>
//       <td>{row.primaryCoach.name}</td>
//       <td>{row.active ? 'Yes' : 'No'}</td>
//       <td>{row.onHold ? 'Yes' : 'No'}</td>
//       <td>{row.studentCallCreditsRemaining}</td>
//       <td>{row.weeklyPrivateCalls}</td>
//       <td>{row.hasGroupCalls}</td>
//       <td>{row.mostRecentLesson}</td>
//       <td>{row.startDate}</td>
//       <td>{row.endDate}</td>
//       <td>{row.coachCoachesDuringMembership}</td>
//       <td>{row.weeklyTimeCommitmentCalculationHours}</td>
//     </tr>
//   );
// }

// function ActiveMembershipsByCourse({ courseName }: { courseName: string }) {
//   const { activeMembershipsReportByCourseQuery } =
//     useActiveMembershipsReportByCourse(courseName);
//   const headers = [
//     'Student',
//     'Student - Email',
//     'Course - Name',
//     'Primary Coach',
//     'Active?',
//     'On Hold',
//     'Student - Call Credits Remaining',
//     'Course - Weekly Private Calls',
//     'Course - Has Group Calls',
//     'Most Recent Lesson',
//     'Start Date',
//     'End Date',
//     'Coach/Coaches (During Membership)',
//     'Weekly Time Commitment (Calculation) (hours)',
//   ];

//   return activeMembershipsReportByCourseQuery.data &&
//     activeMembershipsReportByCourseQuery.data.length > 0 ? (
//     <div>
//       <ContextualView>
//         <DisplayOnlyTable
//           headers={headers}
//           data={activeMembershipsReportByCourseQuery.data ?? []}
//           renderRow={renderRow}
//         />
//       </ContextualView>
//     </div>
//   ) : (
//     <div>No data found</div>
//   );
// }
