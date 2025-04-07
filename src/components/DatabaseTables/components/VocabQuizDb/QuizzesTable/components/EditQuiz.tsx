import type { Quiz } from 'src/types/interfaceDefinitions';
import React, { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import { FormControls, TextInput } from 'src/components/FormComponents';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useQuizTable from '../useQuizTable';
interface EditQuizProps {
  quiz: Quiz;
  onCancel?: () => void;
}

export default function EditQuiz({ quiz }: EditQuizProps) {
  const { handleUpdateQuiz } = useQuizTable();
  const { closeContextual } = useContextualMenu();
  const [quizNickname, setQuizNickname] = useState(quiz.quizNickname);
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async () => {
    try {
      // Create updated quiz object
      const updatedQuiz: Quiz = {
        ...quiz,
        quizNickname,
      };

      // Call the handler from the hook
      handleUpdateQuiz(updatedQuiz);
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    closeContextual();
  };

  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <h3>Edit Quiz</h3>
      <form>
        <TextInput
          label="Quiz Nickname"
          value={quizNickname}
          onChange={(value) => setQuizNickname(value)}
          editMode={editMode}
        />

        <FormControls
          editMode={editMode}
          cancelEdit={cancelEdit}
          captureSubmitForm={handleSubmit}
        />
      </form>
    </ContextualView>
  );
}
