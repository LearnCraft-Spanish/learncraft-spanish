import type {
  BasePrivateCall,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import {
  NewPrivateCallView,
  PrivateCallView,
} from '@interface/components/CoachingRecords';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';

function PrivateCallInstance({
  week,
  call,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  call: BasePrivateCall;
  tableEditMode: boolean;
}): React.JSX.Element {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual" key={call.callId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.callId}`)}
      >
        {call.callRating?.rating || 'No Rating'}
      </button>
      {contextual === `call${call.callId}` && (
        <PrivateCallView
          call={call}
          tableEditMode={tableEditMode}
          displayContext={{ studentName: week.student?.fullName }}
        />
      )}
    </div>
  );
}

export default function PrivateCallsCell({
  week,
  calls,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  calls: BasePrivateCall[] | null;
  tableEditMode: boolean;
}): React.JSX.Element {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="callBox">
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.callId}
            week={week}
            call={call}
            tableEditMode={tableEditMode}
          />
        ))}
      {!tableEditMode && (
        <button
          type="button"
          className="greenButton"
          onClick={() => openContextual(`addPrivateCall${week.weekId}`)}
        >
          New
        </button>
      )}
      {contextual === `addPrivateCall${week.weekId}` && (
        <NewPrivateCallView
          week={{
            weekId: week.weekId,
            studentName: week.student?.fullName,
            weekStarts: week.weekStarts ?? undefined,
          }}
        />
      )}
    </div>
  );
}
