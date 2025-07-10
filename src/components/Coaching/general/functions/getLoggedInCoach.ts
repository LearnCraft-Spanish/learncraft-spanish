import type { Coach } from 'src/types/CoachingTypes';

export default function getLoggedInCoach(
  userEmail: string,
  coachList: Coach[],
): Coach | null {
  const possibleEmailDomains = [
    '@learncraftspanish.com',
    '@masterofmemory.com',
  ];

  if (userEmail) {
    const currentUserCoach = coachList.find((coach) => {
      const emailPrefix = userEmail.split('@')[0].toLowerCase();
      for (const domain of possibleEmailDomains) {
        if (coach.user.email.toLowerCase() === emailPrefix + domain) {
          return true;
        }
      }
      return false;
    });
    if (currentUserCoach) return currentUserCoach;
  }
  return null;
}
