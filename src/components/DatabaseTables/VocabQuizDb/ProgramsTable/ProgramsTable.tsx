import type { Program } from 'src/types/interfaceDefinitions';
import type { EditableProgram } from './types';
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
    updateManyProgramsMutation,
    states: { isLoading, isError, isSuccess },
  } = useProgramsTable();
  const { openModal, closeModal } = useModal();

  const [activeData, setActiveData] = useState<Program[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize activeData when data is loaded
  useEffect(() => {
    if (programsTableQuery.data) {
      setActiveData(programsTableQuery.data);
      setHasUnsavedChanges(false);
    }
  }, [programsTableQuery.data]);

  // Function to update a program in the activeData
  const updateProgramInActiveData = useCallback((updatedProgram: Program) => {
    setActiveData((prevData) => {
      const newData = prevData.map((program) =>
        program.recordId === updatedProgram.recordId ? updatedProgram : program,
      );
      setHasUnsavedChanges(true);
      return newData;
    });
  }, []);

  // Function to check if a program has changed
  const programHasChanged = useCallback(
    (program: Program) => {
      const originalProgram = programsTableQuery.data?.find(
        (p) => p.recordId === program.recordId,
      );

      if (!originalProgram) return false;

      // Compare each cohort's current lesson
      for (let i = 0; i < 10; i++) {
        const cohort = String.fromCharCode(65 + i); // 'A' to 'J'
        const field = `cohort${cohort}CurrentLesson` as keyof Program;

        if (program[field] !== originalProgram[field]) {
          return true;
        }
      }
      if (program.published !== originalProgram.published) {
        return true;
      }

      return false;
    },
    [programsTableQuery.data],
  );

  // Apply changes function for bulk edit
  const handleApplyChanges = useCallback(() => {
    // Find changed programs
    const changedPrograms = activeData.filter(programHasChanged);

    if (changedPrograms.length === 0) {
      toast.info('No changes to apply');
      return;
    }

    // Convert to EditableProgram format (remove lessons property)
    const programsToUpdate: EditableProgram[] = changedPrograms.map(
      ({ lessons, ...rest }) => rest,
    );

    // Update programs
    updateManyProgramsMutation.mutate(programsToUpdate, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        programsTableQuery.refetch();
      },
    });
  }, [
    activeData,
    programHasChanged,
    updateManyProgramsMutation,
    programsTableQuery,
  ]);

  // Handle disabling edit mode
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

  // Modify headers for edit mode
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
          {programToEdit && <EditProgramView program={programToEdit} />}
        </>
      )}
    </div>
  );
}
