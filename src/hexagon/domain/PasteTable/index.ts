/**
 * PasteTable Domain
 * Exports all types, interfaces, and functions
 */

// Types
export * from '@domain/PasteTable/types';

// Interfaces
export * from '@domain/PasteTable/General'; // Includes TableHook (legacy)
export * from '@domain/PasteTable/CreateTable';
export * from '@domain/PasteTable/EditTable';

// Functions
export * from '@domain/PasteTable/functions';

// Constants
export { GHOST_ROW_ID } from '@domain/PasteTable/CreateTable';

