import { render, screen } from '@testing-library/react';
import AudioControl from './AudioControl';

const audioLink = 'https://example.com/audio.mp3';

describe('audioControl', () => {
  it('should render', () => {
    render(<AudioControl audioLink={audioLink} />);

    expect(screen.getByLabelText('Play/Pause')).toBeInTheDocument();
  });

  it('should not render if audioLink is not valid', () => {
    render(<AudioControl audioLink={'not-a-valid-audio-link'} />);

    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('audioError')).toBeInTheDocument();
  });
  it('should render nothing if audioLink is not provided', () => {
    render(<AudioControl audioLink={''} />);

    expect(screen.queryByLabelText('Play/Pause')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('audioError')).not.toBeInTheDocument();
  });
});
