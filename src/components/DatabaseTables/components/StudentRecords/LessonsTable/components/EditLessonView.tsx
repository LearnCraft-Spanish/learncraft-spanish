import type { Lesson } from 'src/types/CoachingTypes';
import type { EditableLesson, NewLesson } from '../types';
import { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import {
  Dropdown,
  FormControls,
  TextInput,
} from 'src/components/FormComponents';
import verifyRequiredInputs from 'src/components/FormComponents/functions/inputValidation';
import useLessonsTable from 'src/hooks/StudentRecordsData/useLessonsTable';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import './EditLessonView.scss';

export default function EditLessonView({
  lesson,
  onUpdate,
  createMode,
}: {
  lesson: Lesson | NewLesson;
  onUpdate: (lesson: Lesson | NewLesson) => void;
  createMode?: boolean;
}) {
  const [editObject, setEditObject] = useState<Lesson | NewLesson>(lesson);
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();
  const { closeContextual } = useContextualMenu();

  const captureSubmitForm = () => {
    const requiredInputs = [
      { value: editObject.lessonName, label: 'Lesson Name' },
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

    // Start with required fields
    const updatedLesson: any = {
      lessonName: editObject.lessonName,
    };

    // Include recordId for existing lessons (when in edit mode)
    if ('recordId' in editObject) {
      updatedLesson.recordId = editObject.recordId;
    }

    // Only include non-null weekRef
    if (editObject.weekRef !== null && editObject.weekRef !== 0) {
      updatedLesson.weekRef = editObject.weekRef;
    }

    updatedLesson.type = editObject.type;

    onUpdate(updatedLesson as Lesson | NewLesson);
    setEditMode(false);
  };

  const cancelEdit = () => {
    if (!createMode) {
      setEditMode(false);
    } else {
      closeContextual();
    }
  };

  return (
    <ContextualView
      editFunction={!createMode ? () => setEditMode(!editMode) : undefined}
    >
      <h3>{createMode ? 'Create Lesson' : 'Edit Lesson'}</h3>
      <div className="edit-lesson-form">
        <TextInput
          label="Lesson Name"
          value={editObject.lessonName}
          onChange={(value) =>
            setEditObject({ ...editObject, lessonName: value })
          }
          editMode={editMode}
        />
        <TextInput
          label="Week Ref"
          value={editObject.weekRef?.toString() ?? ''}
          onChange={(value) =>
            setEditObject({
              ...editObject,
              weekRef: Number.isNaN(Number(value)) ? null : Number(value),
            })
          }
          editMode={editMode}
        />
        <Dropdown
          label="Type"
          value={editObject.type}
          onChange={(value: string) =>
            setEditObject({ ...editObject, type: value })
          }
          options={['LCSP', '1MC/2MC', 'ACCSP', 'COMPREHENSION', 'ADVANCED']}
          editMode={editMode}
        />
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

export function EditLesson({ lesson }: { lesson: Lesson }) {
  const { updateLessonMutation } = useLessonsTable();

  function handleUpdate(updatedLesson: Lesson | NewLesson) {
    if ('recordId' in updatedLesson) {
      updateLessonMutation.mutate(updatedLesson as EditableLesson);
    }
  }

  return <EditLessonView lesson={lesson} onUpdate={handleUpdate} />;
}

export function CreateLesson() {
  const { createLessonMutation } = useLessonsTable();

  const handleCreate = (lesson: NewLesson) => {
    createLessonMutation.mutate(lesson);
  };

  return (
    <EditLessonView
      lesson={{
        lessonName: '',
        weekRef: null,
        type: '',
      }}
      onUpdate={handleCreate}
      createMode
    />
  );
}
