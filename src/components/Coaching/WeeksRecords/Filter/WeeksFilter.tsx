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
  // searchTerm: string | undefined;
  // updateSearchTerm: (value: string) => void;
  weeks: Week[] | undefined;
  // filterCoachless: boolean | undefined;
  // updateCoachlessFilter: (value: boolean) => void;
  // filterHoldWeeks: boolean | undefined;
  // updateFilterHoldWeeks: (value: boolean) => void;
  // filterIncomplete: string | undefined;
  // updateFilterIncomplete: (value: string) => void;
  updateCoachFilter: (value: string) => void;
  updateCourseFilter: (value: string) => void;
  updateWeeksAgoFilter: (value: string) => void;

  advancedFilteringMenu: boolean;
  toggleAdvancedFilteringMenu: () => void;
}
export default function WeeksFilter({
  // searchTerm,
  // updateSearchTerm,
  weeks,
  // filterCoachless,
  // updateCoachlessFilter,
  // filterHoldWeeks,
  // updateFilterHoldWeeks,
  // filterIncomplete,
  // updateFilterIncomplete,
  updateCoachFilter,
  updateCourseFilter,
  updateWeeksAgoFilter,

  advancedFilteringMenu,
  toggleAdvancedFilteringMenu,
}: CoachingFilterProps) {
  const {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    activeStudentsQuery,
    activeMembershipsQuery,
  } = useCoaching();
  return (
    weeks && (
      <>
        <div className="coachingFilterSection">
          <div className="simpleFiltering">
            {/* I think this will Replaced with pagination when implemented in the Table Component */}
            {/* <div className="numberShowing">
              <h4>
                Showing:
                {weeks.length} records
              </h4>
            </div> */}
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
            <div>
              <button
                type="button"
                className="moreFiltersButton"
                onClick={toggleAdvancedFilteringMenu}
              >
                More Filters
              </button>
            </div>
          </div>
          {/*
          {advancedFilteringMenu && (
            <div className="advancedFilters">
              <div>
                <label htmlFor="search">Search:</label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => updateSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <p>Exclude Students Without Coaches:</p>
                <label htmlFor="filterCoachless" className="switch">
                  <input
                    type="checkbox"
                    name="Exclude Students Without Coaches"
                    id="filterCoachless"
                    checked={filterCoachless}
                    onChange={(e) => updateCoachlessFilter(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div>
                <p>Exclude Weeks on Hold:</p>
                <label htmlFor="filterHoldWeeks" className="switch">
                  <input
                    type="checkbox"
                    name="Exclude Weeks On Hold"
                    id="filterHoldWeeks"
                    checked={filterHoldWeeks}
                    onChange={(e) => updateFilterHoldWeeks(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div>
                <p>Filter Records By Completion:</p>
                <label htmlFor="filterIncomplete">
                  <input
                    type="radio"
                    name=""
                    id="filterIncomplete"
                    value="0"
                    checked={filterIncomplete === '0'}
                    onClick={() => updateFilterIncomplete('0')}
                  />
                  All Records
                  <input
                    type="radio"
                    name=""
                    id="filterIncomplete"
                    value="1"
                    checked={filterIncomplete === '1'}
                    onClick={() => updateFilterIncomplete('1')}
                  />
                  Incomplete Only
                  <input
                    type="radio"
                    name=""
                    id="filterIncomplete"
                    value="2"
                    checked={filterIncomplete === '2'}
                    onClick={() => updateFilterIncomplete('2')}
                  />
                  Complete Only
                </label>
              </div>
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={toggleAdvancedFilteringMenu}
                >
                  Close
                </button>
              </div>
            </div>
          )}
            */}
        </div>
        <div className="coachingFilterSection"></div>
      </>
    )
  );
}
