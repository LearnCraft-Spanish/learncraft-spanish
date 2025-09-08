import type {
  AudioQuizGuess,
  AudioQuizHint,
  ListeningQuizAnswer,
  ListeningQuizExample,
  ListeningQuizQuestion,
  SpeakingQuizAnswer,
  SpeakingQuizExample,
  SpeakingQuizQuestion,
} from '@domain/audioQuizzing';
import type { Example } from '@learncraft-spanish/shared';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';

const localAudioPath = '/src/assets/audio/';

const FALLBACK_GUESS_DURATION = 8;
const PADDING_DURATION = 3;

const GUESS_DISPLAY_TEXT = 'Make a guess!';
const LISTENING_QUESTION_DISPLAY_TEXT = 'Listen to Audio';
const SPEAKING_HINT_DISPLAY_TEXT = 'Listen to Audio';

export function getEmptyFilePathFromDuration(duration: number): string {
  if (duration < 1) {
    return `${localAudioPath}1s.mp3`;
  }
  if (duration > 30) {
    return `${localAudioPath}30s.mp3`;
  }
  const integerDuration = Math.round(duration);
  return `${localAudioPath}${integerDuration}s.mp3`;
}

// Overloaded function to get the question based on the audioQuizType
function getAudioQuizQuestion(
  example: Example,
  audioQuizType: AudioQuizType.Speaking,
  englishDuration: number,
  spanishDuration: number,
  autoplay: boolean,
): SpeakingQuizQuestion;
function getAudioQuizQuestion(
  example: Example,
  audioQuizType: AudioQuizType.Listening,
  englishDuration: number,
  spanishDuration: number,
  autoplay: boolean,
): ListeningQuizQuestion;
function getAudioQuizQuestion(
  example: Example,
  audioQuizType: AudioQuizType,
  englishDuration: number,
  spanishDuration: number,
  autoplay: boolean,
): SpeakingQuizQuestion | ListeningQuizQuestion {
  const baseDuration =
    audioQuizType === AudioQuizType.Speaking
      ? englishDuration
      : spanishDuration;
  const autoplayDuration = baseDuration + PADDING_DURATION;
  if (audioQuizType === AudioQuizType.Speaking) {
    return {
      spanish: false,
      step: AudioQuizStep.Question,
      displayText: example.english,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: example.englishAudio,
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies SpeakingQuizQuestion;
  } else {
    return {
      spanish: true,
      step: AudioQuizStep.Question,
      displayText: LISTENING_QUESTION_DISPLAY_TEXT,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: example.spanishAudio,
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies ListeningQuizQuestion;
  }
}

// Overloaded function to get the guess based on the spanishDuration
function getAudioQuizGuess(spanishDuration: number): AudioQuizGuess {
  const guessDuration = spanishDuration
    ? Math.round(spanishDuration * 1.5)
    : FALLBACK_GUESS_DURATION;
  return {
    step: AudioQuizStep.Guess,
    spanish: false,
    displayText: GUESS_DISPLAY_TEXT,
    duration: guessDuration,
    audioUrl: getEmptyFilePathFromDuration(guessDuration),
  } satisfies AudioQuizGuess;
}

// Overloaded function to get the hint based on the example, spanishDuration and autoplay
function getAudioQuizHint(
  example: Example,
  audioQuizType: AudioQuizType,
  spanishDuration: number,
  autoplay: boolean,
): AudioQuizHint {
  const baseDuration = spanishDuration;
  const autoplayDuration = baseDuration + PADDING_DURATION;
  if (audioQuizType === AudioQuizType.Speaking) {
    return {
      spanish: true,
      displayText: SPEAKING_HINT_DISPLAY_TEXT,
      step: AudioQuizStep.Hint,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: example.spanishAudio,
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies AudioQuizHint;
  } else {
    return {
      spanish: true,
      step: AudioQuizStep.Hint,
      displayText: example.spanish,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: example.spanishAudio,
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies AudioQuizHint;
  }
}

// Overloaded function to get the answer based on the audioQuizType, example, spanishDuration, englishDuration and autoplay
function getAudioQuizAnswer(
  audioQuizType: AudioQuizType.Speaking,
  example: Example,
  spanishDuration: number,
  englishDuration: number,
  autoplay: boolean,
): SpeakingQuizAnswer;
function getAudioQuizAnswer(
  audioQuizType: AudioQuizType.Listening,
  example: Example,
  spanishDuration: number,
  englishDuration: number,
  autoplay: boolean,
): ListeningQuizAnswer;
function getAudioQuizAnswer(
  audioQuizType: AudioQuizType,
  example: Example,
  spanishDuration: number,
  englishDuration: number,
  autoplay: boolean,
): SpeakingQuizAnswer | ListeningQuizAnswer {
  const baseDuration =
    audioQuizType === AudioQuizType.Speaking
      ? spanishDuration
      : englishDuration;
  const autoplayDuration = baseDuration + PADDING_DURATION;
  if (audioQuizType === AudioQuizType.Speaking) {
    return {
      spanish: true,
      step: AudioQuizStep.Answer,
      displayText: example.spanish,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: example.spanishAudio,
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies SpeakingQuizAnswer;
  } else {
    return {
      spanish: false,
      step: AudioQuizStep.Answer,
      displayText: example.english,
      duration: autoplay ? autoplayDuration : baseDuration,
      audioUrl: getEmptyFilePathFromDuration(baseDuration),
      padAudioDuration: PADDING_DURATION,
      padAudioUrl: getEmptyFilePathFromDuration(PADDING_DURATION),
    } satisfies ListeningQuizAnswer;
  }
}

// Finally, we put it all together to get the example with the correct types
export function getAudioQuizExample(
  example: Example,
  audioQuizType: AudioQuizType,
  spanishDuration: number,
  englishDuration: number,
  autoplay: boolean,
): ListeningQuizExample | SpeakingQuizExample {
  if (audioQuizType === AudioQuizType.Speaking) {
    return {
      type: AudioQuizType.Speaking,
      question: getAudioQuizQuestion(
        example,
        audioQuizType,
        englishDuration,
        spanishDuration,
        autoplay,
      ) satisfies SpeakingQuizQuestion,
      guess: getAudioQuizGuess(spanishDuration) satisfies AudioQuizGuess,
      hint: getAudioQuizHint(
        example,
        audioQuizType,
        spanishDuration,
        autoplay,
      ) satisfies AudioQuizHint,
      answer: getAudioQuizAnswer(
        audioQuizType,
        example,
        spanishDuration,
        englishDuration,
        autoplay,
      ) satisfies SpeakingQuizAnswer,
    } satisfies SpeakingQuizExample;
  } else {
    return {
      type: AudioQuizType.Listening,
      question: getAudioQuizQuestion(
        example,
        audioQuizType,
        englishDuration,
        spanishDuration,
        autoplay,
      ) satisfies ListeningQuizQuestion,
      guess: getAudioQuizGuess(spanishDuration) satisfies AudioQuizGuess,
      hint: getAudioQuizHint(
        example,
        audioQuizType,
        spanishDuration,
        autoplay,
      ) satisfies AudioQuizHint,
      answer: getAudioQuizAnswer(
        audioQuizType,
        example,
        spanishDuration,
        englishDuration,
        autoplay,
      ) satisfies ListeningQuizAnswer,
    } satisfies ListeningQuizExample;
  }
}
