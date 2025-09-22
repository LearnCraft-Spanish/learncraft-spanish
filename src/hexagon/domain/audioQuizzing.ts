import { z } from 'zod';

export enum AudioQuizStep {
  Question = 'question',
  Guess = 'guess',
  Hint = 'hint',
  Answer = 'answer',
}

export enum AudioQuizType {
  Speaking = 'speaking',
  Listening = 'listening',
}

export const AudioQuizTypeSchema = z.nativeEnum(AudioQuizType);

export const AudioQuizStepPropertiesSchema = z.object({
  step: z.nativeEnum(AudioQuizStep),
  spanish: z.boolean(),
  displayText: z.string().min(1),
  blobUrl: z.string().url(),
  duration: z.number().positive(),
});

export type AudioQuizStepProperties = z.infer<
  typeof AudioQuizStepPropertiesSchema
>;

export const AudioQuizQuestionSchema = AudioQuizStepPropertiesSchema.extend({
  step: z.literal(AudioQuizStep.Question),
});

export type AudioQuizQuestion = z.infer<typeof AudioQuizQuestionSchema>;

export const AudioQuizGuessSchema = AudioQuizStepPropertiesSchema.extend({
  step: z.literal(AudioQuizStep.Guess),
  spanish: z.literal(false),
});

export type AudioQuizGuess = z.infer<typeof AudioQuizGuessSchema>;

export const AudioQuizHintSchema = AudioQuizStepPropertiesSchema.extend({
  step: z.literal(AudioQuizStep.Hint),
  spanish: z.literal(true),
});

export type AudioQuizHint = z.infer<typeof AudioQuizHintSchema>;

export const AudioQuizAnswerSchema = AudioQuizStepPropertiesSchema.extend({
  step: z.literal(AudioQuizStep.Answer),
});

export type AudioQuizAnswer = z.infer<typeof AudioQuizAnswerSchema>;

export const SpeakingQuizQuestionSchema = AudioQuizQuestionSchema.extend({
  spanish: z.literal(false),
});

export type SpeakingQuizQuestion = z.infer<typeof SpeakingQuizQuestionSchema>;

export const ListeningQuizQuestionSchema = AudioQuizQuestionSchema.extend({
  spanish: z.literal(true),
});

export type ListeningQuizQuestion = z.infer<typeof ListeningQuizQuestionSchema>;

export const SpeakingQuizAnswerSchema = AudioQuizAnswerSchema.extend({
  spanish: z.literal(true),
});

export type SpeakingQuizAnswer = z.infer<typeof SpeakingQuizAnswerSchema>;

export const ListeningQuizAnswerSchema = AudioQuizAnswerSchema.extend({
  spanish: z.literal(false),
});

export type ListeningQuizAnswer = z.infer<typeof ListeningQuizAnswerSchema>;

export const ListeningQuizExampleSchema = z.object({
  type: z.literal(AudioQuizType.Listening),
  question: ListeningQuizQuestionSchema,
  guess: AudioQuizGuessSchema,
  hint: AudioQuizHintSchema,
  answer: ListeningQuizAnswerSchema,
});

export type ListeningQuizExample = z.infer<typeof ListeningQuizExampleSchema>;

export const SpeakingQuizExampleSchema = z.object({
  type: z.literal(AudioQuizType.Speaking),
  question: SpeakingQuizQuestionSchema,
  guess: AudioQuizGuessSchema,
  hint: AudioQuizHintSchema,
  answer: SpeakingQuizAnswerSchema,
});

export type SpeakingQuizExample = z.infer<typeof SpeakingQuizExampleSchema>;

export const AudioQuizExampleSchema = z.object({
  speaking: SpeakingQuizExampleSchema,
  listening: ListeningQuizExampleSchema,
});

export type AudioQuizExample = z.infer<typeof AudioQuizExampleSchema>;

// NOTE: NO TYPES FOR COMPLETE AUDIO QUIZ.
// THE FULL ARRAYS ARE NOT AVAILABLE UPON INITIAL LOAD.
// WE MUST DERIVE ONE AT A TIME.
