import type { PrivateCall } from 'src/types/CoachingTypes';
import eye from 'src/assets/icons/eye.svg';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function PrivateCallRecordRow({
  privateCall,
}: {
  privateCall: PrivateCall;
}) {
  const { openContextual } = useContextualMenu();
  return (
    <tr>
      {/* update stuff to get weekName from backend */}
      <td className="viewRecordIconCell">
        <img
          src={eye}
          alt="view record"
          className="viewRecordIcon"
          onClick={() => openContextual(`private-call-${privateCall.recordId}`)}
        />
      </td>
      <td>{privateCall.weekName}</td>
      <td>{privateCall.rating}</td>
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
      <td>{privateCall.caller.name}</td>
      <td>
        {typeof privateCall.date === 'string'
          ? privateCall.date
          : privateCall.date.toLocaleDateString()}
      </td>
      <td>{privateCall.callType}</td>
    </tr>
  );
}
