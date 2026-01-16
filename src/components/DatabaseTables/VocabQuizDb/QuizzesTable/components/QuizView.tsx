import type { Quiz } from 'src/types/interfaceDefinitions';
import type { QuizNameObj, QuizSubNameObj } from '../constants';
import type { NewQuiz, QuizObjForUpdate } from '../types';
import { GenericDropdown } from '@interface/components/FormComponents';
import React, { useEffect, useMemo, useState } from 'react';
import { FormControls, TextInput } from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import { quizNames, serVsEstarQuizSubNames } from '../constants';
import useQuizTable from '../useQuizTable';
interface EditQuizProps {
  quiz: QuizObjForUpdate;
  onAction: (quiz: QuizObjForUpdate) => void;
  createMode?: boolean;
}

export function QuizView({ quiz, onAction, createMode }: EditQuizProps) {
  const { closeContextual } = useContextualMenu();
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();
  const [quizType, setQuizType] = useState<QuizNameObj | undefined>(undefined);
  const [quizNumber, setQuizNumber] = useState<number | undefined>(undefined);
  const [quizSubType, setQuizSubType] = useState<QuizSubNameObj | undefined>(
    undefined,
  );

  const quizNickname = useMemo(() => {
    if (quizType?.code === 'ser-estar') {
      return `${quizType ? quizType.code : 'undefined'} quiz ${quizNumber || 'undefined'}0${quizSubType ? quizSubType.quizNumber : 'undefined'}`;
    }

    return `${quizType ? quizType.code : 'undefined'} quiz ${quizNumber || 'undefined'}`;
  }, [quizType, quizNumber, quizSubType]);

  const quizTitle = useMemo(() => {
    if (quizType?.code === 'ser-estar') {
      return `Ser/Estar Lesson ${quizNumber || 'undefined'}, ${quizSubType ? quizSubType.quizName : 'undefined'}`;
    }

    return `${quizType ? quizType.quizName : 'undefined'} Quiz ${quizNumber || 'undefined'}`;
  }, [quizType, quizNumber, quizSubType]);

  const handleSubmit = async () => {
    try {
      // if quizNamename contains undefined, throw an error
      if (quizNickname.includes('undefined')) {
        openModal({
          title: 'Error',
          body: 'Quiz nickname cannot contain undefined',
          type: 'error',
        });
        return;
      }

      onAction({
        quizNickname,
        recordId: quiz.recordId,
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    closeContextual();
  };

  useEffect(() => {
    setQuizType(
      quizNames.find(
        (quizObj) => quizObj.code === quiz.quizNickname.split(' ')[0],
      ),
    );
    if (quiz.quizNickname.split(' ')[0] === 'ser-estar') {
      const quizNumber = quiz.quizNickname.split(' ')[2].split('')[0];
      const quizSubNumber = quiz.quizNickname.split(' ')[2].split('')[2];
      setQuizSubType(
        serVsEstarQuizSubNames.find(
          (quizObj) => quizObj.quizNumber.toString() === quizSubNumber,
        ),
      );
      setQuizNumber(Number(quizNumber));
      return;
    }
    if (createMode) {
      setQuizNumber(0);
    } else {
      setQuizNumber(Number(quiz.quizNickname.split(' ')[2]));
    }
  }, [quiz, createMode]);

  return (
    <ContextualView editFunction={() => setEditMode(!editMode)}>
      <h3>{createMode ? 'Create Quiz' : 'Edit Quiz'}</h3>
      <form>
        <TextInput
          label="Quiz Nickname"
          value={quizNickname}
          onChange={() => {}}
          editMode={false}
        />
        <TextInput
          label="Quiz Title"
          value={quizTitle}
          onChange={() => {}}
          editMode={false}
        />
        {editMode && (
          <GenericDropdown
            label="Quiz Type"
            options={quizNames.map((quiz) => ({
              value: quiz.code,
              text: quiz.quizName,
            }))}
            selectedValue={quizType?.code ?? ''}
            onChange={(value) =>
              setQuizType(quizNames.find((quiz) => quiz.code === value))
            }
            required
          />
        )}

        {editMode && quizType?.code === 'ser-estar' && (
          <GenericDropdown
            label="Quiz Sub Type"
            options={serVsEstarQuizSubNames.map((quiz) => ({
              value: quiz.quizNumber.toString(),
              text: quiz.quizName,
            }))}
            selectedValue={quizSubType?.quizNumber.toString() ?? ''}
            onChange={(value) =>
              setQuizSubType(
                serVsEstarQuizSubNames.find(
                  (quiz) => quiz.quizNumber.toString() === value,
                ),
              )
            }
            required
          />
        )}

        {/* Number input for quiz Number */}
        {editMode && (
          <TextInput
            label="Quiz Number"
            value={quizNumber?.toString() ?? ''}
            onChange={(value) => setQuizNumber(Number(value))}
            editMode={editMode}
            required
          />
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

export function EditQuiz({ quiz }: { quiz: Quiz }) {
  const { updateQuizMutation } = useQuizTable();

  const editableQuizObj: QuizObjForUpdate = {
    quizNickname: quiz.quizNickname,
    recordId: quiz.recordId,
  };

  const onAction = (quiz: QuizObjForUpdate) => {
    updateQuizMutation.mutate(quiz);
  };

  return <QuizView quiz={editableQuizObj} onAction={onAction} />;
}

export function CreateQuiz() {
  const { createQuizMutation } = useQuizTable();

  const onAction = (quiz: QuizObjForUpdate) => {
    const newQuiz: NewQuiz = {
      quizNickname: quiz.quizNickname,
    };
    createQuizMutation.mutate(newQuiz);
  };

  return (
    <QuizView
      quiz={{ quizNickname: '', recordId: 0 } as QuizObjForUpdate}
      onAction={onAction}
      createMode
    />
  );
}
