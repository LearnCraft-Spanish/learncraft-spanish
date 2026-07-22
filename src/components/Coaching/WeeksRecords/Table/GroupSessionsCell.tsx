import type {
  BaseGroupSession,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import { GroupSessionView } from '@interface/components/CoachingRecords';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';

function GroupSessionCell({
  groupSession,
  week,
  tableEditMode,
}: {
  groupSession: BaseGroupSession;
  week: FurnishedWeekWithCoach;
  tableEditMode: boolean;
}): React.JSX.Element {
  const { contextual, openContextual } = useContextualMenu();
  const contextualKey = `groupSession${groupSession.groupSessionId}week${week.weekId}`;

  return (
    <div className="cellWithContextual">
      <button type="button" onClick={() => openContextual(contextualKey)}>
        {groupSession.groupSessionType?.groupSessionType || 'Group Session'}
      </button>

      {contextual === contextualKey && (
        <GroupSessionView
          groupSession={groupSession}
          tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export default function GroupSessionsCell({
  week,
  groupSessions,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  groupSessions: BaseGroupSession[] | null;
  tableEditMode: boolean;
}): React.JSX.Element {
  return (
    <div className="callBox">
      {groupSessions?.map((groupSession) => (
        <GroupSessionCell
          groupSession={groupSession}
          key={groupSession.groupSessionId}
          week={week}
          tableEditMode={tableEditMode}
        />
      ))}
    </div>
  );
}
