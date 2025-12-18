import { useExampleSearch } from '@application/useCases/ExampleSearch/useExampleSearch';
import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { Results } from '@interface/components/ExampleSearchInterface/Results/Results';
import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { SelectedExamples } from '@interface/components/ExampleSearchInterface/SelectedExamples';
import '@interface/components/ExampleSearchInterface/ExampleSearch.scss';
export default function ExampleSearch({
  activateEdit,
}: {
  activateEdit: () => void;
}) {
  const {
    mode,
    searchIsTriggered,
    isValidSearch,
    handleChangeMode,
    triggerSearch,
    searchComponentProps,
    searchResultProps,
  } = useExampleSearch();

  return (
    <div>
      <h2>Example Search</h2>
      <SearchModeNav activeMode={mode} onModeChange={handleChangeMode} />

      <div style={{ marginTop: '1rem' }}>
        <Filters mode={mode} {...searchComponentProps} />
      </div>

      {!searchIsTriggered &&
        (!isValidSearch ? (
          <div className="notValidSearchError">
            ERROR: Fill required fields to see search results.
          </div>
        ) : (
          <button
            type="button"
            className="searchButton"
            onClick={triggerSearch}
          >
            Search
          </button>
        ))}
      <div style={{ marginTop: '1rem' }}>
        {searchIsTriggered && <Results mode={mode} {...searchResultProps} />}
      </div>
      <SelectedExamples />
      <button type="button" className="editButton" onClick={activateEdit}>
        Edit
      </button>
    </div>
  );
}
