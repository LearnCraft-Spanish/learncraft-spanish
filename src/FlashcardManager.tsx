import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MenuButton from "./MenuButton";

interface FlashcardManagerProps {
  studentExamples: Array <{
    recordId: string;
    spanishExample: string;
    englishTranslation: string;
    spanglish: string;
    isAssigned: boolean;
  }>;
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({studentExamples}) => {

  console.log(studentExamples)

  function removeFlashcard(recordId: string) {
    console.log("recordId", recordId)
  }

  function displayExamplesTable() {
    const tableToDisplay = studentExamples.map((item) => {
      return (<div className='exampleCard' key={item.recordId}>
        <div className='exampleCardSpanishText'>
          <h3>{item.spanishExample}</h3>
        </div>
        <div className='exampleCardEnglishText'>
          <h4>{item.englishTranslation}</h4>
        </div>
        {item.spanglish==='spanglish' && <div>
          <h4>Spanglish</h4>
        </div>}
        <button className = 'redButton' value = {item.recordId} onClick = {(e) => removeFlashcard((e.target as HTMLButtonElement).value)}>Remove</button>
      </div>)
    })
    return tableToDisplay
  }

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <div className='exampleCardContainer'>
        {displayExamplesTable()}
      </div>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}

export default FlashcardManager;