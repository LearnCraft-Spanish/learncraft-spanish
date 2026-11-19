import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { AudioPlaybackCell } from '@interface/components/ExampleEditorInterface/AudioPlaybackCell';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const audioUrl = 'https://example.com/ex1la.mp3';
const otherAudioUrl = 'https://example.com/ex2la.mp3';

function renderCell(value: string, audioErrorHandlers = makeHandlers()) {
  const buildProps = (cellValue: string) => ({
    value: cellValue,
    row: { id: 'row-7', cells: {} },
    column: { id: 'spanishAudio', type: 'text', editable: false },
    audioErrorHandlers,
  });
  const view = render(
    <AudioPlaybackCell
      {...(buildProps(value) as unknown as CellRenderProps)}
      audioErrorHandlers={audioErrorHandlers}
    />,
  );
  return {
    ...view,
    audioErrorHandlers,
    rerenderWith: (cellValue: string) =>
      view.rerender(
        <AudioPlaybackCell
          {...(buildProps(cellValue) as unknown as CellRenderProps)}
          audioErrorHandlers={audioErrorHandlers}
        />,
      ),
  };
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

  it('renders no audio control when the cell has no audio url', () => {
    renderCell('');

    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'error loading audio' }),
    ).not.toBeInTheDocument();
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

  it('shows a disabled error button for a url that is not an audio file', () => {
    renderCell('not-an-audio-url');

    expect(
      screen.getByRole('button', { name: 'error loading audio' }),
    ).toBeDisabled();
    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
  });

  it('starts fresh when the audio url changes after a load failure', () => {
    const { container, rerenderWith } = renderCell(audioUrl);
    fireEvent.error(container.querySelector('audio') as HTMLAudioElement);
    expect(
      screen.getByRole('button', { name: 'error loading audio' }),
    ).toBeInTheDocument();

    rerenderWith(otherAudioUrl);

    expect(
      screen.queryByRole('button', { name: 'error loading audio' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Play/Pause')).toBeInTheDocument();
  });
});
