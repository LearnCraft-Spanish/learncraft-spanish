import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';

import { Dropdown } from '@interface/components/FormComponents';
import { InlineLoading } from '@interface/components/Loading';
import { useMemo, useState } from 'react';
import {
  AssignmentView,
  NewAssignmentView,
} from 'src/components/Coaching/WeeksRecords/Table/AssignmentsCell';
import { GroupSessionView } from 'src/components/Coaching/WeeksRecords/Table/GroupSessionsCell';
import {
  NewPrivateCallView,
  PrivateCallView,
} from 'src/components/Coaching/WeeksRecords/Table/PrivateCallsCell';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
// import Table from 'src/components/Table/Table';
import useMyRecentRecords from '../../hooks/useMyRecentRecords';
import SectionHeader from '../SectionHeader';
import SubSectionHeader from '../SubSectionHeader';
import AssignmentRecordRow from './AssignmentRecordRow';
import DisplayOnlyTable from './DisplayOnlyTable';
import GroupCallRecordRow from './GroupCallRecordRow';
import MonthYearSelector from './MonthYearSelector';
import PrivateCallRecordRow from './PrivateCallRecordRow';

import './RecentRecords.scss';
interface colaspableMenuObject {
  sectionTitle: string;
  colapsableMenuOpen: boolean;
}

export function RecentRecords() {
  const { contextual, openContextual } = useContextualMenu();
  // make the separator a dash
  const defaultMonthYear = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
  });

  const [selectedMonthYear, setSelectedMonthYear] = useState(
    defaultMonthYear.replace('/', ':'),
  );
  const { myRecentRecordsQuery, states } =
    useMyRecentRecords(selectedMonthYear);
  const [colapsableMenuObject, setColapsableMenuObject] =
    useState<colaspableMenuObject>({
      sectionTitle: 'Assignments',
      colapsableMenuOpen: false,
    });

  const { isLoading, isError, isSuccess } = states;

  const [privateCallsSorting, setPrivateCallsSorting] = useState<
    'Student Name' | 'Date'
  >('Student Name');
  const [assignmentsSorting, setAssignmentsSorting] = useState<
    'Assignment Name' | 'Date'
  >('Date');

  const updateColapsableMenuOpen = (title: string) => {
    if (colapsableMenuObject.sectionTitle === title) {
      setColapsableMenuObject({
        colapsableMenuOpen: !colapsableMenuObject.colapsableMenuOpen,
        sectionTitle: title,
      });
    } else {
      setColapsableMenuObject({
        colapsableMenuOpen: true,
        sectionTitle: title,
      });
    }
  };
  const assignments = useMemo(() => {
    if (!myRecentRecordsQuery.data) return [];
    if (assignmentsSorting === 'Assignment Name') {
      return [...myRecentRecordsQuery.data.assignments].sort((a, b) =>
        a.assignmentName
          .split(' ')[0]
          .localeCompare(b.assignmentName.split(' ')[0]),
      );
    } else {
      return [...myRecentRecordsQuery.data.assignments].sort(
        (a, b) =>
          new Date(b.dateCreated as string).getTime() -
          new Date(a.dateCreated as string).getTime(),
      );
    }
  }, [myRecentRecordsQuery.data, assignmentsSorting]);

  const privateCalls = useMemo(() => {
    if (!myRecentRecordsQuery.data) return [];
    if (privateCallsSorting === 'Student Name') {
      return [...myRecentRecordsQuery.data.privateCalls].sort((a, b) =>
        a.weekName.split(' ')[0].localeCompare(b.weekName.split(' ')[0]),
      );
    } else {
      return [...myRecentRecordsQuery.data.privateCalls].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }
  }, [myRecentRecordsQuery.data, privateCallsSorting]);

  const groupSessions = useMemo(() => {
    return myRecentRecordsQuery.data?.groupSessions || [];
  }, [myRecentRecordsQuery.data]);

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
              colapsableMenuObject.colapsableMenuOpen &&
              colapsableMenuObject.sectionTitle === 'Assignments'
            }
            openFunction={updateColapsableMenuOpen}
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => {
                  openContextual('new-assignment');
                }}
              >
                New Assignment
              </button>
            }
            sortingComponent={
              <div className="sortingComponentWrapper">
                <Dropdown
                  label="Sort by"
                  editMode={true}
                  options={['Date', 'Assignment Name']}
                  value={assignmentsSorting}
                  onChange={(value) =>
                    setAssignmentsSorting(value as 'Assignment Name' | 'Date')
                  }
                />
              </div>
            }
          />
          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Assignments' && (
              <DisplayOnlyTable
                headers={[
                  'View',
                  'Assignment',
                  'Type',
                  'Corrector',
                  'Link',
                  'Rating',
                  'Areas of Difficulty',
                  'Notes',
                  'Date Created',
                ]}
                data={assignments}
                renderRow={(assignment) => (
                  <AssignmentRecordRow
                    key={assignment.recordId}
                    assignment={assignment}
                  />
                )}
              />
            )}
          <SubSectionHeader
            title="Private Calls"
            recordCountString={`${privateCalls.length} private calls`}
            isOpen={
              colapsableMenuObject.colapsableMenuOpen &&
              colapsableMenuObject.sectionTitle === 'Private Calls'
            }
            openFunction={updateColapsableMenuOpen}
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => {
                  openContextual('new-private-call');
                }}
              >
                New Private Call
              </button>
            }
            sortingComponent={
              <div className="sortingComponentWrapper">
                <Dropdown
                  label="Sort by"
                  editMode={true}
                  options={['Student Name', 'Date']}
                  value={privateCallsSorting}
                  onChange={(value) =>
                    setPrivateCallsSorting(value as 'Student Name' | 'Date')
                  }
                />
              </div>
            }
          />

          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Private Calls' && (
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
                renderRow={(privateCall) => (
                  <PrivateCallRecordRow
                    key={privateCall.recordId}
                    privateCall={privateCall}
                  />
                )}
              />
            )}
          <SubSectionHeader
            title="Group Sessions"
            recordCountString={`${groupSessions.length} group sessions`}
            isOpen={
              colapsableMenuObject.colapsableMenuOpen &&
              colapsableMenuObject.sectionTitle === 'Group Sessions'
            }
            openFunction={updateColapsableMenuOpen}
            button={
              <button
                type="button"
                className="newRecordButton"
                onClick={() => {
                  openContextual('new-group-call');
                }}
              >
                New Group Call
              </button>
            }
          />
          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Group Sessions' && (
              <DisplayOnlyTable
                headers={[
                  'View',
                  'Date',
                  'Coach',
                  'Zoom Link',
                  'Topic',
                  'Comments',
                  // 'Attendees',
                ]}
                data={groupSessions}
                renderRow={(groupSession) => (
                  <GroupCallRecordRow
                    key={groupSession.recordId}
                    groupCall={groupSession}
                  />
                )}
              />
            )}
          {/* contextuals records */}
          {contextual === 'new-assignment' && (
            <NewAssignmentViewWrapper
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
          {contextual.startsWith('assignment') && (
            <AssignmentViewWrapper
              assignment={assignments.find(
                (assignment) =>
                  assignment.recordId ===
                  Number(contextual.split('assignment-')[1])!,
              )}
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
          {/* 
          ------------------------------------------------------------
          New private call veiw is going to take more work to refactor, coming back to this
          ------------------------------------------------------------
          */}
          {contextual === 'new-private-call' && (
            <NewPrivateCallViewWrapper
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
          {contextual.startsWith('private-call') && (
            <PrivateCallViewWrapper
              privateCall={privateCalls.find(
                (privateCall) =>
                  privateCall.recordId ===
                  Number(contextual.split('private-call-')[1])!,
              )}
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
          {contextual === 'new-group-call' && (
            <NewGroupCallViewWrapper
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
          {contextual.startsWith('group-call') && (
            <GroupCallViewWrapper
              groupCall={groupSessions.find(
                (groupCall) =>
                  groupCall.recordId ===
                  Number(contextual.split('group-call-')[1])!,
              )}
              onSuccess={() => {
                myRecentRecordsQuery.refetch();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function RecentRecordsWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <SectionHeader
        title="My Recent Records"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && <RecentRecords />}
    </div>
  );
}

/* temp, remove or move to new file */
function AssignmentViewWrapper({
  assignment,
  onSuccess,
}: {
  assignment: Assignment | undefined;
  onSuccess: () => void;
}) {
  // const { contextual } = useContextualMenu();
  if (!assignment) return null;
  return <AssignmentView assignment={assignment} onSuccess={onSuccess} />;
}
function NewAssignmentViewWrapper({ onSuccess }: { onSuccess: () => void }) {
  // Calculate startDate using logic from DateRangeProvider
  const startDate = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    // Generate dates array similar to dateRange
    const dates = Array.from({ length: 2 }, (_, i) => {
      const msOffset = i * weekInMs;
      const date = new Date(now.getTime() - dayOfWeek * 86400000 - msOffset);
      return {
        date: date.toISOString().split('T')[0],
      };
    });

    // Use this week's date if day >= 3 (Wednesday-Saturday), otherwise use last week's date
    return dayOfWeek >= 3 ? dates[0].date : dates[1].date;
  }, []);
  return (
    <NewAssignmentView
      weekStartsDefaultValue={startDate}
      onSuccess={onSuccess}
    />
  );
}

function PrivateCallViewWrapper({
  privateCall,
  onSuccess,
}: {
  privateCall: PrivateCall | undefined;
  onSuccess: () => void;
}) {
  if (!privateCall) return null;
  return <PrivateCallView call={privateCall} onSuccess={onSuccess} />;
}

function NewPrivateCallViewWrapper({ onSuccess }: { onSuccess: () => void }) {
  const startDate = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    // Generate dates array similar to dateRange
    const dates = Array.from({ length: 2 }, (_, i) => {
      const msOffset = i * weekInMs;
      const date = new Date(now.getTime() - dayOfWeek * 86400000 - msOffset);
      return {
        date: date.toISOString().split('T')[0],
      };
    });

    // Use this week's date if day >= 3 (Wednesday-Saturday), otherwise use last week's date
    return dayOfWeek >= 3 ? dates[0].date : dates[1].date;
  }, []);
  return (
    <NewPrivateCallView
      weekStartsDefaultValue={startDate}
      onSuccess={onSuccess}
    />
  );
}

function GroupCallViewWrapper({
  groupCall,
  onSuccess,
}: {
  groupCall: GroupSession | undefined;
  onSuccess: () => void;
}) {
  if (!groupCall) return null;
  return <GroupSessionView groupSession={groupCall} onSuccess={onSuccess} />;
}

function NewGroupCallViewWrapper({ onSuccess }: { onSuccess: () => void }) {
  return (
    <GroupSessionView
      groupSession={{ recordId: -1 } as GroupSession}
      newRecord
      onSuccess={onSuccess}
    />
  );
}
