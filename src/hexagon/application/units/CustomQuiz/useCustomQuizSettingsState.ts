import { useState } from 'react';

export function useCustomQuizSettingsState() {
  const [quizLength, setQuizLength] = useState<number>(10);
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false);
  const [audioOnly, setAudioOnly] = useState<boolean>(false);

  return {
    quizLength,
    setQuizLength,
    spanishFirst,
    setSpanishFirst,
    audioOnly,
    setAudioOnly,
  };
}
