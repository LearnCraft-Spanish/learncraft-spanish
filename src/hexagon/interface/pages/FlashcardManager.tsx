import Loading from 'src/components/Loading/Loading';
import useFlashcardManager from 'src/hexagon/application/useCases/useFlashcardManager';
import FlashcardManagerFilters from '../components/FlashcardManagerFilters';
import FlashcardTable from '../components/Tables/FlashcardTable';
export default function FlashcardManager() {
  const { exampleFilter, filteredFlashcards, paginationState } =
    useFlashcardManager();

  const { filterState, skillTagSearch } = exampleFilter;

  if (exampleFilter.initialLoading) {
    return <Loading message="Loading Flashcard Manager" />;
  }

  return (
    <div>
      <FlashcardManagerFilters
        filterState={filterState}
        skillTagSearch={skillTagSearch}
      />
      <FlashcardTable
        dataSource={filteredFlashcards}
        paginationState={paginationState}
      />
    </div>
  );
}
