import DataDisplay from '@interface/components/CoachStudentDrillDown/DataDisplay';
import { useState } from 'react';
export default function CoachStudentDrillDown({
  studentId,
}: {
  studentId: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide Previous Coaches' : 'Show Previous Coaches'}
      </button>
      {isOpen && <DataDisplay studentId={studentId} />}
    </>
  );
}
