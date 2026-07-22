import type { RecentRecords } from '@learncraft-spanish/shared';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import eye from 'src/assets/icons/eye.svg';

type RecentGroupCall = RecentRecords['groupCalls'][number];

function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toLocaleDateString();
}

function groupSessionContextualKey(groupCall: RecentGroupCall): string {
  const weekId = groupCall.attendees[0]?.weekId ?? 0;
  return `groupSession${groupCall.groupSessionId}week${weekId}`;
}

export default function GroupCallRecordRow({
  groupCall,
}: {
  groupCall: RecentGroupCall;
}): React.JSX.Element {
  const { openContextual } = useContextualMenu();

  return (
    <tr>
      <td className="viewRecordIconCell">
        <button
          type="button"
          className="viewRecordIconButton"
          onClick={() => openContextual(groupSessionContextualKey(groupCall))}
        >
          <img src={eye} alt="view group session" className="viewRecordIcon" />
        </button>
      </td>
      <td>{formatDate(groupCall.callDate)}</td>
      <td>{groupCall.coach.fullName}</td>
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
      <td>{groupCall.groupSessionTopic?.groupSessionTopic ?? '—'}</td>
      <td>{groupCall.comments}</td>
    </tr>
  );
}
