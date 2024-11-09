import { useCallback, useEffect, useState } from 'react';
import type { VocabTag } from '../../interfaceDefinitions';

import { useContextualMenu } from '../../hooks/useContextualMenu';
import { useVocabulary } from '../../hooks/useVocabulary';
import { FromToLessonSelector } from '../LessonSelector';

interface FilterProps {
  includeSpanglish: boolean;
  toggleIncludeSpanglish: () => void;
  requiredTags: VocabTag[];
  addTagToRequiredTags: (tagId: number) => void;
  removeTagFromRequiredTags: (tagId: number) => void;
}

export default function Filter({
  includeSpanglish,
  toggleIncludeSpanglish,
  requiredTags,
  addTagToRequiredTags,
  removeTagFromRequiredTags,
}: FilterProps) {
  const { contextual, openContextual, setContextualRef } = useContextualMenu();
  const { tagTable } = useVocabulary();
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<VocabTag[]>([]);

  const updateTagSearchTerm = useCallback(
    (target: EventTarget & HTMLInputElement) => {
      openContextual('tagSuggestionBox');
      setTagSearchTerm(target.value);
    },
    [openContextual],
  );

  const filterTagsByInput = useCallback(
    (tagInput: string) => {
      function filterBySearch(tagTable: VocabTag[]) {
        const filteredTags = [];
        const searchTerm = tagInput.toLowerCase();

        for (let i = 0; i < tagTable.length; i++) {
          const tagLowercase = tagTable[i].tag.toLowerCase();
          if (tagLowercase.includes(searchTerm)) {
            if (tagLowercase === searchTerm) {
              filteredTags.unshift(tagTable[i]);
            } else {
              filteredTags.push(tagTable[i]);
            }
          }
        }

        return filteredTags;
      }

      function filterByActiveTags(tag: VocabTag) {
        const matchFound = requiredTags.find((item) => item.id === tag.id);
        if (matchFound) {
          return false;
        }
        return true;
      }
      const filteredBySearch = filterBySearch(tagTable);
      const filteredByActiveTags = filteredBySearch.filter(filterByActiveTags);
      const suggestTen = [];
      for (let i = 0; i < 10; i++) {
        if (filteredByActiveTags[i]) {
          suggestTen.push(filteredByActiveTags[i]);
        }
      }
      setSuggestedTags(suggestTen);
    },
    [tagTable, requiredTags],
  );

  useEffect(() => {
    filterTagsByInput(tagSearchTerm);
  }, [tagSearchTerm, requiredTags, contextual, filterTagsByInput]);

  return (
    <div className="filterSection">
      <div className="filterBox options">
        <div className="FromToLessonSelectorWrapper">
          <FromToLessonSelector />
        </div>
        <div className="removeSpanglishBox">
          <p>Include Spanglish: </p>
          <label
            htmlFor="removeSpanglish"
            className="switch"
            aria-label="noSpanglish"
          >
            <input
              type="checkbox"
              name="removeSpanglish"
              id="removeSpanglish"
              checked={includeSpanglish}
              style={
                includeSpanglish
                  ? { backgroundColor: 'darkgreen' }
                  : { backgroundColor: 'darkred' }
              }
              onChange={toggleIncludeSpanglish}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="filterBox search">
        <div className="searchFilter">
          <div className="tagSearchBox">
            <div className="searchTermBox">
              {/*consider adding a Search Icon at some point */}
              <input
                type="text"
                onChange={(e) => updateTagSearchTerm(e.currentTarget)}
                onClick={() => openContextual('tagSuggestionBox')}
                placeholder="Search tags"
              />
              <br></br>
            </div>
            {!!tagSearchTerm.length &&
              contextual === 'tagSuggestionBox' &&
              !!suggestedTags.length && (
                <div className="tagSuggestionBox" ref={setContextualRef}>
                  {suggestedTags.map((item) => (
                    <div
                      key={item.id}
                      className="tagCard"
                      onClick={() => addTagToRequiredTags(item.id)}
                    >
                      <div className={`${item.type}Card`}>
                        <h4 className="vocabName">{item.tag}</h4>
                        {item.vocabDescriptor && (
                          <h5 className="vocabDescriptor">
                            {item.vocabDescriptor}
                          </h5>
                        )}
                        <p className="vocabUse">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="selectedTagsBox">
            <p>Selected Tags:</p>
            {!!requiredTags.length && (
              <div className="selectedVocab">
                {/* <h5>Search Terms:</h5> */}
                {requiredTags.map((item) => (
                  <div
                    key={item.id}
                    className="tagCard"
                    onClick={() => removeTagFromRequiredTags(item.id)}
                  >
                    <div className={`${item.type}Card`}>
                      <h4 className="vocabName">{item.tag}</h4>
                      {item.vocabDescriptor && (
                        <h5 className="vocabDescriptor">
                          {item.vocabDescriptor}
                        </h5>
                      )}
                      <p className="vocabUse">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
