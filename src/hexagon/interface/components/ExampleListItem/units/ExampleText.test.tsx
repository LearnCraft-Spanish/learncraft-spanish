import ExampleText from '@interface/components/ExampleListItem/units/ExampleText';
import * as helpers from '@interface/components/ExampleListItem/units/helpers';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the AudioControl component
vi.mock('../../general', () => ({
  AudioControl: vi.fn(({ audioLink }: { audioLink: string }) => (
    <div data-testid="audio-control" data-audio-link={audioLink}>
      AudioControl
    </div>
  )),
}));

// Mock the helper functions
vi.mock('./helpers', () => ({
  formatSpanishText: vi.fn(),
  formatEnglishText: vi.fn(),
}));

const mockProps = {
  isSpanglish: false,
  spanishExample: 'Hola mundo',
  englishTranslation: 'Hello world',
  spanishAudio: 'https://example.com/spanish.mp3',
  englishAudio: 'https://example.com/english.mp3',
};

describe('component ExampleText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    vi.mocked(helpers.formatSpanishText).mockReturnValue(
      <p className="spanishFlashcardText">{mockProps.spanishExample}</p>,
    );
    vi.mocked(helpers.formatEnglishText).mockReturnValue(
      <p className="englishFlashcardText">{mockProps.englishTranslation}</p>,
    );
  });

  it('should render Spanish and English text sections with correct CSS classes', () => {
    const { container } = render(<ExampleText {...mockProps} />);

    // Check that helper functions are called with correct arguments
    expect(helpers.formatSpanishText).toHaveBeenCalledWith(
      mockProps.isSpanglish,
      mockProps.spanishExample,
    );
    expect(helpers.formatEnglishText).toHaveBeenCalledWith(
      mockProps.englishTranslation,
    );

    // Check CSS classes and structure
    expect(
      container.querySelector('.exampleCardSpanishText'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.exampleCardEnglishText'),
    ).toBeInTheDocument();
  });

  it('should render both audio controls when both audio links are provided', () => {
    render(<ExampleText {...mockProps} />);

    const audioControls = screen.getAllByTestId('audio-control');
    expect(audioControls).toHaveLength(2);
    expect(audioControls[0]).toHaveAttribute(
      'data-audio-link',
      mockProps.spanishAudio,
    );
    expect(audioControls[1]).toHaveAttribute(
      'data-audio-link',
      mockProps.englishAudio,
    );
  });

  it('should not render audio controls when no audio links are provided', () => {
    render(<ExampleText {...mockProps} spanishAudio="" englishAudio="" />);

    expect(screen.queryByTestId('audio-control')).not.toBeInTheDocument();
  });

  it('should pass isSpanglish prop correctly to formatSpanishText', () => {
    render(<ExampleText {...mockProps} isSpanglish={true} />);

    expect(helpers.formatSpanishText).toHaveBeenCalledWith(
      true,
      mockProps.spanishExample,
    );
  });
});
