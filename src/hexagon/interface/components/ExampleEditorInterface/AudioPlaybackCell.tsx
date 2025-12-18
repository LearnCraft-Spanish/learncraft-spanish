import type { CellRenderProps } from '@interface/components/EditableTable/types';
import AudioControl from '@interface/components/general/AudioControl/AudioControl';
import React from 'react';

/**
 * Custom cell renderer for audio playback columns
 * Displays an AudioControl component for playing audio
 */
export function AudioPlaybackCell(props: CellRenderProps) {
  const { value } = props;
  const audioUrl = value || '';

  return <AudioControl audioLink={audioUrl} />;
}

