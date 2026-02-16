import type { QuizGroup } from 'src/types/DatabaseTables';
import type { NewQuizGroup, QuizGroupObjForUpdate } from '../types';
import { TextInput } from '@interface/components/FormComponents';
import React, { useState } from 'react';
import { Checkbox, FormControls } from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import useQuizGroupsTable from '../useQuizGroupsTable';

interface QuizGroupViewProps {
  quizGroup: QuizGroup | NewQuizGroup;
  onAction: (quizGroup: QuizGroupObjForUpdate | NewQuizGroup) => void;
  createMode?: boolean;
}

export function QuizGroupView({
  quizGroup,
  onAction,
  createMode,
}: QuizGroupViewProps) {
  const { closeContextual } = useContextualMenu();
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();

  const [name, setName] = useState<string>(quizGroup.name);
  const [urlSlug, setUrlSlug] = useState<string>(quizGroup.urlSlug);
  const [published, setPublished] = useState<boolean>(quizGroup.published);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!name.trim()) {
        openModal({
          title: 'Error',
          body: 'Name is required',
          type: 'error',
        });
        return;
      }

      if (createMode && !urlSlug.trim()) {
        openModal({
          title: 'Error',
          body: 'URL Slug is required',
          type: 'error',
        });
        return;
      }

      if (createMode) {
        const newQuizGroup: NewQuizGroup = {
          name: name.trim(),
          urlSlug: urlSlug.trim(),
          published,
        };
        onAction(newQuizGroup);
      } else {
        const updatedQuizGroup: QuizGroupObjForUpdate = {
          name: name.trim(),
          published,
          recordId: (quizGroup as QuizGroup).recordId,
        };
        onAction(updatedQuizGroup);
      }
    } catch (error) {
      console.error('Error submitting quiz group:', error);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    closeContextual();
  };

  const fullQuizGroup = quizGroup as QuizGroup;

  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <h3>{createMode ? 'Create Quiz Group' : 'Edit Quiz Group'}</h3>
      <form>
        {!createMode && (
          <div className="lineWrapper">
            <p className="label">Record ID</p>
            <p className="content">{fullQuizGroup.recordId}</p>
          </div>
        )}

        <TextInput
          label="Name"
          value={name}
          onChange={setName}
          editMode={editMode}
          required
        />

        <TextInput
          label="URL Slug"
          value={urlSlug}
          onChange={setUrlSlug}
          editMode={createMode || false}
          required={createMode}
        />

        {!createMode && (
          <>
            <div className="lineWrapper">
              <p className="label">Related Program</p>
              <p className="content">{fullQuizGroup.relatedProgram}</p>
            </div>

            <div className="lineWrapper">
              <p className="label">Program Name</p>
              <p className="content">{fullQuizGroup.programName}</p>
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

export function EditQuizGroup({ quizGroup }: { quizGroup: QuizGroup }) {
  const { updateQuizGroupMutation } = useQuizGroupsTable();

  const onAction = (updatedQuizGroup: QuizGroupObjForUpdate | NewQuizGroup) => {
    updateQuizGroupMutation.mutate(updatedQuizGroup as QuizGroupObjForUpdate);
  };

  return <QuizGroupView quizGroup={quizGroup} onAction={onAction} />;
}

export function CreateQuizGroup() {
  const { createQuizGroupMutation } = useQuizGroupsTable();

  const onAction = (newQuizGroup: QuizGroupObjForUpdate | NewQuizGroup) => {
    createQuizGroupMutation.mutate(newQuizGroup as NewQuizGroup);
  };

  const emptyQuizGroup: NewQuizGroup = {
    name: '',
    urlSlug: '',
    published: false,
  };

  return (
    <QuizGroupView quizGroup={emptyQuizGroup} onAction={onAction} createMode />
  );
}
