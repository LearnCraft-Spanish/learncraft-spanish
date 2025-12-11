/**
 * PasteTable Domain
 * Exports all types, interfaces, and functions
 */

export * from '@domain/PasteTable/CreateTable';

// Constants
export { GHOST_ROW_ID } from '@domain/PasteTable/CreateTable';
export * from '@domain/PasteTable/EditTable';
// Functions
export * from '@domain/PasteTable/functions';

// Interfaces
export * from '@domain/PasteTable/General'; // Includes TableHook (legacy)

// Types
export * from '@domain/PasteTable/types';
