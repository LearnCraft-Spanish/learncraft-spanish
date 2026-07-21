import type { RecentRecords } from '@learncraft-spanish/shared';

type RecentPrivateCall = RecentRecords['privateCalls'][number];

function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toLocaleDateString();
}

export default function PrivateCallRecordRow({
  privateCall,
}: {
  privateCall: RecentPrivateCall;
}) {
  return (
    <tr>
      <td>{privateCall.weekId ?? '—'}</td>
      <td>{privateCall.callRating.rating}</td>
      <td>{privateCall.areasOfDifficulty}</td>
      <td>{privateCall.notes}</td>
      <td>
        {privateCall.recording && (
          <a
            className="content"
            href={privateCall.recording}
            target="_blank"
            rel="noreferrer"
          >
            Recording
          </a>
        )}
      </td>
      <td>{privateCall.caller.fullName}</td>
      <td>{formatDate(privateCall.callDate)}</td>
      <td>{privateCall.callType.callType}</td>
    </tr>
  );
}
