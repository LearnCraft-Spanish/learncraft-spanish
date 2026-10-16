export type UiVersion = 'v1' | 'v2';

/**
 * The redesign is rolled out to every visitor. `v1` stays in the type until
 * the v1 surfaces that still branch on it are deleted.
 */
export const CURRENT_UI_VERSION: UiVersion = 'v2';
