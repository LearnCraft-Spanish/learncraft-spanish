export type PreviewRole = 'student' | 'coach' | 'admin' | 'limited' | 'free';

const ALLOWED_ROLES: ReadonlySet<string> = new Set([
  'student',
  'coach',
  'admin',
  'limited',
  'free',
]);

/**
 * Sole reader of `?role=` for gauntlet preview stubs.
 * Unknown / missing values default to `'student'`.
 */
export function readPreviewRole(): PreviewRole {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('role') ?? 'student').toLowerCase();
  if (ALLOWED_ROLES.has(raw)) {
    return raw as PreviewRole;
  }
  return 'student';
}

export function emailForRole(role: PreviewRole): string {
  return `gauntlet-${role}@fake.not`;
}
