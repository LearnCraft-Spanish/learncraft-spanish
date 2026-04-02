import type { CourseDetailed } from '@learncraft-spanish/shared';
import { Loading } from '@interface/components/Loading';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Table from 'src/components/Table';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import BackButton from '../../general/BackButton';

import { EditProgramView, FilterProgramsTable } from './components';
import { headers } from './constants';
import { filterFunction, renderProgramRow, sortFunction } from './functions';
import useProgramsTable from './useProgramsTable';
import './ProgramsTable.scss';

export default function ProgramsTable() {
  const {
    programToEdit,
    programsTableQuery,
    tableEditMode,
    setTableEditMode,
    updateCourses,
    states: { isLoading, isError, isSuccess },
  } = useProgramsTable();
  const { openModal, closeModal } = useModal();

  const [activeData, setActiveData] = useState<CourseDetailed[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (programsTableQuery.data) {
      setActiveData(programsTableQuery.data);
      setHasUnsavedChanges(false);
    }
  }, [programsTableQuery.data]);

  const updateProgramInActiveData = useCallback(
    (updatedProgram: CourseDetailed) => {
      setActiveData((prevData) => {
        const newData = prevData.map((program) =>
          program.id === updatedProgram.id ? updatedProgram : program,
        );
        setHasUnsavedChanges(true);
        return newData;
      });
    },
    [],
  );

  const programHasChanged = useCallback(
    (program: CourseDetailed) => {
      const original = programsTableQuery.data?.find(
        (p) => p.id === program.id,
      );

      if (!original) return false;

      const cohorts = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      for (const cohort of cohorts) {
        const field = `cohort${cohort}CurrentLesson` as keyof CourseDetailed;
        if (program[field] !== original[field]) return true;
      }
      return program.published !== original.published;
    },
    [programsTableQuery.data],
  );

  const handleApplyChanges = useCallback(async () => {
    const changedPrograms = activeData.filter(programHasChanged);

    if (changedPrograms.length === 0) {
      toast.info('No changes to apply');
      return;
    }

    try {
      await updateCourses(changedPrograms);
    } catch {
      return;
    }
    setHasUnsavedChanges(false);
  }, [activeData, programHasChanged, updateCourses]);

  const handleDisableEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      openModal({
        title: 'Unsaved Changes',
        body: 'You have unsaved changes. Are you sure you want to disable edit mode? All changes will be lost.',
        type: 'confirm',
        confirmFunction: () => {
          setTableEditMode(false);
          setActiveData(programsTableQuery.data || []);
          setHasUnsavedChanges(false);
          closeModal();
        },
      });
    } else {
      setTableEditMode(false);
    }
  }, [
    hasUnsavedChanges,
    openModal,
    setTableEditMode,
    programsTableQuery.data,
    closeModal,
  ]);

  const displayHeaders = tableEditMode
    ? headers.filter((header) => header.header !== 'Edit Record')
    : headers;

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Program Data..." />}
      {isError && (
        <div className="error-message">Error Loading Program Data</div>
      )}
      {isSuccess && (
        <>
          {tableEditMode ? <h2>Edit Programs</h2> : <h2>Programs Table</h2>}

          <div className="editModeToggle">
            {tableEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  className="greenButton"
                  disabled={!hasUnsavedChanges}
                >
                  Apply Changes
                </button>
                <button type="button" onClick={handleDisableEditMode}>
                  Disable Edit Mode
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setTableEditMode(true)}>
                Enable Edit Mode
              </button>
            )}
          </div>

          <Table
            headers={displayHeaders}
            data={tableEditMode ? activeData : (programsTableQuery.data ?? [])}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={!tableEditMode ? FilterProgramsTable : undefined}
            renderRow={(program) =>
              renderProgramRow(
                program,
                tableEditMode,
                updateProgramInActiveData,
              )
            }
          />
          {programToEdit && (
            <EditProgramView
              program={programToEdit}
              onUpdate={(course) => updateCourses([course])}
            />
          )}
        </>
      )}
    </div>
  );
}
