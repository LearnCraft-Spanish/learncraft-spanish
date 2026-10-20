import type { UseLapsedLongTermCoachingStudentsReportResult } from '@application/useCases/useLapsedLongTermCoachingStudentsReport/useLapsedLongTermCoachingStudentsReport';
import type { LapsedStudentSort } from '@domain/functions/lapsedLongTermCoachingStudents';
import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { usePagination } from '@application/units/Pagination/usePagination';
import { useLapsedLongTermCoachingStudentsReport } from '@application/useCases/useLapsedLongTermCoachingStudentsReport/useLapsedLongTermCoachingStudentsReport';
import { isLapsedStudentSortColumn } from '@domain/functions/lapsedLongTermCoachingStudents';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Field } from '@interface/components/general/Field/Field';
import Pagination from '@interface/components/general/Pagination/Pagination';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { Select } from '@interface/components/general/Select/Select';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { InlineLoading } from '@interface/components/Loading';
import { useState } from 'react';
import {
  MultiSelectSearch,
  SelectedOptionChips,
} from 'src/components/AdminDashboard/MultiSelectSearch';
import styles from './LapsedLongTermCoachingStudentsReport.module.scss';

const TITLE = 'Lapsed Long-Term Coaching Students';
const STUDENTS_PER_PAGE = 20;

const SORT_COLUMNS: { value: LapsedStudentSort['column']; label: string }[] = [
  { value: 'mostRecent', label: 'Most recent membership' },
  { value: 'coach', label: 'Coach' },
  { value: 'membershipType', label: 'Membership type' },
];

/**
 * Dates arrive as `YYYY-MM-DD`, or `''` when the source date is missing.
 * Shown as month/day/year from the string itself, so a US timezone does not
 * shift them back a day.
 */
function formatReportDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return '';
  }
  const [year, month, day] = value.split('-');
  return `${Number(month)}/${Number(day)}/${year}`;
}

function membershipDates(startDate: string, endDate: string): string {
  const start = formatReportDate(startDate);
  const end = formatReportDate(endDate);
  if (start && end) {
    return `${start} – ${end}`;
  }
  return start || end;
}

function visibleCountLabel(visible: number, total: number): string {
  if (visible === total) {
    return `${visible} student${visible === 1 ? '' : 's'}`;
  }
  return `${visible} of ${total} students`;
}

function directionLabel(sort: LapsedStudentSort): string {
  if (sort.column === 'mostRecent') {
    return sort.direction === 'descending' ? 'Newest first' : 'Oldest first';
  }
  return sort.direction === 'ascending' ? 'A to Z' : 'Z to A';
}

interface LapsedLongTermCoachingStudentsTableProps {
  students: LapsedLongTermCoachingStudent[];
}

function LapsedLongTermCoachingStudentsTable({
  students,
}: LapsedLongTermCoachingStudentsTableProps): JSX.Element {
  const {
    pageNumber,
    maxPageNumber,
    nextPage,
    previousPage,
    startIndex,
    endIndex,
  } = usePagination({
    itemsPerPage: STUDENTS_PER_PAGE,
    totalItems: students.length,
  });

  if (students.length === 0) {
    return <p className={styles.empty}>No records found</p>;
  }

  const pageStudents = students.slice(startIndex, endIndex);

  return (
    <div className={styles.tableWrap}>
      <Pagination
        page={pageNumber}
        maxPage={maxPageNumber}
        nextPage={nextPage}
        previousPage={previousPage}
      />
      <table className={styles.table}>
        <caption className={styles.caption}>{TITLE}</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Previous Coach</th>
            <th>Previous Memberships</th>
          </tr>
        </thead>
        <tbody>
          {pageStudents.map((student) => (
            <tr key={student.student_id}>
              <td>{student.fullName}</td>
              <td>{student.email}</td>
              <td>{student.previousPrimaryCoach || '—'}</td>
              <td>
                <ul className={styles.memberships}>
                  {student.previousMemberships.map((membership) => {
                    const dates = membershipDates(
                      membership.startDate,
                      membership.endDate,
                    );
                    return (
                      <li
                        key={`${student.student_id}-${membership.courseName}-${membership.startDate}-${membership.endDate}`}
                      >
                        <span className={styles.membershipCourse}>
                          {membership.courseName}
                        </span>
                        {dates && (
                          <span className={styles.membershipDates}>
                            {dates}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LapsedLongTermCoachingStudentsControls({
  report,
}: {
  report: UseLapsedLongTermCoachingStudentsReportResult;
}): JSX.Element {
  return (
    <div className={styles.toolbar}>
      <div className={styles.controls}>
        <div className={styles.search}>
          <Field htmlFor="lapsed-students-search" label="Search students">
            <TextInput
              id="lapsed-students-search"
              type="search"
              value={report.search}
              onChange={report.setSearch}
              placeholder="Name or email"
              leadingIcon="search"
              onClear={() => report.setSearch('')}
              clearLabel="Clear student search"
            />
          </Field>
        </div>
        <div className={styles.coach}>
          <Field htmlFor="lapsed-students-coach" label="Coach">
            <Select
              id="lapsed-students-coach"
              value={report.coachFilter}
              options={report.coachOptions}
              onChange={report.setCoachFilter}
            />
          </Field>
        </div>
        <div className={styles.membershipTypes}>
          <Field
            htmlFor="lapsed-students-membership-types"
            label="Membership types"
          >
            <MultiSelectSearch
              id="lapsed-students-membership-types"
              options={report.membershipTypeOptions}
              selected={report.membershipTypeFilter}
              onChange={report.setMembershipTypeFilter}
              listLabel="Membership types"
              placeholder="All types — search to filter"
            />
          </Field>
        </div>
        <div className={styles.sort}>
          <Field htmlFor="lapsed-students-sort" label="Sort by">
            <Select
              id="lapsed-students-sort"
              value={report.sort.column}
              options={SORT_COLUMNS}
              onChange={(column) => {
                if (isLapsedStudentSortColumn(column)) {
                  report.setSortColumn(column);
                }
              }}
            />
          </Field>
          <Button
            variant="secondary"
            leadingIcon={
              report.sort.direction === 'ascending' ? 'arrowUp' : 'arrowDown'
            }
            onClick={report.toggleSortDirection}
          >
            {directionLabel(report.sort)}
          </Button>
        </div>
      </div>
      <SelectedOptionChips
        label="Selected membership types"
        options={report.membershipTypeOptions}
        selected={report.membershipTypeFilter}
        onChange={report.setMembershipTypeFilter}
      />
      {report.totalCount > 0 && (
        <p className={styles.count}>
          {visibleCountLabel(report.students.length, report.totalCount)}
        </p>
      )}
    </div>
  );
}

function LapsedLongTermCoachingStudentsBody(): JSX.Element | null {
  const report = useLapsedLongTermCoachingStudentsReport();

  if (report.isLoading) {
    return <InlineLoading message="Loading lapsed students..." />;
  }
  if (report.isError) {
    return <p className={styles.error}>Could not load this report.</p>;
  }
  if (!report.isSuccess) {
    return null;
  }

  return (
    <>
      <LapsedLongTermCoachingStudentsControls report={report} />
      <LapsedLongTermCoachingStudentsTable
        key={`${report.search}|${report.coachFilter}|${report.membershipTypeFilter.join('\u0000')}|${report.sort.column}|${report.sort.direction}`}
        students={report.students}
      />
    </>
  );
}

export function LapsedLongTermCoachingStudentsReport(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section aria-label={TITLE}>
      <SectionHeader
        title={TITLE}
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && <LapsedLongTermCoachingStudentsBody />}
    </section>
  );
}
