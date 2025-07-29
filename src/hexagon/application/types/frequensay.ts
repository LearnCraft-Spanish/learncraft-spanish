import { z } from 'zod/v4';

export const WordCountSchema = z.object({
  word: z.string().min(1),
  count: z.number().int().positive(),
});

export type WordCount = z.infer<typeof WordCountSchema>;

// THESE SHOULD NOT LIVE HERE FOR LONG
// We need to mock useLessonSelector, so we need schema for testing

export const LessonSchema = z.object({
  lessonNumber: z.number().int().positive(),
  recordId: z.number().int().positive().max(1000000),
  courseName: z.string().min(1),
  vocabIncluded: z.array(z.string()),
  vocabKnown: z.array(z.string()),
  sortReference: z.number().int().positive().nullable(),
  relatedProgram: z.number().int().positive(),
  lesson: z.string(),
});

export type Lesson = z.infer<typeof LessonSchema>;

export const ProgramSchema = z.object({
  name: z.string().min(1),
  recordId: z.number().int().positive().max(1000000),
  lessons: z.array(LessonSchema),
});

export type Program = z.infer<typeof ProgramSchema>;
