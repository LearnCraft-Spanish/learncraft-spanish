import { AudioKeyboardHints } from '@interface/components/audioQuiz/AudioKeyboardHints/AudioKeyboardHints';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AudioKeyboardHints', () => {
  it('lists the audio quiz shortcuts', () => {
    render(<AudioKeyboardHints />);

    expect(screen.getByText('play / pause')).toBeInTheDocument();
    expect(screen.getByText('next step')).toBeInTheDocument();
    expect(screen.getByText('card')).toBeInTheDocument();
    expect(screen.getByText('space')).toBeInTheDocument();
  });
});
