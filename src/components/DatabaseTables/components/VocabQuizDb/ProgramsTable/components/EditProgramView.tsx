import type { Program } from 'src/types/interfaceDefinitions';
import type { CohortField, CohortLetter, EditableProgram } from '../types';
import { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import { FormControls, TextInput } from 'src/components/FormComponents';
import verifyRequiredInputs from 'src/components/FormComponents/functions/inputValidation';
import { useModal } from 'src/hooks/useModal';
import useProgramsTable from 'src/hooks/VocabQuizDbData/useProgramsTable';
import { cohorts } from '../constants';

export default function EditProgramView({ program }: { program: Program }) {
  const [editObject, setEditObject] = useState<Program>(program);
  const [editMode, setEditMode] = useState(false);
  const { openModal } = useModal();
  const { updateProgramMutation } = useProgramsTable();

  const captureSubmitForm = () => {
    const requiredInputs = [{ value: editObject.name, label: 'Name' }];
    const error = verifyRequiredInputs(requiredInputs);
    if (error) {
      openModal({
        title: 'Error',
        body: `${error} is a required field. Please fill it out before submitting.`,
        type: 'error',
      });
      return;
    }

    // Create a new object without the lessons property
    const { lessons, ...programWithoutLessons } = editObject;

    updateProgramMutation.mutate(programWithoutLessons as EditableProgram);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const handleCohortLessonChange = (cohort: CohortLetter, value: string) => {
    const numValue = value === '' ? 0 : Number.parseInt(value, 10);
    const field: CohortField = `cohort${cohort}CurrentLesson`;
    setEditObject((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <h3>Edit Program</h3>
      <div className="edit-program-form">
        <TextInput
          label="Name"
          value={editObject.name}
          onChange={(value) => setEditObject({ ...editObject, name: value })}
          editMode={false}
          required
        />
        <div>
          {cohorts.map((cohort) => (
            <TextInput
              key={cohort}
              label={`Cohort ${cohort} Current Lesson`}
              value={editObject[
                `cohort${cohort}CurrentLesson` as CohortField
              ].toString()}
              onChange={(value: string) =>
                handleCohortLessonChange(cohort, value)
              }
              editMode={editMode}
            />
          ))}
        </div>
        {editMode && (
          <FormControls
            editMode={editMode}
            cancelEdit={cancelEdit}
            captureSubmitForm={captureSubmitForm}
          />
        )}
      </div>
    </ContextualView>
  );
}
