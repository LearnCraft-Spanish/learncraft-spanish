import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';

import { useState } from 'react';

import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table/Table';
import useMyRecentRecords from '../hooks/useMyRecentRecords';
import AssignmentRecordRow from './AssignmentRecordRow';
import GroupCallRecordRow from './GroupCallRecordRow';
import MonthSelector from './MonthSelector';
import PrivateCallRecordRow from './PrivateCallRecordRow';
import SectionHeader from './SectionHeader';

interface colaspableMenuObject {
  sectionTitle: string;
  colapsableMenuOpen: boolean;
}

export default function RecentRecords() {
  const defaultMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const { myRecentRecordsQuery } = useMyRecentRecords(selectedMonth);
  const [colapsableMenuObject, setColapsableMenuObject] =
    useState<colaspableMenuObject>({
      sectionTitle: 'Assignments',
      colapsableMenuOpen: false,
    });

  const updateColapsableMenuOpen = (open: boolean, title: string) => {
    setColapsableMenuObject({
      ...colapsableMenuObject,
      colapsableMenuOpen: open,
      sectionTitle: title,
    });
  };

  if (!myRecentRecordsQuery.data) return null;
  const { assignments, privateCalls, groupSessions } =
    myRecentRecordsQuery.data;

  return (
    <div>
      <h3>My Recent Records</h3>
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
      <SectionHeader
        title="Assignments"
        colapsableMenuObject={colapsableMenuObject}
        setColapsableMenuOpen={updateColapsableMenuOpen}
      />
      {colapsableMenuObject.colapsableMenuOpen &&
        colapsableMenuObject.sectionTitle === 'Assignments' && (
          <Table
            headers={[
              { header: 'Assignment', sortable: false },
              { header: 'Type', sortable: false },
              { header: 'Corrector', sortable: false },
              { header: 'Link', sortable: false },
              { header: 'Rating', sortable: false },
              { header: 'Areas of Difficulty', sortable: false },
              { header: 'Notes', sortable: false },
              { header: 'Date Created', sortable: false },
            ]}
            data={assignments}
            renderRow={(assignment) => (
              <AssignmentRecordRow
                key={assignment.recordId}
                assignment={assignment}
              />
            )}
            sortFunction={(_data: Assignment[], _sortConfig): Assignment[] => {
              return _data;
            }}
            filterFunction={(
              _data: Assignment[],
              _filterConfig,
            ): Assignment[] => {
              return _data;
            }}
          />
        )}
      {/* assignments.map((assignment) => (
            <AssignmentRecordRow
              key={assignment.recordId}
              assignment={assignment}
            />
          )) */}
      <SectionHeader
        title="Private Calls"
        colapsableMenuObject={colapsableMenuObject}
        setColapsableMenuOpen={updateColapsableMenuOpen}
      />

      {colapsableMenuObject.colapsableMenuOpen &&
        colapsableMenuObject.sectionTitle === 'Private Calls' && (
          <Table
            headers={[
              { header: 'Week', sortable: false },
              { header: 'Rating', sortable: false },
              { header: 'Areas of Difficulty', sortable: false },
              { header: 'Notes', sortable: false },
              { header: 'Recording', sortable: false },
              { header: 'Caller', sortable: false },
              { header: 'Date', sortable: false },
              { header: 'Call Type', sortable: false },
            ]}
            data={privateCalls}
            renderRow={(privateCall) => (
              <PrivateCallRecordRow
                key={privateCall.recordId}
                privateCall={privateCall}
              />
            )}
            sortFunction={(
              _data: PrivateCall[],
              _sortConfig,
            ): PrivateCall[] => {
              return _data;
            }}
            filterFunction={(
              _data: PrivateCall[],
              _filterConfig,
            ): PrivateCall[] => {
              return _data;
            }}
          />
        )}
      <SectionHeader
        title="Group Sessions"
        colapsableMenuObject={colapsableMenuObject}
        setColapsableMenuOpen={updateColapsableMenuOpen}
      />
      {colapsableMenuObject.colapsableMenuOpen &&
        colapsableMenuObject.sectionTitle === 'Group Sessions' && (
          <Table
            headers={[
              { header: 'Date', sortable: false },
              { header: 'Coach', sortable: false },
              { header: 'Zoom Link', sortable: false },
              { header: 'Topic', sortable: false },
              { header: 'Comments', sortable: false },
              { header: 'Attendees', sortable: false },
            ]}
            data={groupSessions}
            renderRow={(groupSession) => (
              <GroupCallRecordRow
                key={groupSession.recordId}
                groupCall={groupSession}
              />
            )}
            sortFunction={(
              _data: GroupSession[],
              _sortConfig,
            ): GroupSession[] => {
              return _data;
            }}
            filterFunction={(
              _data: GroupSession[],
              _filterConfig,
            ): GroupSession[] => {
              return _data;
            }}
          />
        )}
    </div>
  );
}
