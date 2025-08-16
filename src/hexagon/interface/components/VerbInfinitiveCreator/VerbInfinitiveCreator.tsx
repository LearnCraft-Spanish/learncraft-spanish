import useVerbInfinitiveCreator from '@application/useCases/useVerbInfinitiveCreator';
import { useMemo } from 'react';

export default function VerbInfinitiveCreator() {
  const {
    infinitive,
    updateInfinitive,
    addTag,
    removeTag,
    addableTags,
    createVerb,
    selectedTags,
  } = useVerbInfinitiveCreator();

  const allTagsComponent = useMemo(
    () => (
      <div>
        <h3>All Tags</h3>
        <div>
          {addableTags &&
            addableTags.length > 0 &&
            addableTags.map((tag) => (
              <button type="button" key={tag} onClick={() => addTag(tag)}>
                {tag}
              </button>
            ))}
        </div>
      </div>
    ),
    [addableTags, addTag],
  );

  const selectedTagsComponent = useMemo(
    () => (
      <div>
        <h3>Selected Tags</h3>
        <div>
          {selectedTags &&
            selectedTags.length > 0 &&
            selectedTags?.map((tag) => (
              <button
                type="button"
                key={`${tag}-${selectedTags.indexOf(tag)}`}
                onClick={() => removeTag(tag)}
              >
                {tag}
              </button>
            ))}
        </div>
      </div>
    ),
    [selectedTags, removeTag],
  );
  return (
    <div>
      <input
        type="text"
        value={infinitive}
        onChange={(e) => updateInfinitive(e.target.value)}
      />
      {allTagsComponent}

      {selectedTagsComponent}

      <button
        type="button"
        onClick={() => createVerb({ infinitive, tags: selectedTags })}
        disabled={!infinitive}
      >
        Create
      </button>
    </div>
  );
}
