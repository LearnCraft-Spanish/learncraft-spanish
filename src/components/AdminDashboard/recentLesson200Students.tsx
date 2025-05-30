import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useRecentLesson200Students from 'src/hooks/AdminData/useRecentLesson200Students';

function renderRow(row: any) {
  return (
    <tr key={row.id}>
      <td>{row.student}</td>
      <td>{row.level}</td>
      <td>{row.primaryCoach.name}</td>
      <td>{row.currentLessonName}</td>
    </tr>
  );
}
export default function RecentLesson200Students() {
  const { recentLesson200StudentsQuery } = useRecentLesson200Students();

  const { data: recentLesson200Students } = recentLesson200StudentsQuery;

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Student', 'Level', 'Primary Coach', 'Current Lesson'];

  return (
    <div>
      <SectionHeader
        title="Recent Lesson 200 Students"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={recentLesson200Students}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
