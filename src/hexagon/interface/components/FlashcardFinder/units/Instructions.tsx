import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

export default function Instructions() {
  const { contextual, openContextual } = useContextualMenu();

  return (
    <>
      <button
        type="button"
        onClick={() => openContextual('FlashcardFinderInstructions')}
      >
        {/* //some text to tell users "not sure how to use this?  click here" */}
        New Feature Guide
      </button>
      {contextual === 'FlashcardFinderInstructions' && (
        <ContextualView>
          <h2> Welcome to the New Flashcard Finder! </h2>
          <p>
            We’ve redesigned the Flashcard Finder to help you find what you need
            faster and make your learning even better — and we’re excited for
            you to try it! Here’s what you should know to get the most out of
            the new experience:
          </p>
          <h3> How to Use Filters </h3>
          <ul>
            <li>
              <p>
                Click on the words "Flashcard Finder Filters" to open up filter
                options.
              </p>
            </li>
            <li>
              <p>
                Choose the filters you want, like a specific lesson range, only
                audio words, or certain vocabulary tags.
              </p>
            </li>
            <li>
              <p>
                When you’re ready, click “Get Examples” to see your search
                results.
              </p>
              <p>
                Note: The search won’t start until you click “Get Examples.”
                This helps us show results to you much faster!
              </p>
            </li>
          </ul>
          <h3>New Features to Try </h3>
          <ul>
            <li>
              <h4>Pick multiple examples </h4>
              <p>
                Click “Select” on any examples to add several at once to your
                flashcard collection.
              </p>
            </li>
            <li>
              <h4>See all the vocabulary tags </h4>
              <p>
                Click “Expand” on an example to view all the tags related to
                that flashcard.
              </p>
            </li>
            <li>
              <h4>Listen to example audio </h4>
              <p>Click the speaker icon to hear the example spoken aloud</p>
            </li>
          </ul>
          <br />
          <p>If you have any questions, just ask. Happy studying!</p>
        </ContextualView>
      )}
    </>
  );
}
