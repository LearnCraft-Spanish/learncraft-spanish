export interface Membership {
  courseName: string;
  courseWeeklyPrivateCalls: number;
  endDate: string;
  primaryCoach: {
    email: string;
    id: string;
    name: string;
  };
  startDate: string;
  student: string;
}

export interface CoachStudentData {
  coachName: string;
  memberships: Membership[];
  totalWeeklyPrivateCalls: number;
}
