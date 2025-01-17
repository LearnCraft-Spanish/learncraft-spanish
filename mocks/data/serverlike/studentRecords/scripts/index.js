'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/* ------------------ Helper Functions ------------------ */
/* ------------------ Mock Data ------------------ */
function makeDateRange() {
  var nowString = Date.now();
  var now = new Date(nowString);
  var dayOfWeek = now.getDay();
  var nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
  // Last Sunday
  var lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
  var twoSundaysAgoString = now.getTime() - dayOfWeek * 86400000 - 1209600000;
  var nextSunday = new Date(nextSundayString);
  var lastSunday = new Date(lastSundayString);
  var twoSundaysAgo = new Date(twoSundaysAgoString);
  function formatMonth(date) {
    var unformattedMonth = date.getMonth() + 1;
    if (unformattedMonth < 10) {
      var formattedMonth = '0'.concat(unformattedMonth.toString());
      return formattedMonth;
    } else {
      var formattedMonth = unformattedMonth.toString();
      return formattedMonth;
    }
  }
  function formatDate(date) {
    var formattedDate = date.getDate().toString();
    return formattedDate;
  }
  function formatYear(date) {
    var fullYear = date.getFullYear().toString();
    var formattedYear = fullYear.substring(2, 4);
    return formattedYear;
  }
  var twoSundaysAgoDate = ''
    .concat(formatMonth(twoSundaysAgo), '/')
    .concat(formatDate(twoSundaysAgo), '/')
    .concat(formatYear(twoSundaysAgo));
  var lastSundayDate = ''
    .concat(formatMonth(lastSunday), '/')
    .concat(formatDate(lastSunday), '/')
    .concat(formatYear(lastSunday));
  var nextSundayDate = ''
    .concat(formatMonth(nextSunday), '/')
    .concat(formatDate(nextSunday), '/')
    .concat(formatYear(nextSunday));
  var dateArray = [twoSundaysAgoDate, lastSundayDate, nextSundayDate];
  return dateArray;
  /**
    /* week name according to QuickBase Reports | how I would identify the week  | Date (as of writing Monday 1/06)
    /* this week                                | most recent sunday             | 12/29
    /* last week                                | most recent sunday - 7 days    | 12/22
    /* two weeks ago                            | most recent sunday - 14 days   | 12/15
    /* upcoming week                            | most recent sunday (this week) | 1/05
    */
}
return makeDateRange();
