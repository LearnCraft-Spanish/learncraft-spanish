import type { AudioQuizCopyInput } from '@domain/functions/audioQuizCopy';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import {
  audioQuizCopy,
  audioQuizTextRuns,
} from '@domain/functions/audioQuizCopy';
import { describe, expect, it } from 'vitest';

function input(
  overrides: Partial<AudioQuizCopyInput> = {},
): AudioQuizCopyInput {
  return {
    quizType: AudioQuizType.Speaking,
    step: AudioQuizStep.Question,
    autoplay: true,
    isLastCard: false,
    isSpanishStep: false,
    ...overrides,
  };
}

describe('audioQuizCopy — bodyKind', () => {
  it('is "sentence" on the speaking question step (English text)', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Speaking,
          step: AudioQuizStep.Question,
        }),
      ).bodyKind,
    ).toBe('sentence');
  });

  it('is "guess" on the guess step for either quiz type', () => {
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Speaking, step: AudioQuizStep.Guess }),
      ).bodyKind,
    ).toBe('guess');
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Listening, step: AudioQuizStep.Guess }),
      ).bodyKind,
    ).toBe('guess');
  });

  it('is "audioOnly" on the speaking hint step (Spanish audio, no text)', () => {
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Speaking, step: AudioQuizStep.Hint }),
      ).bodyKind,
    ).toBe('audioOnly');
  });

  it('is "sentence" on the speaking answer step (Spanish text)', () => {
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Speaking, step: AudioQuizStep.Answer }),
      ).bodyKind,
    ).toBe('sentence');
  });

  it('is "audioOnly" on the listening question step (Spanish audio, no text)', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Listening,
          step: AudioQuizStep.Question,
        }),
      ).bodyKind,
    ).toBe('audioOnly');
  });

  it('is "sentence" on the listening hint step (Spanish text)', () => {
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Listening, step: AudioQuizStep.Hint }),
      ).bodyKind,
    ).toBe('sentence');
  });

  it('is "sentence" on the listening answer step (English text)', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Listening,
          step: AudioQuizStep.Answer,
        }),
      ).bodyKind,
    ).toBe('sentence');
  });
});

describe('audioQuizCopy — instructionTitle', () => {
  it('is "Make a Guess!" on the guess step, regardless of quiz type', () => {
    expect(
      audioQuizCopy(input({ step: AudioQuizStep.Guess })).instructionTitle,
    ).toBe('Make a Guess!');
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Listening, step: AudioQuizStep.Guess }),
      ).instructionTitle,
    ).toBe('Make a Guess!');
  });

  it('is "Spanish audio playing" on an audio-only step when the step is Spanish', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Speaking,
          step: AudioQuizStep.Hint,
          isSpanishStep: true,
        }),
      ).instructionTitle,
    ).toBe('Spanish audio playing');
  });

  it('is "English audio playing" on an audio-only step when the step is English', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Listening,
          step: AudioQuizStep.Question,
          isSpanishStep: false,
        }),
      ).instructionTitle,
    ).toBe('English audio playing');
  });

  it('is null on a sentence step', () => {
    expect(
      audioQuizCopy(
        input({
          quizType: AudioQuizType.Speaking,
          step: AudioQuizStep.Question,
        }),
      ).instructionTitle,
    ).toBeNull();
    expect(
      audioQuizCopy(
        input({ quizType: AudioQuizType.Speaking, step: AudioQuizStep.Answer }),
      ).instructionTitle,
    ).toBeNull();
  });
});

describe('audioQuizCopy — primaryLabel (full matrix)', () => {
  const cases: Array<{
    quizType: AudioQuizType;
    step: AudioQuizStep;
    autoplay: boolean;
    isLastCard: boolean;
    expected: string;
  }> = [
    // Speaking, autoplay on
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Question,
      autoplay: true,
      isLastCard: false,
      expected: 'Skip to guess',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Guess,
      autoplay: true,
      isLastCard: false,
      expected: 'Play Spanish',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Hint,
      autoplay: true,
      isLastCard: false,
      expected: 'Play again',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Answer,
      autoplay: true,
      isLastCard: false,
      expected: 'Next card',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Answer,
      autoplay: true,
      isLastCard: true,
      expected: 'Finish',
    },
    // Speaking, autoplay off (guess is skipped by the caller, but the
    // label formula still matches the handoff's `primaryOff` array)
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Question,
      autoplay: false,
      isLastCard: false,
      expected: 'Play Spanish',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Guess,
      autoplay: false,
      isLastCard: false,
      expected: 'Play Spanish',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Hint,
      autoplay: false,
      isLastCard: false,
      expected: 'Play again',
    },
    {
      quizType: AudioQuizType.Speaking,
      step: AudioQuizStep.Answer,
      autoplay: false,
      isLastCard: false,
      expected: 'Next card',
    },
    // Listening, autoplay on
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Question,
      autoplay: true,
      isLastCard: false,
      expected: 'Skip to guess',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Guess,
      autoplay: true,
      isLastCard: false,
      expected: 'Show Spanish',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Hint,
      autoplay: true,
      isLastCard: false,
      expected: 'Show English',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Answer,
      autoplay: true,
      isLastCard: false,
      expected: 'Next card',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Answer,
      autoplay: true,
      isLastCard: true,
      expected: 'Finish',
    },
    // Listening, autoplay off
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Question,
      autoplay: false,
      isLastCard: false,
      expected: 'Show Spanish',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Guess,
      autoplay: false,
      isLastCard: false,
      expected: 'Show Spanish',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Hint,
      autoplay: false,
      isLastCard: false,
      expected: 'Show English',
    },
    {
      quizType: AudioQuizType.Listening,
      step: AudioQuizStep.Answer,
      autoplay: false,
      isLastCard: true,
      expected: 'Finish',
    },
  ];

  it.each(cases)(
    '$quizType / $step / autoplay=$autoplay / isLastCard=$isLastCard → $expected',
    ({ quizType, step, autoplay, isLastCard, expected }) => {
      expect(
        audioQuizCopy(input({ quizType, step, autoplay, isLastCard }))
          .primaryLabel,
      ).toBe(expected);
    },
  );
});

describe('audioQuizCopy — replayLabel', () => {
  it('speaking: "Replay English"', () => {
    const result = audioQuizCopy(input({ quizType: AudioQuizType.Speaking }));
    expect(result.replayLabel).toBe('Replay English');
  });

  it('listening: "Replay Spanish"', () => {
    const result = audioQuizCopy(input({ quizType: AudioQuizType.Listening }));
    expect(result.replayLabel).toBe('Replay Spanish');
  });
});

describe('audioQuizTextRuns', () => {
  it('returns no runs for an empty string', () => {
    expect(audioQuizTextRuns('')).toEqual([]);
  });

  it('returns a single regular run when there is no marker', () => {
    expect(audioQuizTextRuns('I will know it when they know it.')).toEqual([
      { text: 'I will know it when they know it.', bold: false },
    ]);
  });

  it('bolds only the marked word in the middle of a sentence', () => {
    expect(audioQuizTextRuns('Lo **sabré** cuando ellos lo sepan.')).toEqual([
      { text: 'Lo ', bold: false },
      { text: 'sabré', bold: true },
      { text: ' cuando ellos lo sepan.', bold: false },
    ]);
  });

  it('bolds a marker at the start of the string', () => {
    expect(audioQuizTextRuns('**Hola** Rebecca!')).toEqual([
      { text: 'Hola', bold: true },
      { text: ' Rebecca!', bold: false },
    ]);
  });

  it('bolds a marker at the end of the string', () => {
    expect(audioQuizTextRuns('Rebecca dice **hola**')).toEqual([
      { text: 'Rebecca dice ', bold: false },
      { text: 'hola', bold: true },
    ]);
  });

  it('bolds multiple markers independently', () => {
    expect(audioQuizTextRuns('**El** gato **come**.')).toEqual([
      { text: 'El', bold: true },
      { text: ' gato ', bold: false },
      { text: 'come', bold: true },
      { text: '.', bold: false },
    ]);
  });
});
