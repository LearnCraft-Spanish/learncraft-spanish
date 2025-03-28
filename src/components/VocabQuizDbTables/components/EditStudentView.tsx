import type { FlashcardStudent } from 'src/types/interfaceDefinitions';
import { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import { Dropdown, TextInput } from 'src/components/FormComponents';

export default function EditStudentView({
  student,
}: {
  student: FlashcardStudent | undefined;
}) {
  if (!student) {
    return <div>Student not found</div>;
  }
  const [editObject, setEditObject] = useState<FlashcardStudent>(student);
  const [editMode, setEditMode] = useState(false);
  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <div>Edit Student View</div>
      <TextInput
        label="Name"
        value={editObject.name}
        onChange={(value) => setEditObject({ ...editObject, name: value })}
        editMode={editMode}
      />
      <TextInput
        label="Email"
        value={editObject.emailAddress}
        onChange={(value) =>
          setEditObject({ ...editObject, emailAddress: value })
        }
        editMode={editMode}
      />
      <Dropdown
        label="Cohort"
        options={[]}
        value={editObject.cohort}
        onChange={(value) => setEditObject({ ...editObject, cohort: value })}
        editMode={editMode}
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
    </ContextualView>
  );
}
