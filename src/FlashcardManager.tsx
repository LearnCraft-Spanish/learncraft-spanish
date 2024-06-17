import React, { useEffect } from 'react';

interface Flashcard {
  recordId: number;
  spanishExample: string;
  englishTranslation: string;
  spanglish: string;
}

interface StudentExample {
  recordId: number;
  dateCreated: string;
  relatedExample: number;
}

interface FlashcardManagerProps {
  examplesTable: Flashcard[];
  studentExamplesTable: StudentExample[];
  removeFlashcard: Function;
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({ examplesTable, studentExamplesTable, removeFlashcard }) => {

  async function removeAndUpdate(recordId: number) {
    removeFlashcard(recordId).then(
      (numberRemoved: number) => {
        if (numberRemoved > 0) {
          displayExamplesTable();
        } else {
          console.log('Error removing flashcard');
        }
      })
  }

  function getStudentExampleFromExampleId(exampleId: number) {
    const example = studentExamplesTable.find((item) => item.relatedExample === exampleId);
    return example? example : {recordId: -1, dateCreated: '', relatedExample: -1};
  }

  function displayExamplesTable() {
    const sortedExamples = examplesTable.sort((a,b) => {
      const aStudentExample = getStudentExampleFromExampleId(a?.recordId);
      const bStudentExample = getStudentExampleFromExampleId(b?.recordId);
      const aDate = new Date(aStudentExample.dateCreated);
      const bDate = new Date(bStudentExample.dateCreated);
      if (a.spanglish ==='spanglish' && b.spanglish !== 'spanglish') {
        return -1
      } else if (a.spanglish !=='spanglish' && b.spanglish === 'spanglish') {
        return 1
      } else if (aDate > bDate) {
        return -1;
      } else if (aDate < bDate) {
        return 1;
      } else {
        return 0;
      }
    });

    return sortedExamples.map((item) => (
      <div className='exampleCard' key={item.recordId}>
        <div className='exampleCardSpanishText'>
          <h3>{item.spanishExample}</h3>
        </div>
        <div className='exampleCardEnglishText'>
          <h4>{item.englishTranslation}</h4>
        </div>
        {item.spanglish === 'spanglish' && (
          <div className='spanglishLabel'>
            <h4>Spanglish</h4>
          </div>
        )}
        {item.spanglish !== 'spanglish' && (
          <div className='spanishLabel'>
            <h4>Spanish</h4>
          </div>
        )}
        <button className='redButton' value={item.recordId} onClick={(e) => removeAndUpdate(parseInt((e.target as HTMLButtonElement).value))}>Remove</button>
      </div>
    ));
  }

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <h4>Total flashcards: {examplesTable.length}</h4>
      <div className='exampleCardContainer'>
        {displayExamplesTable()}
      </div>
    </div>
  );
};

export default FlashcardManager;