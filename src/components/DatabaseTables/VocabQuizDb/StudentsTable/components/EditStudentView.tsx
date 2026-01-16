import type { EditableStudent, NewStudent } from '../types';
import { Dropdown } from '@interface/components/FormComponents';
import { useMemo, useState } from 'react';
import {
  FormControls,
  GenericDropdown,
  TextInput,
} from 'src/components/FormComponents';
import verifyRequiredInputs from 'src/components/FormComponents/functions/inputValidation';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import useStudentsTable from 'src/hooks/VocabQuizDbData/useStudentsTable';
export default function StudentRecordView({
  student,
  onUpdate,
  createMode,
}: {
  student: EditableStudent | NewStudent;
  onUpdate: (student: EditableStudent | NewStudent) => void;
  createMode?: boolean;
}) {
  const { closeContextual } = useContextualMenu();
  const { cohortFieldOptionsQuery, programTableQuery } = useStudentsTable();
  const [editObject, setEditObject] = useState<EditableStudent | NewStudent>(
    student,
  );
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();

  const captureSubmitForm = () => {
    const requiredInputs = [
      { value: editObject.name, label: 'Name' },
      { value: editObject.emailAddress, label: 'Email' },
      { value: editObject.program, label: 'Program' },
      { value: editObject.cohort, label: 'Cohort' },
      { value: editObject.relatedProgram.toString(), label: 'Related Program' },
    ];
    const error = verifyRequiredInputs(requiredInputs);
    if (error) {
      openModal({
        title: 'Error',
        body: `${error} is a required field. Please fill it out before submitting.`,
        type: 'error',
      });
      return;
    }
    onUpdate(editObject);
    setEditMode(false);
  };

  const cancelEdit = () => {
    if (!createMode) {
      setEditMode(false);
    } else {
      closeContextual();
    }
  };

  const programOptions = useMemo(() => {
    return programTableQuery.data?.map((program) => ({
      value: program.recordId.toString(),
      text: program.name,
    }));
  }, [programTableQuery.data]);

  const selectedProgram = useMemo(() => {
    // Foreign Key lookup, form data in backend?
    return programOptions?.find(
      (program) => program.value === editObject.relatedProgram.toString(),
    );
  }, [programOptions, editObject.relatedProgram]);
  return (
    <ContextualView
      editFunction={!createMode ? () => setEditMode(!editMode) : undefined}
    >
      <h3>{createMode ? 'Create Student' : 'Edit Student'}</h3>
      <TextInput
        label="Name"
        value={editObject.name}
        onChange={(value) => setEditObject({ ...editObject, name: value })}
        editMode={editMode}
        required
      />
      <TextInput
        label="Email"
        value={editObject.emailAddress}
        onChange={(value) =>
          setEditObject({ ...editObject, emailAddress: value })
        }
        editMode={editMode}
        required
      />
      <Dropdown
        label="Program"
        options={['LCSP', 'SI1M']}
        value={editObject.program}
        onChange={(value) =>
          setEditObject({ ...editObject, program: value as 'LCSP' | 'SI1M' })
        }
        editMode={editMode}
        required
      />
      <GenericDropdown
        label="Related Program"
        options={programOptions || []}
        selectedValue={selectedProgram?.value || ''}
        onChange={(value: string) =>
          setEditObject({
            ...editObject,
            relatedProgram: value === '' ? '' : Number(value),
          })
        }
        editMode={editMode}
        required
      />
      <Dropdown
        label="Cohort"
        options={cohortFieldOptionsQuery.data || []}
        value={editObject.cohort}
        onChange={(value) => setEditObject({ ...editObject, cohort: value })}
        editMode={editMode}
        required
      />
      <Dropdown
        label="Role"
        options={['limited', 'student', 'none']}
        value={editObject.role}
        onChange={(value) =>
          setEditObject({
            ...editObject,
            role: value as 'limited' | 'student' | 'none' | '',
          })
        }
        editMode={editMode}
      />
      {editMode && (
        <FormControls
          editMode={editMode}
          cancelEdit={cancelEdit}
          captureSubmitForm={captureSubmitForm}
        />
      )}
    </ContextualView>
  );
}

export function CreateStudent() {
  const { createStudentMutation } = useStudentsTable();

  const handleCreate = (student: NewStudent) => {
    createStudentMutation.mutate(student);
  };
  return (
    <StudentRecordView
      student={{
        name: '',
        emailAddress: '',
        cohort: '',
        role: '',
        relatedProgram: 0,
        program: '',
      }}
      onUpdate={handleCreate}
      createMode
    />
  );
}

export function EditStudent({ student }: { student: EditableStudent }) {
  const { updateStudentMutation } = useStudentsTable();
  function handleUpdate(student: EditableStudent | NewStudent) {
    if (!('recordId' in student)) {
      throw new Error('Student is not editable');
    }
    updateStudentMutation.mutate(student);
  }

  return <StudentRecordView student={student} onUpdate={handleUpdate} />;
}
