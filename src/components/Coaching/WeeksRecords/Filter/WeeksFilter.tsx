import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import CoachSelect from './CoachSelector';
import CourseSelector from './CourseSelector';
import type {
  Week,
  Coach,
  Student,
  Course,
  Membership,
} from '../../../../types/CoachingTypes';

import useCoaching from '../../../../hooks/useCoaching';
import '../../styles/coaching.scss';
interface CoachingFilterProps {
  weeks: Week[] | undefined;

  updateCoachFilter: (value: string) => void;
  updateCourseFilter: (value: string) => void;
  updateWeeksAgoFilter: (value: string) => void;

  advancedFilteringMenu: boolean;
  toggleAdvancedFilteringMenu: () => void;

  filterCoachless: boolean | undefined;
  updateCoachlessFilter: (value: boolean) => void;
  filterHoldWeeks: boolean | undefined;
  updateFilterHoldWeeks: (value: boolean) => void;
  filterByCompletion: string;
  updateFilterByCompletion: (value: string) => void;
  searchTerm: string | undefined;
  updateSearchTerm: (value: string) => void;
}
export default function WeeksFilter({
  weeks,
  updateCoachFilter,
  updateCourseFilter,
  updateWeeksAgoFilter,

  advancedFilteringMenu,
  toggleAdvancedFilteringMenu,

  filterCoachless,
  updateCoachlessFilter,
  filterHoldWeeks,
  updateFilterHoldWeeks,
  filterByCompletion,
  updateFilterByCompletion,
  searchTerm,
  updateSearchTerm,
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
          <div className="advancedFilters">
            <button
              type="button"
              className={`moreFilterButton ${advancedFilteringMenu ? 'advFilterActive' : ''}`}
              onClick={toggleAdvancedFilteringMenu}
            >
              More Filters
            </button>
            <button
              type="button"
              className={`hideFilterButton ${advancedFilteringMenu ? 'advFilterActive' : ''}`}
              onClick={toggleAdvancedFilteringMenu}
            >
              Hide
            </button>

            <div
              className={`advancedFiltersWrapper ${advancedFilteringMenu ? 'advFilterActive' : ''}`}
            >
              <div>
                {/* <label htmlFor="search">Search:</label> */}
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  placeholder="Search names, emails, or notes"
                  className="searchBox"
                  onChange={(e) => updateSearchTerm(e.target.value)}
                />
              </div>
              <div className="menuRow">
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
              <div className="menuRow">
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
                <label
                  htmlFor="filterByCompletion"
                  className="filterByCompletion"
                >
                  Filter Records By Completion:
                </label>
                <select
                  name=""
                  id="filterByCompletion"
                  onChange={(e) => updateFilterByCompletion(e.target.value)}
                >
                  <option value="allRecords">All Records</option>
                  <option value="incompleteOnly">Incomplete Only</option>
                  <option value="completeOnly">Complete Only</option>
                </select>
              </div>
            </div>
          </div>
          {/* I think this will Replaced with pagination when implemented in the Table Component */}
        </div>
        <div className="numberShowing">
          <h4>
            Showing:
            {weeks.length} records
          </h4>
        </div>
      </>
    )
  );
}
