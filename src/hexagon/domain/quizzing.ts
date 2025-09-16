import { VocabularySchema } from '@learncraft-spanish/shared';
import z from 'zod';

export const QuestionSchema = z.object({
  spanish: z.boolean(),
  text: z.string(),
  hasAudio: z.boolean(),
  audioUrl: z.string().url(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const AnswerSchema = z.object({
  spanish: z.boolean(),
  text: z.string(),
  hasAudio: z.boolean(),
  audioUrl: z.string().url(),
  owned: z.boolean(),
  addFlashcard: z.function().args(z.number()).returns(z.void()),
  removeFlashcard: z.function().args(z.number()).returns(z.void()),
  vocabComplete: z.boolean(),
  vocabulary: z.array(VocabularySchema),
  updateFlashcardInterval: z
    .function()
    .args(z.number(), z.enum(['easy', 'hard']))
    .returns(z.void()),
});

export type Answer = z.infer<typeof AnswerSchema>;

export const FlashcardForDisplaySchema = z.object({
  question: QuestionSchema,
  answer: AnswerSchema,
  exampleIsCollected: z.boolean(),
  exampleIsCustom: z.boolean(),
  exampleIsAdding: z.boolean(),
  exampleIsRemoving: z.boolean(),
});

export type FlashcardForDisplay = z.infer<typeof FlashcardForDisplaySchema>;
