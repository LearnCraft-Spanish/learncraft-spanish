import { useState } from 'react';
import { Link } from 'react-router-dom';
import WeeksTableItem from 'src/components/Coaching/WeeksRecords/Table/WeeksTableItem';
import ViewWeekRecord from 'src/components/Coaching/WeeksRecords/ViewWeekRecord';
import { InlineLoading } from 'src/components/Loading';
import { toReadableMonthDay } from 'src/functions/dateUtils';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useActiveCoach from '../../hooks/useActiveCoach';
import useMyIncompleteWeeklyRecords from '../../hooks/useMyIncompleteWeeklyRecords';
import DisplayOnlyTable from '../RecentRecords/DisplayOnlyTable';
import SectionHeader from '../SectionHeader';

export function IncompleteRecords() {
  const { contextual } = useContextualMenu();

  const { coach } = useActiveCoach();
  const { myIncompleteWeeklyRecords, startDate } = useMyIncompleteWeeklyRecords(
    {
      coach,
    },
  );

  return (
    <div className="coachingDashbaord__recordsToComplete">
      {myIncompleteWeeklyRecords === undefined ? (
        <InlineLoading message="Loading records..." />
      ) : (
        <>
          <p style={{ padding: '0 1rem' }}>
            {`Incomplete records for the week of: `}
            <b>{toReadableMonthDay(startDate)}</b>
          </p>
          <DisplayOnlyTable
            headers={[
              'Student',
              'Assignments',
              'Group Calls',
              'Private Calls',
              'Notes',
              'Current Lesson',
              'Hold Week',
              'Records Complete',
            ]}
            data={myIncompleteWeeklyRecords ?? []}
            renderRow={(item) => {
              return (
                <WeeksTableItem
                  key={item.id}
                  week={item}
                  updateActiveDataWeek={() => {}}
                  tableEditMode={false}
                  failedToUpdate={false}
                  hiddenFields={[]}
                />
              );
            }}
          />
          {contextual.startsWith('week') && (
            <ViewWeekRecord
              week={myIncompleteWeeklyRecords?.find(
                (week) => week.recordId === Number(contextual.split('week')[1]),
              )}
            />
          )}{' '}
        </>
      )}
    </div>
  );
}

export default function IncompleteRecordsWrapper() {
  const [isOpen, setIsOpen] = useState(true);
  const openFunctionWrapper = (_title: string) => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <SectionHeader
        title="My Incomplete Records"
        isOpen={isOpen}
        openFunction={openFunctionWrapper}
        button={
          <div className="button">
            <Link className="linkButton" to="/weeklyrecords">
              Weekly Records Interface
            </Link>
          </div>
        }
      />
      {isOpen && <IncompleteRecords />}
    </div>
  );
}
