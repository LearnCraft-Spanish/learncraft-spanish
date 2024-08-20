export function formatSpanishText(isSpanglish: string, spanishText: string): JSX.Element {
  if (isSpanglish !== 'spanglish') {
    return <p className="spanishFlashcardText">{spanishText}</p>
  }
  else {
    const textParts = spanishText.split('*')

    return (
      <p>
        {textParts.map((part, index) => {
          // Create a more stable key by combining the index with part of the content
          const key = `${index}-${part}`

          return index % 2 === 1
            ? (
                <span key={key} className="englishFlashcardText">
                  {part}
                </span>
              )
            : (
                <span key={key} className="spanishFlashcardText">
                  {part}
                </span>
              )
        })}
      </p>
    )
  }
}

export function formatEnglishText(englishText: string): JSX.Element {
  return <p className="englishFlashcardText">{englishText}</p>
}
