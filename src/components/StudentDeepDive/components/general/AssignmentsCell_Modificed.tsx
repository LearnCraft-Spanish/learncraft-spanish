import type { Assignment } from 'src/types/CoachingTypes';

import {
  // DeleteRecord,
  Dropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/Coaching/general/';
import ContextualControls from 'src/components/ContextualControls';

import { useContextualMenu } from 'src/hooks/useContextualMenu';

const assignmentTypes = [
  'Pronunciation',
  'Writing',
  'placement test',
  'journal',
  'verbal tenses review',
  'audio quiz',
  'Student Testimonial',
  '_other',
];
const ratings = [
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Bad',
  'Poor',
  'Assigned to M3',
  'No sound',
  'Assigned to Level 2 (L6-9)',
  'Assigned to Level 3 (L10-12)',
  'Assigned to Level 1 (lessons 1-6)',
  'Advanced group',
  'Assigned to Level 1 (L1-L5)',
  'Assigned to 1MC',
  'Assigned to Level 4',
  'New LCS course',
  'Advanced',
];

function AssignmentCell({ assignment }: { assignment: Assignment }) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.recordId}`)}
      >
        {`${assignment.assignmentType}: ${assignment.rating}`}
      </button>
      {contextual === `assignment${assignment.recordId}` && (
        <AssignmentView assignment={assignment} />
      )}
    </div>
  );
}

function AssignmentView({ assignment }: { assignment: Assignment }) {
  // const {
  //   getStudentFromMembershipId,
  //   getMembershipFromWeekRecordId,
  //   coachListQuery,
  //   updateAssignmentMutation,
  //   deleteAssignmentMutation,
  // } = useCoaching();
  const { setContextualRef } = useContextualMenu();
  // const { closeModal, openModal } = useModal();

  // const [editMode, setEditMode] = useState(false);

  // const [homeworkCorrector, setHomeworkCorrector] = useState(
  //   assignment.homeworkCorrector.email,
  // );
  // const [assignmentType, setAssignmentType] = useState(
  //   assignment.assignmentType,
  // );
  // const [rating, setRating] = useState(assignment.rating);
  // const [notes, setNotes] = useState(assignment.notes);
  // const [areasOfDifficulty, setAreasOfDifficulty] = useState(
  //   assignment.areasOfDifficulty,
  // );
  // const [assignmentLink, setAssignmentLink] = useState(
  //   assignment.assignmentLink,
  // );

  // function updateHomeworkCorrector(email: string) {
  //   const corrector = coachListQuery.data?.find(
  //     (coach) => coach.user.email === email,
  //   );
  //   if (!corrector) {
  //     console.error('No coach found with email:', email);
  //     return;
  //   }
  //   setHomeworkCorrector(corrector.user.email);
  // }

  // function enableEditMode() {
  //   setEditMode(true);
  //   updateDisableClickOutside(true);
  // }
  // function disableEditMode() {
  //   setEditMode(false);
  //   updateDisableClickOutside(false);
  // }

  // function toggleEditMode() {
  //   if (editMode) {
  //     cancelEdit();
  //   } else {
  //     enableEditMode();
  //   }
  // }

  // function cancelEdit() {
  //   disableEditMode();

  //   // reset states to assignment values
  //   setHomeworkCorrector(assignment.homeworkCorrector.email);
  //   setAssignmentType(assignment.assignmentType);
  //   setRating(assignment.rating);
  //   setNotes(assignment.notes);
  //   setAreasOfDifficulty(assignment.areasOfDifficulty);
  //   setAssignmentLink(assignment.assignmentLink);
  // }
  // function deleteRecordFunction() {
  //   deleteAssignmentMutation.mutate(assignment.recordId, {
  //     onSuccess: () => {
  //       closeModal();
  //       cancelEdit();
  //       closeContextual();
  //     },
  //   });
  // }

  // function submitEdit() {
  //   updateAssignmentMutation.mutate(
  //     {
  //       relatedWeek: assignment.relatedWeek,
  //       recordId: assignment.recordId,
  //       homeworkCorrector,
  //       assignmentType,
  //       rating,
  //       notes,
  //       areasOfDifficulty,
  //       assignmentLink,
  //     },
  //     {
  //       onSuccess: () => {
  //         disableEditMode();
  //         closeContextual();
  //       },
  //     },
  //   );
  // }

  // function captureSubmitForm() {
  //   // check if any fields have changed from the original assignment
  //   // if not, do nothing
  //   if (
  //     homeworkCorrector === assignment.homeworkCorrector.email &&
  //     assignmentType === assignment.assignmentType &&
  //     rating === assignment.rating &&
  //     notes === assignment.notes &&
  //     areasOfDifficulty === assignment.areasOfDifficulty &&
  //     assignmentLink === assignment.assignmentLink
  //   ) {
  //     disableEditMode();
  //     return;
  //   }
  //   //Check for all required fields
  //   const badInput = verifyRequiredInputs([
  //     { label: 'Assignment Type', value: assignmentType },
  //     { label: 'Homework Corrector', value: homeworkCorrector },
  //     { label: 'Rating', value: rating },
  //   ]);
  //   if (badInput) {
  //     openModal({
  //       title: 'Error',
  //       body: `${badInput} is required`,
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   submitEdit();
  // }
  return (
    <div className="contextualWrapper" key={`assignment${assignment.recordId}`}>
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />
        {<h4>{assignment.assignmentType}</h4>}

        <Dropdown
          label="Assignment Type"
          value={assignment.assignmentType}
          options={assignmentTypes}
          onChange={() => {}}
          editMode={false}
        />
        <div>
          <h4>Corrected by</h4>
          <p>{assignment.homeworkCorrector.email}</p>
        </div>

        {/* <CoachDropdown
          label="Corrected by"
          coachEmail={assignment.homeworkCorrector.email}
          onChange={() => {}}
          editMode={false}
        /> */}

        <Dropdown
          label="Rating"
          value={assignment.rating}
          options={ratings}
          onChange={() => {}}
          editMode={false}
        />

        <TextAreaInput
          label="Notes"
          value={assignment.notes}
          onChange={() => {}}
          editMode={false}
        />

        <TextAreaInput
          label="Areas of Difficulty"
          value={assignment.areasOfDifficulty}
          onChange={() => {}}
          editMode={false}
        />

        <LinkInput
          label="Assignment Link"
          value={assignment.assignmentLink}
          onChange={() => {}}
          editMode={false}
        />

        {/* <DeleteRecord deleteFunction={deleteRecordFunction} /> */}
      </div>
    </div>
  );
}

export default function AssignmentsCell({
  assignments,
}: {
  assignments: Assignment[] | null | undefined;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            key={`assignment${assignment.recordId}`}
          />
        ))}
    </div>
  );
}
