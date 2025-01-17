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
  const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
  // Last Sunday
  const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
  const twoSundaysAgoString = now.getTime() - dayOfWeek * 86400000 - 1209600000;
  const nextSunday = new Date(nextSundayString);
  const lastSunday = new Date(lastSundayString);
  const twoSundaysAgo = new Date(twoSundaysAgoString);

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

  const twoSundaysAgoDate = `${formatMonth(twoSundaysAgo)}/${formatDate(twoSundaysAgo)}/${formatYear(twoSundaysAgo)}`;
  const lastSundayDate = `${formatMonth(lastSunday)}/${formatDate(lastSunday)}/${formatYear(lastSunday)}`;
  const nextSundayDate = `${formatMonth(nextSunday)}/${formatDate(nextSunday)}/${formatYear(nextSunday)}`;
  const dateArray = [twoSundaysAgoDate, lastSundayDate, nextSundayDate];
  return dateArray;

  /**
  /* week name according to QuickBase Reports | how I would identify the week  | Date (as of writing Monday 1/06)
  /* this week                                | most recent sunday             | 12/29
  /* last week                                | most recent sunday - 7 days    | 12/22
  /* two weeks ago                            | most recent sunday - 14 days   | 12/15
  /* upcoming week                            | most recent sunday (this week) | 1/05
  */
}

export { getWeekEnds, formatDateLikeQB, makeDateRange };
