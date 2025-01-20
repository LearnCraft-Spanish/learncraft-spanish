// exact same function used for StudentRecords mock data
// need to discuss with team on what the standard for date formatting shoulf be going forward (written on 1/20/25)
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

export default formatDateLikeQB;
