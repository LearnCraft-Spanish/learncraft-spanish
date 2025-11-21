// WARNING, this needs to be moved to shard package, or frontend-specific domain
import { z } from 'zod';

const ExamplesEditTableRowSchema = z.object({
  recordId: z.number(),
  englishText: z.string(),
  spanishText: z.string(),
  hasAudio: z.boolean(),
  spanglish: z.string(),
});

export type ExamplesEditTableRow = z.infer<typeof ExamplesEditTableRowSchema>;

/**
 * Validate a ExamplesEditTableRow object
 */
export function validateExamplesEditTableRow(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  try {
    ExamplesEditTableRowSchema.parse(data);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}
