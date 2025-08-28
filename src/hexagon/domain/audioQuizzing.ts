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

export const DurationSchema = z.union([
  z.number().int().positive(),
  z.literal('pending'),
]);

export const AudioQuizQuestionSchema = z.object({
  spanish: z.boolean(),
  step: z.literal(AudioQuizStep.Question),
  duration: DurationSchema,
  audioUrl: z.string().url(),
});

export type AudioQuizQuestion = z.infer<typeof AudioQuizQuestionSchema>;

export const AudioQuizGuessSchema = z.object({
  step: z.literal(AudioQuizStep.Guess),
  duration: DurationSchema,
  audioUrl: z.string().url(),
});

export type AudioQuizGuess = z.infer<typeof AudioQuizGuessSchema>;

export const AudioQuizHintSchema = z.object({
  spanish: z.literal(true),
  step: z.literal(AudioQuizStep.Hint),
  duration: DurationSchema,
  audioUrl: z.string().url(),
  padAudioUrl: z.string().url(),
});

export type AudioQuizHint = z.infer<typeof AudioQuizHintSchema>;

export const AudioQuizAnswerSchema = z.object({
  spanish: z.boolean(),
  step: z.literal(AudioQuizStep.Answer),
  duration: DurationSchema,
  audioUrl: z.string().url(),
  padAudioUrl: z.string().url(),
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

export const ListeningQuizSchema = z.array(ListeningQuizExampleSchema);

export type ListeningQuiz = z.infer<typeof ListeningQuizSchema>;

export const SpeakingQuizSchema = z.array(SpeakingQuizExampleSchema);

export type SpeakingQuiz = z.infer<typeof SpeakingQuizSchema>;

export const AudioQuizSchema = z.union([
  ListeningQuizSchema,
  SpeakingQuizSchema,
]);

export type AudioQuiz = z.infer<typeof AudioQuizSchema>;
