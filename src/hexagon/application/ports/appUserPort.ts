import type { AppUser, AppUserAbbreviation } from '@LearnCraft-Spanish/shared';

export interface AppUserPort {
  getMyData: () => Promise<AppUser>;

  getAppUserByEmail: (email: string) => Promise<AppUser | null>;

  getAllAppStudents: () => Promise<AppUserAbbreviation[]>;
}
