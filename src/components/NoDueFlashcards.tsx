import MenuButton from './Buttons/MenuButton';
import './components.scss';

export default function NoDueFlashcards() {
  return (
    <div className="noFlashcardsWrapper">
      <h2>All Caught Up!</h2>
      <p>
        It looks like you've completed all the flashcards that are due for
        review. Come back tomorrow for another review!
      </p>
      <p>
        If you want more to review now, you can collect new flashcards by
        clicking the "add to my flashcards" button (located on the back of a
        flashcard) during a standard quiz, or by using the "Find Flashcards"
        page to search for flashcards to add to your collection.
      </p>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}
