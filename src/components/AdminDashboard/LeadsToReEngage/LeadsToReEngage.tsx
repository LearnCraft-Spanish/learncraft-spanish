import { useMemo, useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useLeadsToReEngage from 'src/hooks/AdminData/useLeadsToReEngage';
import LeadsToReEngageCoachSection from './LeadsToReEngageCoachSection';
import './LeadsToReEngage.scss';

export default function LeadsToReEngage() {
  const { leadsToReEngageReportQuery } = useLeadsToReEngage();
  const coachReports = leadsToReEngageReportQuery.data ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const [openCoachIds, setOpenCoachIds] = useState<Set<number>>(new Set());

  const allCoachesOpen = useMemo(
    () =>
      coachReports.length > 0 &&
      coachReports.every((report) => openCoachIds.has(report.coach.coach_id)),
    [coachReports, openCoachIds],
  );

  function toggleCoach(coachId: number) {
    setOpenCoachIds((previouslyOpenCoachIds) => {
      const nextOpenCoachIds = new Set(previouslyOpenCoachIds);
      if (nextOpenCoachIds.has(coachId)) {
        nextOpenCoachIds.delete(coachId);
      } else {
        nextOpenCoachIds.add(coachId);
      }
      return nextOpenCoachIds;
    });
  }

  function toggleAllCoaches() {
    setOpenCoachIds(
      allCoachesOpen
        ? new Set()
        : new Set(coachReports.map((report) => report.coach.coach_id)),
    );
  }

  return (
    <div className="leadsToReEngage">
      <SectionHeader
        title="Leads to Re-engage"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
        button={
          <div className="button">
            <button
              type="button"
              className="leadsToReEngage__toggleAllButton"
              onClick={toggleAllCoaches}
              disabled={coachReports.length === 0}
            >
              {allCoachesOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        }
      />
      {isOpen && (
        <>
          {coachReports.length > 0 ? (
            coachReports.map((coachReport) => (
              <LeadsToReEngageCoachSection
                key={coachReport.coach.coach_id}
                coachReport={coachReport}
                isOpen={openCoachIds.has(coachReport.coach.coach_id)}
                toggleOpen={() => toggleCoach(coachReport.coach.coach_id)}
              />
            ))
          ) : (
            <DisplayOnlyTable
              headers={['Coach']}
              data={[]}
              renderRow={() => null}
            />
          )}
        </>
      )}
    </div>
  );
}
