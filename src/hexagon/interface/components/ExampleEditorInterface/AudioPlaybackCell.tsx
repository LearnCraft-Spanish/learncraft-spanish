import type { CellRenderProps } from '@interface/components/EditableTable/types';
import AudioControl from '@interface/components/general/AudioControl/AudioControl';
import React from 'react';

interface AudioErrorHandlers {
  onAudioError: (rowId: string, columnId: string) => void;
  onAudioSuccess: (rowId: string, columnId: string) => void;
}

/**
 * Custom cell renderer for audio playback columns
 * Displays an AudioControl component for playing audio
 * AudioControl handles both invalid URL format and loading errors internally
 */
export function AudioPlaybackCell(
  props: CellRenderProps & { audioErrorHandlers: AudioErrorHandlers },
) {
  const { value, row, column, audioErrorHandlers } = props;
  const audioUrl = value || '';

  // Key prop forces remount when audioUrl changes, resetting state
  return (
    <AudioControl
      key={audioUrl}
      audioLink={audioUrl}
      onError={() => audioErrorHandlers.onAudioError(row.id, column.id)}
      onSuccess={() => audioErrorHandlers.onAudioSuccess(row.id, column.id)}
    />
  );
}
