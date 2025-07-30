import type { AppUser } from '@learncraft-spanish/shared';
import type { Flashcard } from 'src/types/interfaceDefinitions';
import React from 'react';

interface ConfirmationDialogProps {
  assignmentType: 'students' | 'quiz';
  unassignedExamples: Flashcard[];
  selectedQuizObject?: {
    recordId: number;
    quizNickname?: string;
    quizNumber?: number;
  };
  activeStudent: AppUser | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function ConfirmationDialog({
  assignmentType,
  unassignedExamples,
  selectedQuizObject,
  activeStudent,
  onConfirm,
  onCancel,
  isPending,
}: ConfirmationDialogProps) {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
  };

  return (
    <div className="confirmation-dialog" style={overlayStyle}>
      <div style={dialogStyle}>
        <h4>Confirm Assignment</h4>
        {assignmentType === 'students' && activeStudent && (
          <p>
            Are you sure you want to assign {unassignedExamples.length} examples
            to {activeStudent.name}?
          </p>
        )}
        {assignmentType === 'quiz' && selectedQuizObject && (
          <p>
            Are you sure you want to assign {unassignedExamples.length} examples
            to Quiz:{' '}
            {selectedQuizObject.quizNickname ||
              `Quiz ${selectedQuizObject.quizNumber}`}
            ?
          </p>
        )}
        <div className="buttonBox">
          <button
            type="button"
            onClick={onConfirm}
            disabled={
              isPending ||
              unassignedExamples.length === 0 ||
              (assignmentType === 'students' && !activeStudent) ||
              (assignmentType === 'quiz' && !selectedQuizObject)
            }
          >
            Confirm
          </button>
          <button type="button" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
