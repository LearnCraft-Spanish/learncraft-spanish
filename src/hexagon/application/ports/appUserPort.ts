import type {
  AppUser,
  AppUserAbbreviation,
  roleHasChangedResponseSchema,
} from '@LearnCraft-Spanish/shared';

export interface AppUserPort {
  getMyData: () => Promise<
    AppUser | typeof roleHasChangedResponseSchema.value | null
  >;

  getAppUserByEmail: (email: string) => Promise<AppUser | null>;

  getAllAppStudents: () => Promise<AppUserAbbreviation[]>;
}
