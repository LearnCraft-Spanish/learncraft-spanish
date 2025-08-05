import { render, screen } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import ExampleListItemFactory from './ExampleListItemFactory';

const f = createMockFlashcard();

const flashcard = {
  ...f,
  example: {
    ...f.example,
    spanish: 'eso',
    english: 'that',
  },
};

describe('exampleListItemFactory', () => {
  it('should render example text', () => {
    render(<ExampleListItemFactory example={flashcard} />);

    expect(screen.getByText(flashcard.example.spanish)).toBeInTheDocument();
    expect(screen.getByText(flashcard.example.english)).toBeInTheDocument();
  });

  it('should render preTextComponents', () => {
    render(
      <ExampleListItemFactory
        example={flashcard}
        preTextComponents={[<span key="preText">preText</span>]}
      />,
    );

    expect(screen.getByText('preText')).toBeInTheDocument();
  });

  it('should render postTextComponents', () => {
    render(
      <ExampleListItemFactory
        example={flashcard}
        postTextComponents={[<span key="postText">postText</span>]}
      />,
    );
    expect(screen.getByText('postText')).toBeInTheDocument();
  });
});
