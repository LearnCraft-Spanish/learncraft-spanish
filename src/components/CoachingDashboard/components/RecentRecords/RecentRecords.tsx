import type { Assignment } from 'src/types/CoachingTypes';

import { useMemo, useState } from 'react';
import {
  AssignmentView,
  NewAssignmentView,
} from 'src/components/Coaching/WeeksRecords/Table/AssignmentsCell';
import { InlineLoading } from 'src/components/Loading';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
// import Table from 'src/components/Table/Table';
import useMyRecentRecords from '../../hooks/useMyRecentRecords';
import SectionHeader from '../SectionHeader';
import SubSectionHeader from '../SubSectionHeader';
import AssignmentRecordRow from './AssignmentRecordRow';
import DisplayOnlyTable from './DisplayOnlyTable';
import GroupCallRecordRow from './GroupCallRecordRow';
import MonthSelector from './MonthSelector';
import PrivateCallRecordRow from './PrivateCallRecordRow';
interface colaspableMenuObject {
  sectionTitle: string;
  colapsableMenuOpen: boolean;
}

export function RecentRecords() {
  const { contextual, openContextual } = useContextualMenu();
  // make the separator a dash
  const defaultMonth = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
  });

  const [selectedMonth, setSelectedMonth] = useState(
    defaultMonth.replace('/', ':'),
  );
  const { myRecentRecordsQuery, states } = useMyRecentRecords(selectedMonth);
  const [colapsableMenuObject, setColapsableMenuObject] =
    useState<colaspableMenuObject>({
      sectionTitle: 'Assignments',
      colapsableMenuOpen: false,
    });

  const { isLoading, isError, isSuccess } = states;

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
    return myRecentRecordsQuery.data?.assignments || [];
  }, [myRecentRecordsQuery.data]);
  const privateCalls = useMemo(() => {
    return myRecentRecordsQuery.data?.privateCalls || [];
  }, [myRecentRecordsQuery.data]);
  const groupSessions = useMemo(() => {
    return myRecentRecordsQuery.data?.groupSessions || [];
  }, [myRecentRecordsQuery.data]);

  return (
    <div>
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
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
                onClick={(e) => {
                  e.preventDefault();
                  openContextual('new-assignment');
                }}
              >
                New Assignment
              </button>
            }
          />
          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Assignments' && (
              <DisplayOnlyTable
                headers={[
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
          />

          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Private Calls' && (
              <DisplayOnlyTable
                headers={[
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
          />
          {colapsableMenuObject.colapsableMenuOpen &&
            colapsableMenuObject.sectionTitle === 'Group Sessions' && (
              <DisplayOnlyTable
                headers={[
                  'Date',
                  'Coach',
                  'Zoom Link',
                  'Topic',
                  'Comments',
                  'Attendees',
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
          {contextual === 'new-assignment' && <NewAssignmentViewWrapper />}
          {/* {contextual.startsWith('assignment') && (
            <AssignmentViewWrapper
              assignment={assignments.find(
                (assignment) =>
                  assignment.recordId ===
                  Number(contextual.split('assignment')[1])!,
              )}
            />
          )} */}
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
function _AssignmentViewWrapper({
  assignment,
}: {
  assignment: Assignment | undefined;
}) {
  // const { contextual } = useContextualMenu();
  if (!assignment) return null;
  return <AssignmentView assignment={assignment} />;
}
function NewAssignmentViewWrapper() {
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
  return <NewAssignmentView weekStartsDefaultValue={startDate} />;
}
