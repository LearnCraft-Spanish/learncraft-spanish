import type { CoachingRecordDisplayContext } from '@interface/components/CoachingRecords/types';
import type { BaseAssignment } from '@learncraft-spanish/shared';

import { useAssignmentLookupsQuery } from '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery';
import { useAssignmentsMutations } from '@application/queries/AssignmentsQueries/useAssignmentMutations';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import ContextualView from '@interface/components/Contextual/ContextualView';
import { Dropdown } from '@interface/components/FormComponents';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useModal } from '@interface/hooks/useModal';
import { useState } from 'react';
import {
  CoachDropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import DeleteRecord from 'src/components/FormComponents/DeleteRecord';
import FormControls from 'src/components/FormComponents/FormControls';
import verifyRequiredInputs, {
  isValidUrl,
} from 'src/components/FormComponents/functions/inputValidation';

export function AssignmentView({
  assignment,
  displayContext,
  tableEditMode,
  onSuccess,
}: {
  assignment: BaseAssignment;
  displayContext?: CoachingRecordDisplayContext;
  tableEditMode: boolean;
  onSuccess?: () => void;
}): React.JSX.Element {
  const studentName = displayContext?.studentName ?? 'No Student';
  const { coaches } = useAllCoachesQuery();
  const { updateAssignmentMutation, deleteAssignmentMutation } =
    useAssignmentsMutations();
  const { assignmentTypes, assignmentRatings } = useAssignmentLookupsQuery();
  const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  const { closeModal, openModal } = useModal();

  const [editMode, setEditMode] = useState(false);
  const [homeworkCorrector, setHomeworkCorrector] = useState(
    assignment.homeworkCorrector,
  );
  const [assignmentType, setAssignmentType] = useState(
    assignment.assignmentType,
  );
  const [assignmentRating, setAssignmentRating] = useState(
    assignment.assignmentRating,
  );
  const [notes, setNotes] = useState(assignment.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    assignment.areasOfDifficulty,
  );
  const [assignmentLink, setAssignmentLink] = useState(
    assignment.assignmentLink,
  );

  function updateHomeworkCorrector(coachId: number): void {
    const corrector = coaches?.find((coach) => coach.coach_id === coachId);
    if (!corrector) {
      console.error('No coach found with id:', coachId);
      return;
    }
    setHomeworkCorrector(corrector);
  }

  function enableEditMode(): void {
    setEditMode(true);
    updateDisableClickOutside(true);
  }

  function disableEditMode(): void {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function toggleEditMode(): void {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  function cancelEdit(): void {
    disableEditMode();
    setHomeworkCorrector(assignment.homeworkCorrector);
    setAssignmentType(assignment.assignmentType);
    setAssignmentRating(assignment.assignmentRating);
    setNotes(assignment.notes);
    setAreasOfDifficulty(assignment.areasOfDifficulty);
    setAssignmentLink(assignment.assignmentLink);
  }

  function deleteRecordFunction(): void {
    deleteAssignmentMutation.mutate(
      { assignmentId: assignment.assignmentId },
      {
        onSuccess: () => {
          closeModal();
          cancelEdit();
          closeContextual();
          onSuccess?.();
        },
      },
    );
  }

  function submitEdit(): void {
    updateAssignmentMutation.mutate(
      {
        weekId: assignment.weekId,
        assignmentId: assignment.assignmentId,
        homeworkCorrector: homeworkCorrector.coach_id,
        assignmentType,
        assignmentRating,
        notes,
        areasOfDifficulty,
        assignmentLink,
      },
      {
        onSuccess: () => {
          disableEditMode();
          onSuccess?.();
        },
      },
    );
  }

  function captureSubmitForm(): void {
    if (
      homeworkCorrector.coach_id === assignment.homeworkCorrector.coach_id &&
      assignmentType.assignmentType ===
        assignment.assignmentType.assignmentType &&
      assignmentRating.assignmentRating ===
        assignment.assignmentRating.assignmentRating &&
      notes === assignment.notes &&
      areasOfDifficulty === assignment.areasOfDifficulty &&
      assignmentLink === assignment.assignmentLink
    ) {
      disableEditMode();
      return;
    }

    const badInput = verifyRequiredInputs([
      { label: 'Assignment Type', value: assignmentType?.assignmentType || '' },
      {
        label: 'Homework Corrector',
        value: homeworkCorrector?.coach_id.toString() || '',
      },
      { label: 'Rating', value: assignmentRating?.assignmentRating || '' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is required`,
        type: 'error',
      });
      return;
    }
    if (assignmentLink && !isValidUrl(assignmentLink)) {
      openModal({
        title: 'Error',
        body: 'Assignment Link must be a valid url',
        type: 'error',
      });
      return;
    }
    submitEdit();
  }

  return (
    <ContextualView
      key={`assignment${assignment.assignmentId}`}
      editFunction={tableEditMode ? undefined : toggleEditMode}
    >
      {editMode ? (
        <h4>Edit Assignment</h4>
      ) : (
        <h4>
          {assignmentType.assignmentType} by {studentName}
        </h4>
      )}

      <Dropdown
        label="Assignment Type"
        editMode={editMode}
        value={assignmentType.assignmentType}
        onChange={(value) => {
          const nextAssignmentType = assignmentTypes?.find(
            (type) => type.assignmentType === value,
          );
          if (!nextAssignmentType) {
            console.error('No assignment type found with value:', value);
            return;
          }
          setAssignmentType(nextAssignmentType);
        }}
        options={assignmentTypes?.map((type) => type.assignmentType) || []}
        required
      />

      <CoachDropdown
        label="Corrected by"
        editMode={editMode}
        coachId={homeworkCorrector.coach_id}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        editMode={editMode}
        value={assignmentRating.assignmentRating}
        onChange={(value) => {
          const nextAssignmentRating = assignmentRatings?.find(
            (rating) => rating.assignmentRating === value,
          );
          if (!nextAssignmentRating) {
            console.error('No assignment rating found with value:', value);
            return;
          }
          setAssignmentRating(nextAssignmentRating);
        }}
        options={
          assignmentRatings?.map((rating) => rating.assignmentRating) || []
        }
        required
      />

      <TextAreaInput
        label="Notes"
        editMode={editMode}
        value={notes || ''}
        onChange={setNotes}
      />

      <TextAreaInput
        label="Areas of Difficulty"
        editMode={editMode}
        value={areasOfDifficulty || ''}
        onChange={setAreasOfDifficulty}
      />

      <LinkInput
        label="Assignment Link"
        value={assignmentLink || ''}
        onChange={setAssignmentLink}
        editMode={editMode}
      />

      {editMode && <DeleteRecord deleteFunction={deleteRecordFunction} />}

      <FormControls
        editMode={editMode}
        cancelEdit={cancelEdit}
        captureSubmitForm={captureSubmitForm}
      />
    </ContextualView>
  );
}
