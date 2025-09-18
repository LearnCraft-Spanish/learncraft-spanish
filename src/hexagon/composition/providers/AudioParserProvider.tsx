import { AudioParserContext } from '@composition/context/AudioParserContext';
import { useAudioParserAdapter } from '@application/adapters/audioParserAdapter';
import React, { useMemo } from 'react';

export function AudioParserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioParser = useAudioParserAdapter();

  const value = useMemo(() => audioParser, [audioParser]);

  return <AudioParserContext value={value}>{children}</AudioParserContext>;
}
