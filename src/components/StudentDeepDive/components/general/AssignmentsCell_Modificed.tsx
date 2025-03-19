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
        <div className="lineWrapper">
          <h4 className="label">Corrected by</h4>
          <p className="content">{assignment.homeworkCorrector?.name}</p>
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
