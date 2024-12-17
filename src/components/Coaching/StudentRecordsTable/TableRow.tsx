import StudentCell from './StudentCell';
import CallsCell from './CallsCell';
import GroupSessionsCell from './GroupSessionsCell';
import AssignmentsCell from './AssignmentsCell';

export default function TableRow({ data }: { data: any[] }) {
  return data.map((item) => (
    <tr key={item.recordId} className="studentWeek">
      <td className="studentHeader">
        <StudentCell week={item} />
      </td>
      {weeksToDisplay.filter((item) => weekGetsPrivateCalls(item.recordId))
        .length > 0 && (
        <td>
          <CallsCell data={item} />
        </td>
      )}
      {weeksToDisplay.filter((item) => weekGetsGroupCalls(item.recordId))
        .length > 0 && (
        <td>
          <GroupSessionsCell data={getGroupSessionsFromWeekId(data.recordId)} />
        </td>
      )}
      <td>
        <AssignmentsCell data={getAssignmentsFromWeekId(item.recordId)} />
      </td>
      <td className="studentWeekNotes">{item.notes}</td>
      <td className="studentWeekNotes">
        {getLessonFromRecordId(item.currentLesson).lessonName}
      </td>
    </tr>
  ));
}
