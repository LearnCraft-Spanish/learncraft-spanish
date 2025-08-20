import type {
  AppUser,
  AppUserAbbreviation,
  roleHasChangedResponseSchema,
} from '@learncraft-spanish/shared';

export interface AppUserPort {
  getMyData: () => Promise<
    AppUser | typeof roleHasChangedResponseSchema.value | null
  >;

  getAppUserByEmail: (email: string) => Promise<AppUser | null>;

  getAllAppStudents: () => Promise<AppUserAbbreviation[]>;
}
