import type { NewQuiz } from '../types';
import React, { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import FormControls from 'src/components/FormComponents/FormControls';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useQuizTable from '../useQuizTable';

export default function CreateQuiz() {
  const { handleCreateQuiz } = useQuizTable();
  const { closeContextual } = useContextualMenu();
  const [quizNickname, setQuizNickname] = useState('');
  const handleSubmit = async () => {
    try {
      // Create a new quiz object
      const newQuiz: NewQuiz = {
        quizNickname,
      };

      // Call the handler from the hook
      handleCreateQuiz(newQuiz);

      // Clear form
      setQuizNickname('');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const cancelEdit = () => {
    setQuizNickname('');
    closeContextual();
  };

  return (
    <ContextualView>
      <div className="create-quiz-form">
        <h3>Create New Quiz</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quizNickname">Quiz Nickname:</label>
            <input
              type="text"
              id="quizNickname"
              value={quizNickname}
              onChange={(e) => setQuizNickname(e.target.value)}
              required
            />
          </div>

          <FormControls
            editMode
            cancelEdit={cancelEdit}
            captureSubmitForm={handleSubmit}
          />
        </form>
      </div>
    </ContextualView>
  );
}
