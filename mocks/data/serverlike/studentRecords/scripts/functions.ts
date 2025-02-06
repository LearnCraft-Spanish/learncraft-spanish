function getWeekEnds(weekStarts: string): string {
  const date = new Date(weekStarts);
  date.setDate(date.getDate() + 6);
  return formatDateLikeQB(date);
}

function formatDateLikeQB(date: Date) {
  function formatMonth(date: Date) {
    const unformattedMonth = date.getMonth() + 1;
    if (unformattedMonth < 10) {
      const formattedMonth = `0${unformattedMonth.toString()}`;
      return formattedMonth;
    } else {
      const formattedMonth = unformattedMonth.toString();
      return formattedMonth;
    }
  }
  function formatDate(date: Date) {
    const formattedDate = date.getDate().toString();
    return formattedDate;
  }

  function formatYear(date: Date) {
    const fullYear = date.getFullYear().toString();
    const formattedYear = fullYear.substring(2, 4);
    return formattedYear;
  }
  return `${formatMonth(date)}-${formatDate(date)}-${formatYear(date)}`;
}

function makeDateRange() {
  const nowString = Date.now();
  const now = new Date(nowString);
  const dayOfWeek = now.getDay();
  // const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
  const thisPastSundayString = now.getTime() - dayOfWeek * 86400000;
  const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
  const twoSundaysAgoString = now.getTime() - dayOfWeek * 86400000 - 1209600000;
  const threeSundaysAgoString =
    now.getTime() - dayOfWeek * 86400000 - 1814400000;
  // const nextSunday = new Date(nextSundayString);
  const lastSunday = new Date(lastSundayString);
  const twoSundaysAgo = new Date(twoSundaysAgoString);
  const thisPastSunday = new Date(thisPastSundayString);
  const threeSundaysAgo = new Date(threeSundaysAgoString);

  function formatMonth(date: Date) {
    const unformattedMonth = date.getMonth() + 1;
    if (unformattedMonth < 10) {
      const formattedMonth = `0${unformattedMonth.toString()}`;
      return formattedMonth;
    } else {
      const formattedMonth = unformattedMonth.toString();
      return formattedMonth;
    }
  }
  function formatDate(date: Date) {
    const formattedDate = date.getDate().toString();
    return formattedDate;
  }

  function formatYear(date: Date) {
    const fullYear = date.getFullYear().toString();
    const formattedYear = fullYear.substring(2, 4);
    return formattedYear;
  }
  // const nextSundayDate = `${formatMonth(nextSunday)}/${formatDate(nextSunday)}/${formatYear(nextSunday)}`;
  const thisWeekDate = `${formatMonth(thisPastSunday)}/${formatDate(thisPastSunday)}/${formatYear(thisPastSunday)}`;
  const lastSundayDate = `${formatMonth(lastSunday)}/${formatDate(lastSunday)}/${formatYear(lastSunday)}`;
  const twoSundaysAgoDate = `${formatMonth(twoSundaysAgo)}/${formatDate(twoSundaysAgo)}/${formatYear(twoSundaysAgo)}`;
  const threeSundaysAgoDate = `${formatMonth(threeSundaysAgo)}/${formatDate(threeSundaysAgo)}/${formatYear(threeSundaysAgo)}`;

  return {
    thisWeek: lastSundayDate,
    lastWeek: twoSundaysAgoDate,
    twoWeeksAgo: threeSundaysAgoDate,
    upcomingWeek: thisWeekDate,
  };

  /**
  /* week name according to QuickBase Reports | how I would identify the week  | Date (as of writing Monday 1/06)
  /* this week                                | most recent  sunday - 7 days           | 12/29
  /* last week                                | most recent  sunday - 14 days    | 12/22
  /* two weeks ago                            | most recent  sunday - 21 days  | 12/15
  /* upcoming week                            | most recent sunday (this week) | 1/05
  */
}

export { getWeekEnds, formatDateLikeQB, makeDateRange };
