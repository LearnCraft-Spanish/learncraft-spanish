import type { Coach, Course } from 'src/types/CoachingTypes';

import React, { useMemo, useState } from 'react';

import { CoachDropdown, Dropdown } from 'src/components/FormComponents';
import { toReadableMonthDay } from 'src/hexagon/domain/functions/dateUtils';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';

import getDateRange from '../../general/functions/dateRange';
import useDateRange from '../useDateRange';
import '../../coaching.scss';

interface CoachingFilterProps {
  dataReady: boolean;
  filterByCoach: Coach | undefined;
  updateCoachFilter: (value: string) => void;
  filterByCourse: Course | undefined;
  updateCourseFilter: (value: string) => void;
  filterCoachless: boolean | undefined;
  updateCoachlessFilter: (value: boolean) => void;
  filterHoldWeeks: boolean | undefined;
  updateFilterHoldWeeks: (value: boolean) => void;
  filterByCompletion: string;
  updateFilterByCompletion: (value: string) => void;
  searchTerm: string | undefined;
  updateSearchTerm: (value: string) => void;
  filterByOneMonthChallenge: boolean | undefined;
  updateFilterByOneMonthChallenge: (value: boolean) => void;
}
export default function WeeksFilter({
  dataReady,
  filterByCoach,
  updateCoachFilter,
  filterByCourse,
  updateCourseFilter,
  filterCoachless,
  updateCoachlessFilter,
  filterHoldWeeks,
  updateFilterHoldWeeks,
  filterByCompletion,
  updateFilterByCompletion,
  searchTerm,
  updateSearchTerm,
  filterByOneMonthChallenge,
  updateFilterByOneMonthChallenge,
}: CoachingFilterProps) {
  const { courseListQuery, activeMembershipsQuery } = useCoaching();
  const { openContextual } = useContextualMenu();
  const { setStartDate, startDate } = useDateRange();
  const [numWeeks, setNumWeeks] = useState(4); // Start with 4 weeks
  const dateRange = useMemo(() => getDateRange(numWeeks), [numWeeks]);

  const handleLoadMore = () => {
    setNumWeeks((prev) => prev * 2);
  };

  const handleWeeksAgoChange = (value: string) => {
    if (value === 'loadMore') {
      handleLoadMore();
      // Don't update the selected value
    } else {
      setStartDate(value);
    }
  };

  const coursesWithActiveMemberships = useMemo(() => {
    if (!courseListQuery.isSuccess || !activeMembershipsQuery.isSuccess)
      return [];
    return courseListQuery.data.filter((course) => {
      // Foreign Key lookup, filter in backend
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
          <div className="weekSelector">
            <label htmlFor="weekRangeFilter">Week:</label>
            <select
              id="weekRangeFilter"
              onChange={(e) => handleWeeksAgoChange(e.target.value)}
              value={startDate}
              disabled={!dataReady}
            >
              {Array.from({ length: numWeeks }, (_, i) => {
                const dateKey =
                  i === 0
                    ? 'thisWeekDate'
                    : i === 1
                      ? 'lastSundayDate'
                      : i === 2
                        ? 'twoSundaysAgoDate'
                        : `${i + 1}SundaysAgoDate`;
                const date = dateRange[dateKey];
                const label =
                  i === 0
                    ? 'This Week'
                    : i === 1
                      ? 'Last Week'
                      : i === 2
                        ? 'Two Weeks Ago'
                        : toReadableMonthDay(date);
                return (
                  <option key={date} value={date}>
                    {i < 3 ? `${label} (${toReadableMonthDay(date)})` : label}
                  </option>
                );
              })}
              <option value="loadMore" className="loadMoreOption">
                Load More Dates...
              </option>
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
          <div className={`advancedFiltersWrapper`}>
            <div>
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
            <div className="menuRow">
              <p>Exclude 1 Month Challenge Weeks:</p>
              <label htmlFor="filterOneMonthChallenge" className="switch">
                <input
                  alt="Exclude 1 Month Challenge Weeks"
                  type="checkbox"
                  id="filterOneMonthChallenge"
                  checked={filterByOneMonthChallenge}
                  onChange={(e) =>
                    updateFilterByOneMonthChallenge(e.target.checked)
                  }
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
