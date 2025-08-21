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
});

export type Answer = z.infer<typeof AnswerSchema>;

export const FlashcardDisplaySchema = z.object({
  question: QuestionSchema,
  answer: AnswerSchema,
});

export type FlashcardDisplay = z.infer<typeof FlashcardDisplaySchema>;
