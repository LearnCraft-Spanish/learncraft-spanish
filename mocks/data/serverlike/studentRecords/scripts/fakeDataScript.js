// import mockData from './mockData.json' assert { type: 'json' };
// import newFakeData from './fakeData.json' assert { type: 'json' };
/*
--- Coach List ---
function generateFakeQBId() {
  const format = 'NNNNNNNN.LLLL';
  const result = format
    .replace(/N/g, () => Math.floor(Math.random() * 10))
    .replace(/L/g, () =>
      // lowercase letter, or number
      Math.random() < 0.3
        ? Math.floor(Math.random() * 10)
        : String.fromCharCode(97 + Math.floor(Math.random() * 26)),
    );
  return result;
}
function getNameFromEmail(email) {
  const stepOne = email.split('@')[0].split('-').join(' ');
  // remove any numbers at end
  const stepTwo = stepOne.replace(/\d+$/, '');
  // replace any - or _ with ' '
  const stepThree = stepTwo.replace(/[-_]/g, ' ');
  // capitalize first letter of each word
  const stepFour = stepThree
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return stepFour;
}
const newCoachList = mockData.coachList.map((coach, index) => {
  const newEmail = newFakeData.emails[index];
  const newFullName = getNameFromEmail(newEmail);
  // .split('@')[0]
  // .split('-')
  // .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  // .join(' ');
  return {
    ...coach,
    coach: newFullName.split(' ')[0],
    user: {
      email: newEmail,
      qbId: generateFakeQBId(),
      name: newFullName,
    },
    // ...newFakeData.coachList[index],
  };
});
console.log(JSON.stringify(newCoachList));
*/

function generateLastThreeWeeksDates() {
  // Same logic  back end uses to get the date range for querying QuickBase
  function makeDateRange() {
    const nowString = Date.now();
    const now = new Date(nowString);
    const dayOfWeek = now.getDay();
    const nextSundayString = now.getTime() - dayOfWeek * 86400000 + 604800000;
    // Last Sunday
    const lastSundayString = now.getTime() - dayOfWeek * 86400000 - 604800000;
    const twoSundaysAgoString =
      now.getTime() - dayOfWeek * 86400000 - 1209600000;
    const nextSunday = new Date(nextSundayString);
    const lastSunday = new Date(lastSundayString);
    const twoSundaysAgo = new Date(twoSundaysAgoString);
    function formatMonth(date) {
      const unformattedMonth = date.getMonth() + 1;
      if (unformattedMonth < 10) {
        const formattedMonth = `0${unformattedMonth.toString()}`;
        return formattedMonth;
      } else {
        const formattedMonth = unformattedMonth.toString();
        return formattedMonth;
      }
    }
    function formatDate(date) {
      const formattedDate = date.getDate().toString();
      return formattedDate;
    }

    function formatYear(date) {
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
    /* this week                                | most recent sunday - 7 days    | 12/29
    /* last week                                | most recent sunday - 14 days   | 12/22
    /* two weeks ago                            | most recent sunday - 21 days   | 12/15
    /* upcoming week                            | most recent sunday (this week) | 1/05
    */
  }
  // console.log(makeDateRange());
}

generateLastThreeWeeksDates();
