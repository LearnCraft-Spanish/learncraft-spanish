import type { BaseAssignment } from '@learncraft-spanish/shared';
import { Dropdown } from '@interface/components/FormComponents';
import {
  // DeleteRecord,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';

import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

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

function AssignmentCell({ assignment }: { assignment: BaseAssignment }) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`assignment${assignment.assignmentId}`)}
      >
        {`${assignment.assignmentType.assignmentType}: ${assignment.assignmentRating.assignmentRating}`}
      </button>
      {contextual === `assignment${assignment.assignmentId}` && (
        <AssignmentView assignment={assignment} />
      )}
    </div>
  );
}

function AssignmentView({ assignment }: { assignment: BaseAssignment }) {
  return (
    <ContextualView key={`assignment${assignment.assignmentId}`}>
      {<h4>{assignment.assignmentType.assignmentType}</h4>}

      <Dropdown
        label="Assignment Type"
        value={assignment.assignmentType.assignmentType}
        options={assignmentTypes}
        onChange={() => {}}
        editMode={false}
      />
      <div className="lineWrapper">
        <h4 className="label">Corrected by</h4>
        <p className="content">{assignment.homeworkCorrector?.fullName}</p>
      </div>

      <Dropdown
        label="Rating"
        value={assignment.assignmentRating.assignmentRating}
        options={ratings}
        onChange={() => {}}
        editMode={false}
      />

      <TextAreaInput
        label="Notes"
        value={assignment.notes ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <TextAreaInput
        label="Areas of Difficulty"
        value={assignment.areasOfDifficulty ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <LinkInput
        label="Assignment Link"
        value={assignment.assignmentLink ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      {/* <DeleteRecord deleteFunction={deleteRecordFunction} /> */}
    </ContextualView>
  );
}

export default function AssignmentsCell({
  assignments,
}: {
  assignments: BaseAssignment[] | null | undefined;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            assignment={assignment}
            key={`assignment${assignment.assignmentId}`}
          />
        ))}
    </div>
  );
}
