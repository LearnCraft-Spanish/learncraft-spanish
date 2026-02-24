import type { Lesson } from 'src/types/DatabaseTables';
import type { LessonObjForUpdate, NewLesson } from '../types';
import { TextInput } from '@interface/components/FormComponents';
import React, { useState } from 'react';
import { Checkbox, FormControls } from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import useVqdLessonsTable from '../useVqdLessonsTable';

interface LessonViewProps {
  lesson: Lesson | NewLesson;
  onAction: (lesson: LessonObjForUpdate | NewLesson) => void;
  createMode?: boolean;
}

export function LessonView({ lesson, onAction, createMode }: LessonViewProps) {
  const { closeContextual } = useContextualMenu();
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();

  const [lessonName, setLessonName] = useState<string>(lesson.lesson);
  const [lessonNumber, setLessonNumber] = useState<number>(lesson.lessonNumber);
  const [subtitle, setSubtitle] = useState<string>(lesson.subtitle);
  const [published, setPublished] = useState<boolean>(lesson.published);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!lessonName.trim()) {
        openModal({
          title: 'Error',
          body: 'Lesson name is required',
          type: 'error',
        });
        return;
      }

      if (!lessonNumber || lessonNumber <= 0) {
        openModal({
          title: 'Error',
          body: 'Lesson number is required and must be greater than 0',
          type: 'error',
        });
        return;
      }

      if (createMode) {
        const newLesson: NewLesson = {
          lesson: lessonName.trim(),
          lessonNumber,
          subtitle: subtitle.trim(),
          published,
        };
        onAction(newLesson);
      } else {
        const updatedLesson: LessonObjForUpdate = {
          lesson: lessonName.trim(),
          lessonNumber,
          subtitle: subtitle.trim(),
          published,
          recordId: (lesson as Lesson).recordId,
        };
        onAction(updatedLesson);
      }
    } catch (error) {
      console.error('Error submitting lesson:', error);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    closeContextual();
  };

  const fullLesson = lesson as Lesson;

  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <h3>{createMode ? 'Create Lesson' : 'Edit Lesson'}</h3>
      <form>
        {!createMode && (
          <div className="lineWrapper">
            <p className="label">Record ID</p>
            <p className="content">{fullLesson.recordId}</p>
          </div>
        )}

        <TextInput
          label="Lesson"
          value={lessonName}
          onChange={setLessonName}
          editMode={editMode}
          required
        />

        <TextInput
          label="Lesson Number"
          value={lessonNumber.toString()}
          onChange={(value) => setLessonNumber(Number(value))}
          editMode={editMode}
          required
        />

        <TextInput
          label="Subtitle"
          value={subtitle}
          onChange={setSubtitle}
          editMode={editMode}
        />

        {!createMode && (
          <>
            <div className="lineWrapper">
              <p className="label">Related Program</p>
              <p className="content">{fullLesson.relatedProgram}</p>
            </div>

            <div className="lineWrapper">
              <p className="label">Program Name</p>
              <p className="content">{fullLesson.programName}</p>
            </div>
          </>
        )}

        {editMode ? (
          <Checkbox
            labelText="Published"
            labelFor="published"
            value={published}
            onChange={setPublished}
          />
        ) : (
          <div className="lineWrapper">
            <p className="label">Published</p>
            <p className="content">{published ? 'Yes' : 'No'}</p>
          </div>
        )}

        <FormControls
          editMode={editMode}
          cancelEdit={cancelEdit}
          captureSubmitForm={handleSubmit}
        />
      </form>
    </ContextualView>
  );
}

export function EditLesson({ lesson }: { lesson: Lesson }) {
  const { updateLessonMutation } = useVqdLessonsTable();

  const onAction = (updatedLesson: LessonObjForUpdate | NewLesson) => {
    updateLessonMutation.mutate(updatedLesson as LessonObjForUpdate);
  };

  return <LessonView lesson={lesson} onAction={onAction} />;
}

export function CreateLesson() {
  const { createLessonMutation } = useVqdLessonsTable();

  const onAction = (newLesson: LessonObjForUpdate | NewLesson) => {
    createLessonMutation.mutate(newLesson as NewLesson);
  };

  const emptyLesson: NewLesson = {
    lesson: '',
    lessonNumber: 1,
    subtitle: '',
    published: false,
  };

  return <LessonView lesson={emptyLesson} onAction={onAction} createMode />;
}
