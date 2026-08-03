import { useState } from 'react';
import { Link } from 'react-router-dom';
import WeeksTable from 'src/components/Coaching/WeeksRecords/Table/WeeksTable';
import { useIncompleteWeeksForCoach } from 'src/hexagon/application/units/useIncompleteWeeksForCoach/useIncompleteWeeksForCoach';
import { toReadableMonthDay } from 'src/hexagon/domain/functions/dateUtils';
import { InlineLoading } from 'src/hexagon/interface/components/Loading';
import SectionHeader from '../SectionHeader';

function IncompleteRecords({
  coachId,
}: {
  coachId: number;
}): React.JSX.Element {
  const { weeks, startDate, loading } = useIncompleteWeeksForCoach(coachId);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="coachingDashbaord__recordsToComplete">
      <SectionHeader
        title="My Incomplete Records"
        isOpen={isOpen}
        openFunction={() => setIsOpen((prev) => !prev)}
        button={
          <div className="button">
            <Link className="linkButton" to="/weeklyrecords">
              Weekly Records Interface
            </Link>
          </div>
        }
      />
      {isOpen && (
        <>
          {loading ? (
            <InlineLoading message="Loading records..." />
          ) : (
            <>
              {weeks.length > 0 && (
                <p style={{ padding: '0 1rem' }}>
                  {`Incomplete records for the week of: `}
                  <b>{toReadableMonthDay(startDate)}</b>
                </p>
              )}
              <WeeksTable
                weeks={weeks}
                tableEditMode={false}
                hiddenFields={['primaryCoach']}
                sortByStudent={false}
                handleUpdateSortByStudent={() => {}}
                sortDirection="none"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function IncompleteRecordsWrapper({
  coachId,
}: {
  coachId: number;
}): React.JSX.Element {
  return <IncompleteRecords coachId={coachId} />;
}
