export default function getDateRange() {
  const nowString = Date.now();
  const now = new Date(nowString);

  const dayOfWeek = now.getDay();
  const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
  const thisPastSundayString = now.getTime() - dayOfWeek * 86400000;
  const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
  const twoSundaysAgoString = now.getTime() - dayOfWeek * 86400000 - 1209600000;
  // const threeSundaysAgoString =
  //   now.getTime() - dayOfWeek * 86400000 - 1814400000;
  const nextSunday = new Date(nextSundayString);
  const thisPastSunday = new Date(thisPastSundayString);
  const lastSunday = new Date(lastSundayString);
  const twoSundaysAgo = new Date(twoSundaysAgoString);
  // const threeSundaysAgo = new Date(threeSundaysAgoString);
  /* ---------------------------------------------------------------- */
  /*
   * I now think that QB is giving us dates in the format of YYYY-MM-DD (iso),
   * but QB displays dates in the format of MM-DD-YYYY. unsure what our approach should be
   */
  const nextWeekDate = nextSunday.toISOString().split('T')[0];
  const thisWeekDate = thisPastSunday.toISOString().split('T')[0];
  const lastSundayDate = lastSunday.toISOString().split('T')[0];
  const twoSundaysAgoDate = twoSundaysAgo.toISOString().split('T')[0];
  return {
    dayOfWeek,
    nextWeekDate,
    thisWeekDate,
    lastSundayDate,
    twoSundaysAgoDate,
  };
}
