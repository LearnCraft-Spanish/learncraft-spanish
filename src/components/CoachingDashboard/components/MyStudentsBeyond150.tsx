import { useState } from 'react';
import useStudentsBeyond150ByCoach from 'src/hooks/AdminData/useStudentsBeyond150ByCoach';
import DisplayOnlyTable from './RecentRecords/DisplayOnlyTable';
import SectionHeader from './SectionHeader';

const headers = [
  'Student',
  'Student Email',
  'Most Recent Lesson',
  'Active',
  'On Hold',
];
function renderRow(row: any) {
  return (
    <tr key={row.id}>
      <td>{row.student}</td>
      <td>{row.studentEmail}</td>
      <td>{row.mostRecentLesson.length ? row.mostRecentLesson[0] : ''}</td>
      <td>{row.active ? 'Yes' : 'No'}</td>
      <td>{row.onHold ? 'Yes' : 'No'}</td>
    </tr>
  );
}
function MyStudentsBeyond150({ coachId }: { coachId: number }) {
  const { studentsBeyond150ByCoachQuery } =
    useStudentsBeyond150ByCoach(coachId);

  const isLoading = studentsBeyond150ByCoachQuery.isLoading;
  const isError = studentsBeyond150ByCoachQuery.isError;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {studentsBeyond150ByCoachQuery.error.message}</div>;
  }
  if (studentsBeyond150ByCoachQuery.data.length === 0) {
    return <div>No students beyond lesson 150</div>;
  }

  return (
    <div>
      <DisplayOnlyTable
        headers={headers}
        data={studentsBeyond150ByCoachQuery.data}
        renderRow={renderRow}
      />
    </div>
  );
}

export default function MyStudentsBeyond150Wrapper({
  coachId,
}: {
  coachId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openFunctionWrapper = (_title: string) => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <SectionHeader
        title="My Students Beyond Lesson 150"
        isOpen={isOpen}
        openFunction={openFunctionWrapper}
      />
      {isOpen && <MyStudentsBeyond150 coachId={coachId} />}
    </div>
  );
}
