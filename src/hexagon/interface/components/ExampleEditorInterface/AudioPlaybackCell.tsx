import type { CellRenderProps } from '@interface/components/EditableTable/types';
import AudioControl from '@interface/components/general/AudioControl/AudioControl';
import React from 'react';

/**
 * Custom cell renderer for audio playback columns
 * Displays an AudioControl component for playing audio
 * AudioControl handles both invalid URL format and loading errors internally
 */
export function AudioPlaybackCell(props: CellRenderProps) {
  const { value } = props;
  const audioUrl = value || '';

  // Key prop forces remount when audioUrl changes, resetting state
  return <AudioControl key={audioUrl} audioLink={audioUrl} />;
}
