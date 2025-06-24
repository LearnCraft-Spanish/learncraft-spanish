import type { AppUser, AppUserAbbreviation } from '@LearnCraft-Spanish/shared';

export interface AppUserPort {
  getAppUserByEmail: (email: string) => Promise<AppUser>;

  getAllAppStudents: () => Promise<AppUserAbbreviation[]>;
}
