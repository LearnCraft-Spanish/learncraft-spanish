import type { GroupSession } from 'src/types/CoachingTypes';
import eye from 'src/assets/icons/eye.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function GroupCallRecordRow({
  groupCall,
}: {
  groupCall: GroupSession;
}) {
  const { openContextual } = useContextualMenu();
  return (
    <tr>
      <td className="viewRecordIconCell">
        <img
          src={eye}
          alt="view record"
          className="viewRecordIcon"
          onClick={() => openContextual(`group-call-${groupCall.recordId}`)}
        />
      </td>
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
