import type {
  BaseAssignment,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';
import { useAssignmentLookupsQuery } from '@application/queries/useAssignmentLookupsQuery';
import { Dropdown } from '@interface/components/FormComponents';
import { useState } from 'react';
import {
  CoachDropdown_LEGACY,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';

import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

// const assignmentTypes = [
//   'Pronunciation',
//   'Writing',
//   'placement test',
//   'journal',
//   'verbal tenses review',
//   'audio quiz',
//   'Student Testimonial',
//   '_other',
// ];
// const ratings = [
//   'Excellent',
//   'Very Good',
//   'Good',
//   'Fair',
//   'Bad',
//   'Poor',
//   'Assigned to M3',
//   'No sound',
//   'Assigned to Level 2 (L6-9)',
//   'Assigned to Level 3 (L10-12)',
//   'Assigned to Level 1 (lessons 1-6)',
//   'Advanced group',
//   'Assigned to Level 1 (L1-L5)',
//   'Assigned to 1MC',
//   'Assigned to Level 4',
//   'New LCS course',
//   'Advanced',
// ];

export function AssignmentCell({
  week,
  assignment,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignment: BaseAssignment;
  tableEditMode: boolean;
}) {
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
        <AssignmentView
          week={week}
          assignment={assignment}
          _tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export function AssignmentView({
  week,
  assignment,
  _tableEditMode,
  _onSuccess,
}: {
  week: FurnishedWeekWithCoach;
  assignment: BaseAssignment;
  _tableEditMode?: boolean;
  _onSuccess?: () => void;
}) {
  const { coaches } = useAllCoachesQuery();
  // const {
  //   getStudentFromMembershipId,
  //   coachListQuery,
  //   // updateAssignmentMutation,
  //   // deleteAssignmentMutation,
  // } = useCoaching();

  const { assignmentTypes, assignmentRatings } = useAssignmentLookupsQuery();

  // const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  // const { closeModal, openModal } = useModal();

  // const [editMode, setEditMode] = useState(false);
  const editMode = false;

  const [homeworkCorrector, setHomeworkCorrector] = useState(
    assignment.homeworkCorrector.email,
  );
  const [assignmentType, setAssignmentType] = useState(
    assignment.assignmentType.assignmentType,
  );
  const [assignmentRating, setAssignmentRating] = useState(
    assignment.assignmentRating.assignmentRating,
  );
  const [notes, setNotes] = useState(assignment.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    assignment.areasOfDifficulty,
  );
  const [assignmentLink, setAssignmentLink] = useState(
    assignment.assignmentLink,
  );

  function updateHomeworkCorrector(email: string) {
    const corrector = coaches?.find((coach) => coach.email === email);
    if (!corrector) {
      console.error('No coach found with email:', email);
      return;
    }
    setHomeworkCorrector(corrector.email);
  }

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
  //   setAssignmentType(assignment.assignmentType.assignmentType);
  //   setAssignmentRating(assignment.assignmentRating.assignmentRating);
  //   setNotes(assignment.notes);
  //   setAreasOfDifficulty(assignment.areasOfDifficulty);
  //   setAssignmentLink(assignment.assignmentLink);
  // }
  // function deleteRecordFunction() {
  //   deleteAssignmentMutation.mutate(assignment.assignmentId, {
  //     onSuccess: () => {
  //       closeModal();
  //       cancelEdit();
  //       closeContextual();
  //       onSuccess?.();
  //     },
  //   });
  // }

  // function submitEdit() {
  //   updateAssignmentMutation.mutate(
  //     {
  //       relatedWeek: assignment.weekId,
  //       recordId: assignment.assignmentId,
  //       homeworkCorrector,
  //       assignmentType,
  //       assignmentRating,
  //       notes,
  //       areasOfDifficulty,
  //       assignmentLink,
  //     },
  //     {
  //       onSuccess: () => {
  //         disableEditMode();
  //         onSuccess?.();
  //       },
  //     },
  //   );
  // }

  // function captureSubmitForm() {
  //   // check if any fields have changed from the original assignment
  //   // if not, do nothing
  //   if (
  //     homeworkCorrector === assignment.homeworkCorrector.email &&
  //     assignmentType === assignment.assignmentType.assignmentType &&
  //     assignmentRating === assignment.assignmentRating.assignmentRating &&
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
  //     { label: 'Rating', value: assignmentRating },
  //   ]);
  //   if (badInput) {
  //     openModal({
  //       title: 'Error',
  //       body: `${badInput} is required`,
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   if (assignmentLink && !isValidUrl(assignmentLink)) {
  //     openModal({
  //       title: 'Error',
  //       body: 'Assignment Link must be a valid url',
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   submitEdit();
  // }
  return (
    <ContextualView
      key={`assignment${assignment.assignmentId}`}
      // editFunction={tableEditMode ? undefined : toggleEditMode}
      editFunction={() => {}}
    >
      {editMode ? (
        <h4>Edit Assignment</h4>
      ) : (
        <h4>
          {assignmentType} by {week.student?.fullName}
        </h4>
      )}

      <Dropdown
        label="Assignment Type"
        editMode={editMode}
        value={assignmentType}
        onChange={(value) => setAssignmentType(value)}
        options={assignmentTypes?.map((type) => type.assignmentType) || []}
        required
      />

      <CoachDropdown_LEGACY
        label="Corrected by"
        editMode={editMode}
        coachEmail={homeworkCorrector}
        onChange={updateHomeworkCorrector}
        required
      />

      <Dropdown
        label="Rating"
        editMode={editMode}
        value={assignmentRating}
        onChange={setAssignmentRating}
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

      {/* {editMode && <DeleteRecord deleteFunction={deleteRecordFunction} />} */}

      {/* <FormControls
        editMode={editMode}
        cancelEdit={cancelEdit}
        captureSubmitForm={captureSubmitForm}
      /> */}
    </ContextualView>
  );
}

export default function AssignmentsCell({
  week,
  assignments,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  assignments: BaseAssignment[] | null | undefined;
  tableEditMode: boolean;
}) {
  return (
    <div className="assignmentsCell">
      {!!assignments &&
        assignments.map((assignment) => (
          <AssignmentCell
            week={week}
            assignment={assignment}
            tableEditMode={tableEditMode}
            key={`assignment${assignment.assignmentId}`}
          />
        ))}
    </div>
  );
}

// export function _NewAssignmentView({
//   weekStartsDefaultValue,
//   onSuccess,
// }: {
//   weekStartsDefaultValue: string;
//   onSuccess?: () => void;
// }) {
//   const { closeContextual } = useContextualMenu();
//   // const { createAssignmentMutation } = useCoaching();
//   const { authUser } = useAuthAdapter();
//   const { getStudentFromMembershipId } = useCoaching();
//   const { openModal } = useModal();
//   const [weekStarts, setWeekStarts] = useState(weekStartsDefaultValue);
//   const [numWeeks, setNumWeeks] = useState(4);
//   const weekEnds = useMemo(() => getWeekEnds(weekStarts), [weekStarts]);
//   const dateRange = useMemo(() => getDateRange(numWeeks), [numWeeks]);
//   const { weeksQuery } = useWeeks(weekStarts, weekEnds);
//   const { coachListQuery } = useCoaching();

//   const [editMode, setEditMode] = useState(true);

//   const handleLoadMore = () => {
//     setNumWeeks((prev) => prev * 2);
//   };

//   interface StudentObj {
//     studentFullname: string;
//     relatedWeek: Week;
//   }
//   const [student, setStudent] = useState<StudentObj>();
//   const defaultHomeworkCorrector = useMemo(() => {
//     return (
//       getLoggedInCoach(authUser.email || '', coachListQuery.data || [])?.user
//         .email || ''
//     );
//   }, [authUser.email, coachListQuery.data]);

//   const [homeworkCorrector, setHomeworkCorrector] = useState(
//     defaultHomeworkCorrector,
//   );
//   const [assignmentType, setAssignmentType] = useState('');
//   const [rating, setRating] = useState('');
//   const [notes, setNotes] = useState('');
//   const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
//   const [assignmentLink, setAssignmentLink] = useState('');

//   const updateHomeworkCorrector = (email: string) => {
//     setHomeworkCorrector(email);
//   };
//   const updateStudent = (relatedWeekId: number) => {
//     if (!weeksQuery.data) {
//       console.error('No weeks found');
//       return;
//     }
//     const studentWeek = weeksQuery.data.find(
//       (week: Week) => week.recordId === relatedWeekId,
//     );
//     if (!studentWeek) {
//       console.error('No student found with recordId:', relatedWeekId);
//       return;
//     }
//     setStudent({
//       studentFullname:
//         // Foreign Key lookup, form data in backend
//         getStudentFromMembershipId(studentWeek.relatedMembership)?.fullName ||
//         '',
//       relatedWeek: studentWeek,
//     });
//   };

//   const updateWeekStarts = (value: string) => {
//     if (value === 'loadMore') {
//       handleLoadMore();
//       return; // Don't update the selected value
//     }
//     setStudent(undefined);
//     setWeekStarts(value);
//   };

//   function createNewAssignment() {
//     if (!student) {
//       openModal({
//         title: 'Error',
//         body: 'Student is required',
//         type: 'error',
//       });
//       return;
//     }
//     setEditMode(false);
//     createAssignmentMutation.mutate(
//       {
//         relatedWeek: student.relatedWeek.recordId,
//         homeworkCorrector,
//         assignmentType,
//         rating,
//         notes,
//         areasOfDifficulty,
//         assignmentLink,
//       },
//       {
//         onSuccess: () => {
//           onSuccess?.();
//         },
//       },
//     );
//   }
//   function captureSubmitForm() {
//     const badInput = verifyRequiredInputs([
//       { label: 'Assignment Type', value: assignmentType },
//       { label: 'Homework Corrector', value: homeworkCorrector },
//       { label: 'Rating', value: rating },
//     ]);
//     if (badInput) {
//       openModal({
//         title: 'Error',
//         body: `${badInput} is required`,
//         type: 'error',
//       });
//       return;
//     }
//     if (assignmentLink && !isValidUrl(assignmentLink)) {
//       openModal({
//         title: 'Error',
//         body: 'Assignment Link must be a valid url',
//         type: 'error',
//       });
//       return;
//     }
//     createNewAssignment();
//   }

//   function toggleEditMode() {
//     if (editMode) {
//       setEditMode(false);
//     } else {
//       setEditMode(true);
//     }
//   }

//   return (
//     <ContextualView editFunction={toggleEditMode}>
//       {editMode ? (
//         <h4>Create Assignment</h4>
//       ) : (
//         <h4>
//           {assignmentType} by {student?.studentFullname}
//         </h4>
//       )}
//       {editMode && (
//         <div className="lineWrapper">
//           <label htmlFor="assignmentName" className="label">
//             Assignment Name:
//           </label>
//           <div className="content" id="assignmentName">
//             {student && `${student.relatedWeek.weekName} - ${assignmentType}`}
//           </div>
//         </div>
//       )}
//       {editMode && (
//         <div className="lineWrapper">
//           <label htmlFor="primaryCoach" className="label">
//             Primary Coach:
//           </label>
//           <div className="content" id="primaryCoach">
//             {student && `${student.relatedWeek.primaryCoachWhenCreated}`}
//           </div>
//         </div>
//       )}
//       {editMode && (
//         <div className="lineWrapper">
//           <label className="label" htmlFor="weekStarts">
//             Week Starts:
//           </label>
//           <select
//             id="weekStarts"
//             className="content"
//             value={weekStarts}
//             onChange={(e) => updateWeekStarts(e.target.value)}
//           >
//             {Array.from({ length: numWeeks }, (_, i) => {
//               const dateKey =
//                 i === 0
//                   ? 'thisWeekDate'
//                   : i === 1
//                     ? 'lastSundayDate'
//                     : i === 2
//                       ? 'twoSundaysAgoDate'
//                       : `${i + 1}SundaysAgoDate`;
//               const date = dateRange[dateKey];
//               const label =
//                 i === 0
//                   ? 'This Week'
//                   : i === 1
//                     ? 'Last Week'
//                     : i === 2
//                       ? 'Two Weeks Ago'
//                       : toReadableMonthDay(date);
//               return (
//                 <option key={date} value={date}>
//                   {i < 3 ? `${label} (${toReadableMonthDay(date)})` : label}
//                 </option>
//               );
//             })}
//             <option value="loadMore" className="loadMoreOption">
//               Load More...
//             </option>
//           </select>
//         </div>
//       )}
//       {editMode && (
//         <div className="lineWrapper">
//           <label className="label" htmlFor="student">
//             Student:
//           </label>
//           {/* <select
//             id="student"
//             className="content"
//             value={student?.relatedWeek.recordId || ''}
//             onChange={(e) => updateStudent(e.target.value)}
//           >
//             <option value="">Select</option>
//             {weeksQuery.data
//               ?.filter((filterWeek) => {
//                 return filterWeek.weekStarts === weekStarts;
//               })
//               .map((studentWeek) => ({
//                 ...studentWeek,
//                 studentFullName: getStudentFromMembershipId(
//                   studentWeek.relatedMembership,
//                 )?.fullName,
//               }))
//               .sort(
//                 (a, b) =>
//                   a.studentFullName?.localeCompare(b.studentFullName || '') ||
//                   0,
//               )
//               .map((studentWeek) => (
//                 <option key={studentWeek.recordId} value={studentWeek.recordId}>
//                   {studentWeek.studentFullName || 'No Name Found'}
//                   {` -- ${studentWeek.weekStarts}`}
//                 </option>
//               ))}
//           </select> */}
//           {student ? (
//             <>
//               <div className="content">{student.studentFullname}</div>
//               <button
//                 type="button"
//                 className="clearStudent"
//                 onClick={() => setStudent(undefined)}
//               >
//                 <img src={x_dark} alt="close" />
//               </button>
//             </>
//           ) : (
//             <CustomStudentSelector
//               weekStarts={weekStarts}
//               onChange={updateStudent}
//             />
//           )}
//         </div>
//       )}

//       <Dropdown
//         label="Assignment Type"
//         value={assignmentType}
//         onChange={setAssignmentType}
//         options={assignmentTypes}
//         editMode={editMode}
//         required
//       />

//       <CoachDropdown_LEGACY
//         label="Corrected by"
//         editMode={editMode}
//         coachEmail={homeworkCorrector}
//         onChange={updateHomeworkCorrector}
//         required
//       />

//       <Dropdown
//         label="Rating"
//         value={rating}
//         onChange={setRating}
//         options={ratings}
//         editMode={editMode}
//         required
//       />
//       <LinkInput
//         label="Assignment Link"
//         value={assignmentLink}
//         onChange={setAssignmentLink}
//         editMode={editMode}
//       />
//       <TextAreaInput
//         label="Areas of Difficulty"
//         editMode={editMode}
//         value={areasOfDifficulty}
//         onChange={setAreasOfDifficulty}
//       />
//       <TextAreaInput
//         label="Notes"
//         editMode={editMode}
//         value={notes}
//         onChange={setNotes}
//       />
//       <FormControls
//         editMode={editMode}
//         cancelEdit={closeContextual}
//         captureSubmitForm={captureSubmitForm}
//       />
//     </ContextualView>
//   );
// }
