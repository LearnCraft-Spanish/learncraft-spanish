import type { Coach, Course } from 'src/types/CoachingTypes';

import { useMemo } from 'react';

import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { CoachDropdown, Dropdown } from '../../general';
import getDateRange from '../../general/functions/dateRange';

import '../../coaching.scss';

interface CoachingFilterProps {
  dataReady: boolean;
  advancedFilteringMenu: boolean;
  toggleAdvancedFilteringMenu: () => void;
  filterByCoach: Coach | undefined;
  updateCoachFilter: (value: string) => void;
  filterByCourse: Course | undefined;
  updateCourseFilter: (value: string) => void;
  filterByWeeksAgo: number;
  updateWeeksAgoFilter: (value: string) => void;
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
  dataReady,
  advancedFilteringMenu,
  toggleAdvancedFilteringMenu,
  filterByCoach,
  updateCoachFilter,
  filterByCourse,
  updateCourseFilter,
  filterByWeeksAgo,
  updateWeeksAgoFilter,
  filterCoachless,
  updateCoachlessFilter,
  filterHoldWeeks,
  updateFilterHoldWeeks,
  filterByCompletion,
  updateFilterByCompletion,
  searchTerm,
  updateSearchTerm,
}: CoachingFilterProps) {
  const { courseListQuery, activeMembershipsQuery } = useCoaching();
  const { openContextual } = useContextualMenu();
  const dateRange = useMemo(() => getDateRange(), []);

  const coursesWithActiveMemberships = useMemo(() => {
    if (!courseListQuery.isSuccess || !activeMembershipsQuery.isSuccess)
      return [];
    return courseListQuery.data.filter((course) => {
      return (
        activeMembershipsQuery.data.filter(
          (membership) => membership.relatedCourse === course.recordId,
        ).length > 0
      );
    });
  }, [
    courseListQuery.data,
    courseListQuery.isSuccess,
    activeMembershipsQuery.data,
    activeMembershipsQuery.isSuccess,
  ]);

  return (
    dataReady && (
      <div className="coachingFilterSection">
        <div className="simpleFiltering">
          <CoachDropdown
            coachEmail={filterByCoach?.user.email || ''}
            onChange={updateCoachFilter}
            editMode
            defaultOptionText="Select Coach"
          />
          <Dropdown
            label="Course"
            value={filterByCourse?.name || undefined}
            onChange={updateCourseFilter}
            options={coursesWithActiveMemberships.map((course) => course.name)}
            editMode
            defaultOptionText="All Courses"
          />
          <div>
            <label htmlFor="weekRangeFilter">Week:</label>
            <select
              id="weekRangeFilter"
              onChange={(e) => updateWeeksAgoFilter(e.target.value)}
              value={filterByWeeksAgo}
            >
              <option value={0}>
                This Week {`(${dateRange.thisWeekDate})`}
              </option>
              <option value={1}>
                Last Week {`(${dateRange.lastSundayDate})`}
              </option>
              <option value={2}>
                Two Weeks Ago {`(${dateRange.twoSundaysAgoDate})`}
              </option>
              <option value={-1}>Last Three Weeks (All)</option>
            </select>
          </div>
        </div>
        <div className="advancedFilters">
          <div className="buttonBox">
            <button
              type="button"
              className="greenButton"
              onClick={() => openContextual('newAssignment')}
            >
              New Assignment
            </button>
            <button
              type="button"
              className="greenButton"
              onClick={() => openContextual('newGroupSession')}
            >
              New Group Call
            </button>
          </div>
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
                  alt="Exclude Students Without Coaches"
                  type="checkbox"
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
                  alt="Exclude Weeks on Hold"
                  type="checkbox"
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
                id="filterByCompletion"
                onChange={(e) => updateFilterByCompletion(e.target.value)}
                value={filterByCompletion}
              >
                <option value="allRecords">All Records</option>
                <option value="incompleteOnly">Incomplete Only</option>
                <option value="completeOnly">Complete Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
