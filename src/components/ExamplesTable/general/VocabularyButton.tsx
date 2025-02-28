import { useState } from 'react';
import x from 'src/assets/icons/x.svg';

export default function VocabularyButton({
  vocabIncluded,
}: {
  vocabIncluded: string[];
}) {
  const [showTags, setShowTags] = useState(false);
  const dataReady = vocabIncluded.length > 0;
  return (
    dataReady && (
      <div className="exampleCardTags">
        {showTags ? (
          <div className="exampleCardTagsList">
            {vocabIncluded.map((tag) => (
              <p key={tag}>{tag}</p>
            ))}
            <button
              type="button"
              className="hideTagsButton"
              onClick={() => setShowTags(false)}
            >
              <img src={x} alt="Hide" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="showTagsButton"
            onClick={() => setShowTags(true)}
          >
            Vocabulary
          </button>
        )}
      </div>
    )
  );
}
