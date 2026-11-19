import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { AudioPlaybackCell } from '@interface/components/ExampleEditorInterface/AudioPlaybackCell';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const audioUrl = 'https://example.com/ex1la.mp3';

function renderCell(value: string) {
  const audioErrorHandlers = makeHandlers();
  const cellProps = {
    value,
    row: { id: 'row-7', cells: {} },
    column: { id: 'spanishAudio', type: 'text', editable: false },
  } as unknown as CellRenderProps;
  const view = render(
    <AudioPlaybackCell
      {...cellProps}
      audioErrorHandlers={audioErrorHandlers}
    />,
  );
  return { ...view, audioErrorHandlers };
}

function makeHandlers() {
  return {
    onAudioError: vi.fn<(rowId: string, columnId: string) => void>(),
    onAudioSuccess: vi.fn<(rowId: string, columnId: string) => void>(),
  };
}

describe('audioPlaybackCell', () => {
  it('offers a play button for a valid audio url', () => {
    renderCell(audioUrl);

    expect(screen.getByLabelText('Play/Pause')).toBeInTheDocument();
  });

  it('reports a load failure for its own row and column', () => {
    const { container, audioErrorHandlers } = renderCell(audioUrl);

    fireEvent.error(container.querySelector('audio') as HTMLAudioElement);

    expect(audioErrorHandlers.onAudioError).toHaveBeenCalledTimes(1);
    expect(audioErrorHandlers.onAudioError).toHaveBeenCalledWith(
      'row-7',
      'spanishAudio',
    );
    expect(audioErrorHandlers.onAudioSuccess).not.toHaveBeenCalled();
  });

  it('reports success for its own row and column once the audio can play', () => {
    const { container, audioErrorHandlers } = renderCell(audioUrl);

    fireEvent.canPlay(container.querySelector('audio') as HTMLAudioElement);

    expect(audioErrorHandlers.onAudioSuccess).toHaveBeenCalledTimes(1);
    expect(audioErrorHandlers.onAudioSuccess).toHaveBeenCalledWith(
      'row-7',
      'spanishAudio',
    );
    expect(audioErrorHandlers.onAudioError).not.toHaveBeenCalled();
  });
});
