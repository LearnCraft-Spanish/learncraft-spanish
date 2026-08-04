import type { RecentRecords as RecentRecordsData } from '@learncraft-spanish/shared';
import { useRecentRecordsQuery } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import {
  AssignmentView,
  GroupSessionView,
  NewAssignmentView,
  NewGroupSessionView,
  NewPrivateCallView,
  PrivateCallView,
} from '@interface/components/CoachingRecords';
import Dropdown from '@interface/components/FormComponents/Dropdown/Dropdown';
import { InlineLoading } from '@interface/components/Loading';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useMemo, useState } from 'react';
import SectionHeader from '../SectionHeader';
import SubSectionHeader from '../SubSectionHeader';
import AssignmentRecordRow from './AssignmentRecordRow';
import DisplayOnlyTable from './DisplayOnlyTable';
import GroupCallRecordRow from './GroupCallRecordRow';
import MonthYearSelector, { getDefaultMonthYear } from './MonthYearSelector';
import PrivateCallRecordRow from './PrivateCallRecordRow';
import { weekStartsFromMonthYear } from './weekStartsFromMonthYear';
// Shared coaching form/table helpers (.lineWrapper used by sort controls, etc.)
import 'src/components/Coaching/coaching.scss';
import './RecentRecords.scss';

interface CollapsibleMenuObject {
  sectionTitle: string;
  collapsibleMenuOpen: boolean;
}

function parseAssignmentId(contextual: string): number | null {
  const match = /^assignment(\d+)$/.exec(contextual);
  return match ? Number(match[1]) : null;
}

function parseCallId(contextual: string): number | null {
  const match = /^call(\d+)$/.exec(contextual);
  return match ? Number(match[1]) : null;
}

function parseGroupSessionId(contextual: string): number | null {
  const match = /^groupSession(\d+)week\d+$/.exec(contextual);
  return match ? Number(match[1]) : null;
}

function RecentRecords({ coachId }: { coachId: number }): React.JSX.Element {
  const { contextual, openContextual } = useContextualMenu();
  const [selectedMonthYear, setSelectedMonthYear] = useState(
    getDefaultMonthYear(),
  );
  const { recentRecords, isLoading, isError, isSuccess } =
    useRecentRecordsQuery(String(coachId), selectedMonthYear);

  const [collapsibleMenuObject, setCollapsibleMenuObject] =
    useState<CollapsibleMenuObject>({
      sectionTitle: 'Assignments',
      collapsibleMenuOpen: false,
    });

  const [privateCallsSorting, setPrivateCallsSorting] = useState<
    'Caller Name' | 'Date'
  >('Caller Name');
  const [assignmentsSorting, setAssignmentsSorting] = useState<'Type' | 'Week'>(
    'Week',
  );

  const weekStartsDefaultValue = useMemo(
    () => weekStartsFromMonthYear(selectedMonthYear),
    [selectedMonthYear],
  );

  const updateCollapsibleMenuOpen = (title: string) => {
    if (collapsibleMenuObject.sectionTitle === title) {
      setCollapsibleMenuObject({
        collapsibleMenuOpen: !collapsibleMenuObject.collapsibleMenuOpen,
        sectionTitle: title,
      });
    } else {
      setCollapsibleMenuObject({
        collapsibleMenuOpen: true,
        sectionTitle: title,
      });
    }
  };

  const assignments = useMemo(() => {
    if (!recentRecords) return [];
    if (assignmentsSorting === 'Type') {
      return [...recentRecords.assignments].sort((a, b) =>
        a.assignmentType.assignmentType.localeCompare(
          b.assignmentType.assignmentType,
        ),
      );
    }
    return [...recentRecords.assignments].sort((a, b) => b.weekId - a.weekId);
  }, [recentRecords, assignmentsSorting]);

  const privateCalls = useMemo(() => {
    if (!recentRecords) return [];
    if (privateCallsSorting === 'Caller Name') {
      return [...recentRecords.privateCalls].sort((a, b) =>
        a.caller.fullName.localeCompare(b.caller.fullName),
      );
    }
    return [...recentRecords.privateCalls].sort(
      (a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime(),
    );
  }, [recentRecords, privateCallsSorting]);

  const groupCalls = useMemo(() => {
    return recentRecords?.groupCalls ?? [];
  }, [recentRecords]);

  const activeAssignment = useMemo(() => {
    const id = parseAssignmentId(contextual);
    if (id === null) return undefined;
    return assignments.find((assignment) => assignment.assignmentId === id);
  }, [assignments, contextual]);

  const activePrivateCall = useMemo(() => {
    const id = parseCallId(contextual);
    if (id === null) return undefined;
    return privateCalls.find((call) => call.callId === id);
  }, [contextual, privateCalls]);

  const activeGroupSession = useMemo(() => {
    const id = parseGroupSessionId(contextual);
    if (id === null) return undefined;
    return groupCalls.find((session) => session.groupSessionId === id);
  }, [contextual, groupCalls]);

  return (
    <div>
      <MonthYearSelector
        selectedMonthYear={selectedMonthYear}
        setSelectedMonthYear={setSelectedMonthYear}
      />
      {isLoading && <InlineLoading message="Loading Your Records..." />}
      {isError && <div>Error loading data, please try again.</div>}
      {isSuccess && (
        <>
          <SubSectionHeader
            title="Assignments"
            recordCountString={`${assignments.length} assignments`}
            isOpen={
              collapsibleMenuObject.collapsibleMenuOpen &&
              collapsibleMenuObject.sectionTitle === 'Assignments'
            }
            openFunction={updateCollapsibleMenuOpen}
            sortingComponent={
              <div className="sortingComponentWrapper">
                <Dropdown
                  label="Sort by"
                  editMode
                  options={['Week', 'Type']}
                  value={assignmentsSorting}
                  onChange={(value) =>
                    setAssignmentsSorting(value as 'Type' | 'Week')
                  }
                />
              </div>
            }
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => openContextual('newAssignment')}
              >
                New Assignment
              </button>
            }
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Assignments' && (
              <DisplayOnlyTable
                headers={[
                  'View',
                  'Week',
                  'Type',
                  'Corrector',
                  'Link',
                  'Rating',
                  'Areas of Difficulty',
                  'Notes',
                ]}
                data={assignments}
                renderRow={(
                  assignment: RecentRecordsData['assignments'][number],
                ) => (
                  <AssignmentRecordRow
                    key={assignment.assignmentId}
                    assignment={assignment}
                  />
                )}
              />
            )}
          <SubSectionHeader
            title="Private Calls"
            recordCountString={`${privateCalls.length} private calls`}
            isOpen={
              collapsibleMenuObject.collapsibleMenuOpen &&
              collapsibleMenuObject.sectionTitle === 'Private Calls'
            }
            openFunction={updateCollapsibleMenuOpen}
            sortingComponent={
              <div className="sortingComponentWrapper">
                <Dropdown
                  label="Sort by"
                  editMode
                  options={['Caller Name', 'Date']}
                  value={privateCallsSorting}
                  onChange={(value) =>
                    setPrivateCallsSorting(value as 'Caller Name' | 'Date')
                  }
                />
              </div>
            }
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => openContextual('newPrivateCall')}
              >
                New Private Call
              </button>
            }
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Private Calls' && (
              <DisplayOnlyTable
                headers={[
                  'View',
                  'Week',
                  'Rating',
                  'Areas of Difficulty',
                  'Notes',
                  'Recording',
                  'Caller',
                  'Date',
                  'Call Type',
                ]}
                data={privateCalls}
                renderRow={(
                  privateCall: RecentRecordsData['privateCalls'][number],
                ) => (
                  <PrivateCallRecordRow
                    key={privateCall.callId}
                    privateCall={privateCall}
                  />
                )}
              />
            )}
          <SubSectionHeader
            title="Group Sessions"
            recordCountString={`${groupCalls.length} group sessions`}
            isOpen={
              collapsibleMenuObject.collapsibleMenuOpen &&
              collapsibleMenuObject.sectionTitle === 'Group Sessions'
            }
            openFunction={updateCollapsibleMenuOpen}
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => openContextual('newGroupSession')}
              >
                New Group Session
              </button>
            }
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Group Sessions' && (
              <DisplayOnlyTable
                headers={[
                  'View',
                  'Date',
                  'Coach',
                  'Zoom Link',
                  'Topic',
                  'Comments',
                ]}
                data={groupCalls}
                renderRow={(
                  groupSession: RecentRecordsData['groupCalls'][number],
                ) => (
                  <GroupCallRecordRow
                    key={groupSession.groupSessionId}
                    groupCall={groupSession}
                  />
                )}
              />
            )}

          {contextual === 'newAssignment' && (
            <NewAssignmentView
              weekStartsDefaultValue={weekStartsDefaultValue}
            />
          )}
          {activeAssignment && (
            <AssignmentView
              assignment={activeAssignment}
              tableEditMode={false}
            />
          )}

          {contextual === 'newPrivateCall' && (
            <NewPrivateCallView
              weekStartsDefaultValue={weekStartsDefaultValue}
            />
          )}
          {activePrivateCall && (
            <PrivateCallView call={activePrivateCall} tableEditMode={false} />
          )}

          {contextual === 'newGroupSession' && (
            <NewGroupSessionView
              weekStartsDefaultValue={weekStartsDefaultValue}
            />
          )}
          {activeGroupSession && (
            <GroupSessionView
              groupSession={activeGroupSession}
              tableEditMode={false}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function RecentRecordsWrapper({
  coachId,
}: {
  coachId: number;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <SectionHeader
        title="My Recent Records"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && <RecentRecords coachId={coachId} />}
    </div>
  );
}
