import React from 'react';

export function formatSpanishText(
  isSpanglish: string,
  spanishText: string,
): React.JSX.Element {
  if (isSpanglish === 'esp') {
    return <p className="spanishFlashcardText">{spanishText}</p>;
  } else {
    const textParts = spanishText.split('*');

    return (
      <p>
        {textParts.map((part, index) => {
          // Combines the index with part of the content for stable key.
          const key = `${index}-${part}`;

          return index % 2 === 1 ? (
            <span key={key} className="englishFlashcardText">
              {part}
            </span>
          ) : (
            <span key={key} className="spanishFlashcardText">
              {part}
            </span>
          );
        })}
      </p>
    );
  }
}

export function formatEnglishText(englishText: string): React.JSX.Element {
  return <p className="englishFlashcardText">{englishText}</p>;
}
