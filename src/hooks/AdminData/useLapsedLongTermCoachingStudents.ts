import type { UseLapsedLongTermCoachingStudentsReportQueryReturn } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import { useLapsedLongTermCoachingStudentsReportQuery } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';

export default function useLapsedLongTermCoachingStudents(): UseLapsedLongTermCoachingStudentsReportQueryReturn {
  const { lapsedLongTermCoachingStudentsReportQuery } =
    useLapsedLongTermCoachingStudentsReportQuery();

  return { lapsedLongTermCoachingStudentsReportQuery };
}
