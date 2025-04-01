import type { GroupSession } from 'src/types/CoachingTypes';

export default function GroupCallRecordRow({
  groupCall,
}: {
  groupCall: GroupSession;
}) {
  return (
    <tr>
      <td>
        {typeof groupCall.date === 'string'
          ? groupCall.date
          : groupCall.date.toLocaleDateString()}
      </td>
      <td>{groupCall.coach.name}</td>
      <td>
        {groupCall.zoomLink && (
          <a
            className="content"
            href={groupCall.zoomLink}
            target="_blank"
            rel="noreferrer"
          >
            Zoom Link
          </a>
        )}
      </td>

      <td>{groupCall.topic}</td>
      <td>{groupCall.comments}</td>
      <td>Add Attendee</td>
    </tr>
  );
}
