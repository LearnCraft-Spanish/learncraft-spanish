import type { PrivateCall } from 'src/types/CoachingTypes';

export default function PrivateCallRecordRow({
  privateCall,
}: {
  privateCall: PrivateCall;
}) {
  return (
    <tr>
      {/* update stuff to get weekName from backend */}
      <td>{privateCall.weekName}</td>
      <td>{privateCall.rating}</td>
      <td>{privateCall.areasOfDifficulty}</td>
      <td>{privateCall.notes}</td>
      <td>{privateCall.recording}</td>
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
