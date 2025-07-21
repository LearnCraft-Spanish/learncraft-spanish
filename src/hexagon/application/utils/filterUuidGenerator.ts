import type { SkillTag } from '@LearnCraft-Spanish/shared';

interface FilterParams {
  courseId: number;
  toLessonNumber: number;
  fromLessonNumber?: number;
  includeSpanglish: boolean;
  audioOnly: boolean;
  skillTags: SkillTag[];
}

/**
 * Generates a deterministic UUID based on filter parameters using crypto.randomUUID()
 * This ensures consistent sorting when paginating through results
 */
export function generateFilterUuid(params: FilterParams): string {
  // Create a deterministic string representation of the filters
  const filterString = JSON.stringify({
    courseId: params.courseId,
    toLessonNumber: params.toLessonNumber,
    fromLessonNumber: params.fromLessonNumber,
    includeSpanglish: params.includeSpanglish,
    audioOnly: params.audioOnly,
    skillTags: params.skillTags.map((tag) => tag.key).sort(), // Sort for consistency
  });

  // Generate a hash from the filter string to use as a seed
  let hash = 0;
  for (let i = 0; i < filterString.length; i++) {
    const char = filterString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to seed a simple random number generator
  let seed = Math.abs(hash);

  // Simple seeded random number generator
  function seededRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a UUID using the seeded random generator
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (seededRandom() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  return uuid;
}
