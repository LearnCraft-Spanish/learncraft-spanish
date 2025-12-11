import { useExampleSearch } from '@application/useCases/ExampleSearch/useExampleSearch';
import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { Results } from '@interface/components/ExampleSearchInterface/Results/Results';
import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { SelectedExamples } from '@interface/components/ExampleSearchInterface/SelectedExamples';

export default function ExampleSearch() {
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

        {!isValidSearch ? (
          <small>ERROR: Fill required fields to see search results.</small>
        ) : (
          <button type="button" onClick={triggerSearch}>
            Search
          </button>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        {isValidSearch && searchIsTriggered && (
          <Results mode={mode} {...searchResultProps} />
        )}
      </div>
      <SelectedExamples />
    </div>
  );
}
