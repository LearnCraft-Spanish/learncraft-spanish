import { AudioTranscodingContext } from '@composition/context/AudioTranscodingContext';
import React, { useMemo } from 'react';
import { useFfmpegAudio } from 'src/hexagon/infrastructure/audioTranscoding/useFfmpegAudio';

export function AudioTranscodingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioTranscoder = useFfmpegAudio();

  const value = useMemo(() => audioTranscoder, [audioTranscoder]);

  return (
    <AudioTranscodingContext value={value}>{children}</AudioTranscodingContext>
  );
}
