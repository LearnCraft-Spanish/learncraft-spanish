import type { VerbTag } from '@learncraft-spanish/shared';
import useVerbInfinitiveCreator from '@application/useCases/useVerbInfinitiveCreator';
import { useMemo, useState } from 'react';
import { TextInput } from 'src/components/FormComponents';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import ContextualView from '../Contextual/ContextualView';
import SearchComponents from './units/SearchComponents';
import SelectedTagsComponent from './units/SelectedTagsComponent';
import './VerbInfinitiveCreator.scss';

export default function VerbInfinitiveCreatorContextual() {
  const {
    infinitive,
    updateInfinitive,
    addTag,
    removeTag,
    addableTags,
    createVerb,
    selectedTags,
    clearTags,
  } = useVerbInfinitiveCreator();

  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.length) return addableTags;
    return addableTags.filter((tag) => {
      const tagLower = tag.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      return tagLower.includes(searchTermLower);
    });
  }, [addableTags, searchTerm]);

  const { openContextual, contextual, closeContextual } = useContextualMenu();

  const handleCreateVerb = () => {
    createVerb({ infinitive, tags: selectedTags });

    setSearchTerm('');
    updateInfinitive('');
    clearTags();
    closeContextual();
  };

  return (
    <div className="VerbInfinitiveCreator">
      <button
        type="button"
        onClick={() => openContextual('verbInfinitiveCreator')}
      >
        Create Verb
      </button>
      {contextual === 'verbInfinitiveCreator' && (
        <ContextualView>
          <TextInput
            label="Verb Infinitive"
            value={infinitive}
            onChange={updateInfinitive}
            editMode={true}
          />
          <SearchComponents
            searchTerm={searchTerm}
            updateSearchTerm={setSearchTerm}
            searchResults={searchResults}
            addTag={(tag) => addTag(tag as VerbTag)}
          />
          <SelectedTagsComponent
            tags={selectedTags}
            removeTag={(tag) => removeTag(tag as VerbTag)}
          />
          <div className="buttonBox">
            <button
              className={`${!infinitive.length || !selectedTags.length ? 'disabled' : 'addButton'}`}
              type="button"
              onClick={handleCreateVerb}
              disabled={!infinitive.length || !selectedTags.length}
            >
              Create
            </button>
          </div>
        </ContextualView>
      )}
    </div>
  );
}
