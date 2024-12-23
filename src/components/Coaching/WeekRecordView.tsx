import React, { useState, useEffect } from 'react';
import type { Week } from './CoachingTypes';
import { useUserData } from '../../hooks/useUserData';
import { useLastThreeWeeks } from '../../hooks/useLastThreeWeeks';

export default function WeekRecordView({weekId}: {weekId: number}) {
  const userDataQuery = useUserData();
  const { lastThreeWeeksQuery } = useLastThreeWeeks();

  const [week, setWeek] = useState<Week | undefined>();

  const dataReady = userDataQuery.isSuccess && lastThreeWeeksQuery.isSuccess;

  useEffect(() => {
    if (dataReady && !week) {

    const week = lastThreeWeeksQuery.data.find((week) => week.recordId === weekId);

    if (week) {
      setWeek(week);
    } else {
      console.error(`Week with recordId ${weekId} not found`);
    }
  }
}, [dataReady, week, weekId, lastThreeWeeksQuery.data])

return (
  <div>
    {week ? (
      <div>
        <h1>Under Construction! </h1>
      </div>
    ) : (
      <p>Loading</p>
    )}
  </div>

)