import type { RecentRecords } from '@learncraft-spanish/shared';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import eye from 'src/assets/icons/eye.svg';

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
}): React.JSX.Element {
  const { openContextual } = useContextualMenu();

  return (
    <tr>
      <td className="viewRecordIconCell">
        <button
          type="button"
          className="viewRecordIconButton"
          onClick={() => openContextual(`call${privateCall.callId}`)}
        >
          <img src={eye} alt="view private call" className="viewRecordIcon" />
        </button>
      </td>
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
      <td>{privateCall.callType?.callType ?? '—'}</td>
    </tr>
  );
}
