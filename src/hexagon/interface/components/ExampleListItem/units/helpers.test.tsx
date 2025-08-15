import { render } from '@testing-library/react';
import { formatEnglishText, formatSpanishText } from './helpers';

describe('helpers', () => {
  describe('formatEnglishText', () => {
    it('should render text wrapped in paragraph with englishFlashcardText class', () => {
      const text = 'Hello world';
      const result = formatEnglishText(text);
      const { container } = render(result);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass('englishFlashcardText');
      expect(paragraph).toHaveTextContent(text);
    });
  });

  describe('formatSpanishText', () => {
    it('should render regular Spanish text with spanishFlashcardText class', () => {
      const text = 'Hola mundo';
      const result = formatSpanishText(false, text);
      const { container } = render(result);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass('spanishFlashcardText');
      expect(paragraph).toHaveTextContent(text);
    });

    it('should render Spanglish text with alternating Spanish and English classes', () => {
      const text = '*Hola* Rebecca!';
      const result = formatSpanishText(true, text);
      const { container } = render(result);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();

      const spans = paragraph?.querySelectorAll('span');
      expect(spans).toHaveLength(3);

      // First span (empty before asterisk) should be Spanish
      expect(spans?.[0]).toHaveClass('spanishFlashcardText');
      expect(spans?.[0]).toHaveTextContent('');

      // Second span (between asterisks) should be English
      expect(spans?.[1]).toHaveClass('englishFlashcardText');
      expect(spans?.[1]).toHaveTextContent('Hola');

      // Third span (after asterisks) should be Spanish
      expect(spans?.[2]).toHaveClass('spanishFlashcardText');
      expect(spans?.[2]).toHaveTextContent('Rebecca!');
    });

    it('should render Spanglish text with multiple alternating sections', () => {
      const text = 'I said *hola* to my *amigo*';
      const result = formatSpanishText(true, text);
      const { container } = render(result);

      const spans = container.querySelectorAll('span');
      expect(spans).toHaveLength(5);

      expect(spans[0]).toHaveClass('spanishFlashcardText');
      expect(spans[0]).toHaveTextContent('I said');

      expect(spans[1]).toHaveClass('englishFlashcardText');
      expect(spans[1]).toHaveTextContent('hola');

      expect(spans[2]).toHaveClass('spanishFlashcardText');
      expect(spans[2]).toHaveTextContent('to my');

      expect(spans[3]).toHaveClass('englishFlashcardText');
      expect(spans[3]).toHaveTextContent('amigo');

      expect(spans[4]).toHaveClass('spanishFlashcardText');
      expect(spans[4]).toHaveTextContent('');
    });
  });
});
