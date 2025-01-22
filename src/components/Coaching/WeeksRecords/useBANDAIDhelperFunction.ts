import { useMemo } from 'react';
// import formatDateLikeQB from 'src/functions/formatDateLikeQB';

const useBANDAIDhelperFunction = () => {
  const dateRange = useMemo(() => {
    const nowString = Date.now();
    const now = new Date(nowString);
    // const dayOfWeek = now.getDay();
    const dayOfWeek = 2;
    const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
    const thisPastSundayString = now.getTime() - dayOfWeek * 86400000;
    const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
    const twoSundaysAgoString =
      now.getTime() - dayOfWeek * 86400000 - 1209600000;
    // const threeSundaysAgoString =
    //   now.getTime() - dayOfWeek * 86400000 - 1814400000;
    const nextSunday = new Date(nextSundayString);
    const lastSunday = new Date(lastSundayString);
    const twoSundaysAgo = new Date(twoSundaysAgoString);
    const thisPastSunday = new Date(thisPastSundayString);
    // const threeSundaysAgo = new Date(threeSundaysAgoString);

    /*
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

      return fullYear;
    }
      */
    /* ---------------------------------------------------------------- */
    /*
     * I now think that QB is giving us dates in the format of YYYY-MM-DD (iso),
     * but QB displays dates in the format of MM-DD-YYYY. unsure what our approach should be
     */
    // const nextWeekDate = `${formatYear(nextSunday)}-${formatMonth(nextSunday)}-${formatDate(nextSunday)}`;
    const nextWeekDate = nextSunday.toISOString().split('T')[0];
    // const nextWeekDate = formatDateLikeQB(nextSunday);
    // const thisWeekDate = `${formatYear(thisPastSunday)}-${formatMonth(thisPastSunday)}-${formatDate(thisPastSunday)}`;
    const thisWeekDate = thisPastSunday.toISOString().split('T')[0];
    // const thisWeekDate = formatDateLikeQB(thisPastSunday);
    // const lastSundayDate = `${formatYear(lastSunday)}-${formatMonth(lastSunday)}-${formatDate(lastSunday)}`;
    const lastSundayDate = lastSunday.toISOString().split('T')[0];
    // const lastSundayDate = formatDateLikeQB(lastSunday);
    // const twoSundaysAgoDate = `${formatYear(twoSundaysAgo)}-${formatMonth(twoSundaysAgo)}-${formatDate(twoSundaysAgo)}`;
    const twoSundaysAgoDate = twoSundaysAgo.toISOString().split('T')[0];
    // const twoSundaysAgoDate = formatDateLikeQB(twoSundaysAgo);
    // const threeSundaysAgoDate = `${formatYear(threeSundaysAgo)}-${formatMonth(threeSundaysAgo)}-${formatDate(threeSundaysAgo)}`;
    return {
      dayOfWeek,
      nextWeekDate,
      thisWeekDate,
      lastSundayDate,
      twoSundaysAgoDate,
    };
  }, []);

  return dateRange;
};

export default useBANDAIDhelperFunction;
