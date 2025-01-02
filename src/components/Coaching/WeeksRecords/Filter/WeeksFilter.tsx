import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import CoachSelect from './CoachSelector';
import CourseSelector from './CourseSelector';
import type {
  Week,
  Coach,
  Student,
  Course,
  Membership,
} from '../../CoachingTypes';

import useCoaching from '../../../../hooks/useCoaching';

interface CoachingFilterProps {
  // searchTerm: string;
  // updateSearchTerm: (value: string) => void;
  // weeksToDisplay: Week[];
  // filterCoachless: number;
  // updateCoachlessFilter: (value: string) => void;
  // filterHoldWeeks: number;
  // updateHoldFilter: (value: string) => void;
  // filterIncomplete: number;
  // updateFilterIncomplete: (value: string) => void;
  // coaches: { current: Coach[] };
  // students: { current: Student[] };
  // courses: { current: Course[] };
  // memberships: { current: Membership[] };
  updateCoachFilter: (value: string) => void;
  updateCourseFilter: (value: string) => void;
  updateWeeksAgoFilter: (value: string) => void;
}
export default function WeeksFilter({
  // searchTerm,
  // updateSearchTerm,
  // weeksToDisplay,
  // filterCoachless,
  // updateCoachlessFilter,
  // filterHoldWeeks,
  // updateHoldFilter,
  // filterIncomplete,
  // updateFilterIncomplete,
  // coaches,
  // students,
  // courses,
  // memberships,
  updateCoachFilter,
  updateCourseFilter,
  updateWeeksAgoFilter,
}: CoachingFilterProps) {
  const { contextual, closeContextual, setContextualRef, openContextual } =
    useContextualMenu();

  const {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    activeStudentsQuery,
    activeMembershipsQuery,
  } = useCoaching();
  function openMoreFilters() {
    openContextual('moreFilters');
  }
  return (
    <>
      <div className="coachingFilterSection">
        <div className="numberShowing">
          <h4>Search:</h4>
        </div>
        <div className="searchOrButton">
          <input
            className="weekSearch"
            type="text"
            value={searchTerm}
            onChange={(e) => updateSearchTerm(e.target.value)}
          />
        </div>
        <div className="searchOrButton">
          <button
            type="button"
            className="moreFiltersButton"
            onClick={openMoreFilters}
          >
            More Filters
          </button>
        </div>
        <div className="numberShowing">
          <h4>
            Showing:
            {weeksToDisplay.length} records
          </h4>
        </div>
        {contextual === 'moreFilters' && (
          <div className="moreFilters" ref={setContextualRef}>
            <div className="coachingFilterSection">
              <select
                value={filterCoachless}
                onChange={(e) => updateCoachlessFilter(e.target.value)}
              >
                <option value={1}>Don't show students without coaches</option>
                <option value={0}>Show students without coaches</option>
              </select>
            </div>
            <div className="coachingFilterSection">
              <select
                value={filterHoldWeeks}
                onChange={(e) => updateHoldFilter(e.target.value)}
              >
                <option value={1}>Don't show weeks on hold</option>
                <option value={0}>Show weeks on hold</option>
              </select>
            </div>
            <div className="coachingFilterSection">
              <select
                value={filterIncomplete}
                onChange={(e) => updateFilterIncomplete(e.target.value)}
              >
                <option value={0}>All records</option>
                <option value={1}>Incomplete only</option>
                <option value={2}>Complete only</option>
              </select>
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="coachingFilterSection">
        <h2>Records Filter</h2>
        <CoachSelect updateCoachFilter={updateCoachFilter} />
        <CourseSelector updateCourseFilter={updateCourseFilter} />
        <div>
          <label htmlFor="weekRangeFilter">Week:</label>
          <select
            name="weekRangeFilter"
            id="weekRangeFilter"
            onChange={(e) => updateWeeksAgoFilter(e.target.value)}
          >
            <option value={0}>This Week</option>
            <option value={1}>Last Week</option>
            <option value={2}>Two Weeks Ago</option>
            <option value={-1}>Last Three Weeks (All)</option>
          </select>
        </div>
      </div>
    </>
  );
}
