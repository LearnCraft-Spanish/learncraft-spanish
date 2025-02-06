import MenuButton from './Buttons/MenuButton';
import './components.scss';

export default function NoFlashcards() {
  return (
    <div className="noFlashcardsWrapper">
      <h2>No Flashcards Found</h2>
      <p>It seems you have not collected any flashcards yet.</p>
      <p>
        You can collect flashcards by clicking the "add to my flashcards" button
        (located on the back of a flashcard) during a quiz, or by using the
        "Find Flashcards" page to search for flashcards to add to your
        collection.
      </p>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}
