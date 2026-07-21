import { useRecentRecordsQuery } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import Dropdown from '@interface/components/FormComponents/Dropdown/Dropdown';
import { InlineLoading } from '@interface/components/Loading';
import { useMemo, useState } from 'react';
import SectionHeader from '../SectionHeader';
import SubSectionHeader from '../SubSectionHeader';
import AssignmentRecordRow from './AssignmentRecordRow';
import DisplayOnlyTable from './DisplayOnlyTable';
import GroupCallRecordRow from './GroupCallRecordRow';
import MonthYearSelector, { getDefaultMonthYear } from './MonthYearSelector';
import PrivateCallRecordRow from './PrivateCallRecordRow';
import './RecentRecords.scss';

interface CollapsibleMenuObject {
  sectionTitle: string;
  collapsibleMenuOpen: boolean;
}

function RecentRecords({ coachId }: { coachId: number }) {
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
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Assignments' && (
              <DisplayOnlyTable
                headers={[
                  'Week',
                  'Type',
                  'Corrector',
                  'Link',
                  'Rating',
                  'Areas of Difficulty',
                  'Notes',
                ]}
                data={assignments}
                renderRow={(assignment) => (
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
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Private Calls' && (
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
          />
          {collapsibleMenuObject.collapsibleMenuOpen &&
            collapsibleMenuObject.sectionTitle === 'Group Sessions' && (
              <DisplayOnlyTable
                headers={['Date', 'Coach', 'Zoom Link', 'Topic', 'Comments']}
                data={groupCalls}
                renderRow={(groupSession) => (
                  <GroupCallRecordRow
                    key={groupSession.groupSessionId}
                    groupCall={groupSession}
                  />
                )}
              />
            )}
        </>
      )}
    </div>
  );
}

export default function RecentRecordsWrapper({ coachId }: { coachId: number }) {
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
