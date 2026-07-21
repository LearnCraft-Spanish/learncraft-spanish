import type { RecentRecords } from '@learncraft-spanish/shared';

type RecentGroupCall = RecentRecords['groupCalls'][number];

function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toLocaleDateString();
}

export default function GroupCallRecordRow({
  groupCall,
}: {
  groupCall: RecentGroupCall;
}) {
  return (
    <tr>
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
