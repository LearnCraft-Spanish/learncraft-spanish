import { useExampleSearch } from '@application/useCases/ExampleSearch/useExampleSearch';
import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { Results } from '@interface/components/ExampleSearchInterface/Results/Results';
import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { SelectedExamples } from '@interface/components/ExampleSearchInterface/SelectedExamples';
import SectionHeader from '@interface/components/general/SectionHeader/SectionHeader';
import { useCallback, useState } from 'react';
import '@interface/components/ExampleSearchInterface/ExampleSearch.scss';
export default function ExampleSearch({
  activateEdit,
}: {
  activateEdit: () => void;
}) {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const {
    mode,
    searchIsTriggered,
    isValidSearch,
    nonValidSearchErrorMessage,
    handleChangeMode,
    triggerSearch,
    searchComponentProps,
    searchResultProps,
  } = useExampleSearch();

  const triggerSearchWrapper = useCallback(() => {
    triggerSearch();
    setShowSearchResults(true);
  }, [triggerSearch]);

  return (
    <div>
      <h2>Example Search</h2>
      <SearchModeNav activeMode={mode} onModeChange={handleChangeMode} />

      <div style={{ marginTop: '1rem' }}>
        <Filters mode={mode} {...searchComponentProps} />
      </div>

      {!searchIsTriggered && (
        <>
          <button
            type="button"
            className="searchButton"
            onClick={triggerSearchWrapper}
            disabled={!isValidSearch}
          >
            Search
          </button>
          {!isValidSearch && (
            <div className="notValidSearchError">
              {nonValidSearchErrorMessage}
            </div>
          )}
        </>
      )}
      <div style={{ marginTop: '1rem' }}>
        {searchIsTriggered && (
          <>
            <SectionHeader
              title="Search Results"
              isOpen={showSearchResults}
              openFunction={() => setShowSearchResults(!showSearchResults)}
            />
            {showSearchResults && (
              <Results mode={mode} {...searchResultProps} />
            )}
          </>
        )}
        {/* <Results mode={mode} {...searchResultProps} />} */}
      </div>

      <SelectedExamples />
      <button type="button" className="editButton" onClick={activateEdit}>
        Edit
      </button>
    </div>
  );
}
