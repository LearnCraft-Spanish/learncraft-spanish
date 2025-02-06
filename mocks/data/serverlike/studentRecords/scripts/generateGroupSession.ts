import type { GroupSession, QbUser } from 'src/types/CoachingTypes';
/* ------------------ Helper Functions ------------------ */

/* ------------------ Mock Data ------------------ */
const sessionTypes = [
  '1MC',
  '2MC',
  'LCS Cohort',
  'Level 1',
  'Level 2',
  'Level 3',
];
const topics = ['Sentences', 'Conversation', 'LCS week 1', 'Internet'];
const zoomLinks = ['https://google.com'];
const callDocuments = [
  'https://google.com',
  '',
  'recording not avaliable, please contact coach',
];
const comments = ['', 'basic conversation', 'Alumni'];

/* ------------------ Main Function ------------------ */
function generateGroupSession({
  date,
  coach,
}: {
  date: string;
  coach: QbUser;
}): GroupSession {
  return {
    recordId: Math.floor(Math.random() * 10000),
    date,
    coach,
    zoomLink: zoomLinks[Math.floor(Math.random() * zoomLinks.length)],
    topic: topics[Math.floor(Math.random() * topics.length)],
    comments: comments[Math.floor(Math.random() * comments.length)],
    sessionType: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
    callDocument:
      callDocuments[Math.floor(Math.random() * callDocuments.length)],
  };
}

export default generateGroupSession;
