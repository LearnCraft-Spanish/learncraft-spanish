import type { StudentDraft } from 'src/hexagon/domain/student';
import type { EditableStudent, NewStudent, Student } from '../types';
import {
  Dropdown,
  GenericDropdown,
  TextInput,
} from '@interface/components/FormComponents';
import { cohortLetterSchema } from '@learncraft-spanish/shared';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FormControls } from 'src/components/FormComponents';

import verifyRequiredInputs from 'src/components/FormComponents/functions/inputValidation';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import useStudentsTable from '../useStudentsTable';

const cohortOptions = cohortLetterSchema.options;

function studentToStudentDraft(student: Student): StudentDraft {
  return {
    recordId: student.recordId,
    name: student.name,
    emailAddress: student.emailAddress,
    role: student.role,
    cohort: student.cohort,
    program: student.program,
    relatedProgram: student.relatedProgram,
  };
}

function draftToEditableStudent(draft: StudentDraft): EditableStudent | null {
  if (
    !draft.recordId ||
    !draft.cohort ||
    !draft.program ||
    draft.relatedProgram === ''
  ) {
    return null;
  }
  return {
    recordId: draft.recordId,
    name: draft.name,
    emailAddress: draft.emailAddress,
    role: draft.role,
    cohort: draft.cohort,
    program: draft.program,
    relatedProgram: draft.relatedProgram,
  };
}

function draftToNewStudent(draft: StudentDraft): NewStudent | null {
  if (!draft.cohort || !draft.program || draft.relatedProgram === '') {
    return null;
  }
  return {
    name: draft.name,
    emailAddress: draft.emailAddress,
    role: draft.role,
    cohort: draft.cohort,
    program: draft.program,
    relatedProgram: draft.relatedProgram,
  };
}

export default function StudentRecordView({
  draft,
  onUpdate,
  createMode,
}: {
  draft: StudentDraft;
  onUpdate: (draft: StudentDraft) => void;
  createMode?: boolean;
}) {
  const { closeContextual } = useContextualMenu();
  const { programTableQuery } = useStudentsTable();
  const [editObject, setEditObject] = useState<StudentDraft>(draft);
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();

  const captureSubmitForm = () => {
    const requiredInputs = [
      { value: editObject.name, label: 'Name' },
      { value: editObject.emailAddress, label: 'Email' },
      { value: editObject.program, label: 'Program' },
      { value: editObject.cohort, label: 'Cohort' },
      {
        value: editObject.relatedProgram.toString(),
        label: 'Related Program',
      },
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
      value: program.id.toString(),
      text: program.name,
    }));
  }, [programTableQuery.data]);

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
          setEditObject({
            ...editObject,
            program: value as 'LCSP' | 'SI1M' | '',
          })
        }
        editMode={editMode}
        required
      />
      <GenericDropdown
        label="Related Program"
        options={programOptions || []}
        selectedValue={editObject.relatedProgram.toString()}
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
        options={cohortOptions}
        value={editObject.cohort}
        onChange={(value) =>
          setEditObject({
            ...editObject,
            cohort: value as typeof editObject.cohort,
          })
        }
        editMode={editMode}
        required
      />
      <Dropdown
        label="Role"
        options={['limited', 'student', 'none']}
        value={editObject.role ?? ''}
        onChange={(value) =>
          setEditObject({
            ...editObject,
            role:
              value === '' ? null : (value as 'limited' | 'student' | 'none'),
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
  const { createStudentMutation, programTableQuery } = useStudentsTable();
  const { closeContextual } = useContextualMenu();

  const handleCreate = (draft: StudentDraft) => {
    const newStudent = draftToNewStudent(draft);
    if (!newStudent) return;
    const promise = createStudentMutation.mutateAsync(newStudent);
    toast.promise(promise, {
      pending: 'Creating student...',
      success: 'Student created successfully!',
      error: 'Failed to create student',
    });
    promise.then(() => closeContextual()).catch(() => {});
  };

  if (!programTableQuery.isSuccess) return null;

  return (
    <StudentRecordView
      draft={{
        name: '',
        emailAddress: '',
        cohort: '',
        role: null,
        relatedProgram: '',
        program: '',
      }}
      onUpdate={handleCreate}
      createMode
    />
  );
}

export function EditStudent({ student }: { student: Student }) {
  const { updateStudentMutation } = useStudentsTable();

  function handleUpdate(draft: StudentDraft) {
    const editable = draftToEditableStudent(draft);
    if (!editable) return;
    const promise = updateStudentMutation.mutateAsync(editable);
    toast.promise(promise, {
      pending: 'Updating student...',
      success: 'Student updated successfully!',
      error: 'Failed to update student',
    });
  }

  return (
    <StudentRecordView
      draft={studentToStudentDraft(student)}
      onUpdate={handleUpdate}
    />
  );
}
