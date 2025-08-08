import type { ReactNode } from 'react';
import type { Program } from 'src/types/interfaceDefinitions';
import type { CohortField, CohortLetter } from '../types';
import pencilIcon from 'src/assets/icons/pencil.svg';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { cohorts } from '../constants';

interface ProgramTableRowProps {
  program: Program;
  tableEditMode?: boolean;
  updateProgramInActiveData?: (updatedProgram: Program) => void;
}

export default function ProgramTableRow({
  program,
  tableEditMode = false,
  updateProgramInActiveData,
}: ProgramTableRowProps): ReactNode {
  const { openContextual } = useContextualMenu();
  const { name, recordId } = program;

  const handleCohortLessonChange = (cohort: CohortLetter, value: string) => {
    if (!updateProgramInActiveData) return;

    const numValue = value === '' ? 0 : Number.parseInt(value, 10);
    const field: CohortField = `cohort${cohort}CurrentLesson`;

    updateProgramInActiveData({
      ...program,
      [field]: numValue,
    });
  };

  return (
    <tr>
      {!tableEditMode && (
        <td
          className="edit-icon-cell"
          onClick={() => openContextual(`edit-program-${recordId}`)}
        >
          <div className="edit-icon-container">
            <img src={pencilIcon} alt="Edit" className="edit-icon" />
          </div>
        </td>
      )}
      <td style={{ whiteSpace: 'nowrap' }}>{name}</td>
      {cohorts.map((cohort) => (
        <td key={`cohort-${cohort}`}>
          {tableEditMode ? (
            <input
              value={program[
                `cohort${cohort}CurrentLesson` as CohortField
              ].toString()}
              onChange={(e) => handleCohortLessonChange(cohort, e.target.value)}
              className="edit-input"
            />
          ) : (
            program[`cohort${cohort}CurrentLesson` as CohortField]
          )}
        </td>
      ))}
    </tr>
  );
}
