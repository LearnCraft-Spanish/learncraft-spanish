// export function IncompleteRecords() {

//   const { contextual } = useContextualMenu();

//   const { coach } = useActiveCoach();
//   const { myIncompleteWeeklyRecords, startDate } = useMyIncompleteWeeklyRecords(
//     {
//       coach,
//     },
//   );

//   return (
//     <div className="coachingDashbaord__recordsToComplete">
//       {myIncompleteWeeklyRecords === undefined ? (
//         <InlineLoading message="Loading records..." />
//       ) : (
//         <>
//           <p style={{ padding: '0 1rem' }}>
//             {`Incomplete records for the week of: `}
//             <b>{toReadableMonthDay(startDate)}</b>
//           </p>
//           <DisplayOnlyTable
//             headers={[
//               'Student',
//               'Assignments',
//               'Group Calls',
//               'Private Calls',
//               'Notes',
//               'Current Lesson',
//               'Hold Week',
//               'Records Complete',
//             ]}
//             data={myIncompleteWeeklyRecords ?? []}
//             renderRow={(item) => {
//               return (
//                 <WeeksTableItem
//                   key={item.id}
//                   week={item}
//                   updateActiveDataWeek={() => {}}
//                   editMode={false}
//                   failedToUpdate={false}
//                   hiddenFields={[]}
//                 />
//               );
//             }}
//           />
//           {contextual.startsWith('week') && (
//             <ViewWeekRecord
//               week={myIncompleteWeeklyRecords?.find(
//                 (week) => week.recordId === Number(contextual.split('week')[1]),
//               )}
//             />
//           )}{' '}
//         </>
//       )}
//     </div>
//   );
// }

export default function IncompleteRecordsWrapper() {
  return null;
}
//   const [isOpen, setIsOpen] = useState(true);
//   const openFunctionWrapper = (_title: string) => {
//     setIsOpen(!isOpen);
//   };
//   return (
//     <div>
//       <SectionHeader
//         title="My Incomplete Records"
//         isOpen={isOpen}
//         openFunction={openFunctionWrapper}
//         button={
//           <div className="button">
//             <Link className="linkButton" to="/weeklyrecords">
//               Weekly Records Interface
//             </Link>
//           </div>
//         }
//       />
//       {isOpen && <IncompleteRecords />}
//     </div>
//   );
// }
