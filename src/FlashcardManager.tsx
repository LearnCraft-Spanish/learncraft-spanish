import React from 'react';

interface Flashcard {
  recordId: string;
  spanishExample: string;
  englishTranslation: string;
  spanglish: string;
}

interface FlashcardManagerProps {
  studentExamples: Flashcard[];
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({ studentExamples }) => {
  console.log(studentExamples); //testing

  function removeFlashcard(recordId: string) {
    console.log("recordId", recordId);
    // Implementation to remove a flashcard
  }

  function displayExamplesTable() {
    return studentExamples.map((item) => (
      <div className='exampleCard' key={item.recordId}>
        <div className='exampleCardSpanishText'>
          <h3>{item.spanishExample}</h3>
        </div>
        <div className='exampleCardEnglishText'>
          <h4>{item.englishTranslation}</h4>
        </div>
        {item.spanglish === 'spanglish' && (
          <div>
            <h4>Spanglish</h4>
          </div>
        )}
        <button className='redButton' value={item.recordId} onClick={(e) => removeFlashcard((e.target as HTMLButtonElement).value)}>Remove</button>
      </div>
    ));
  }

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <div className='exampleCardContainer'>
        {displayExamplesTable()}
      </div>
    </div>
  );
};

export default FlashcardManager;