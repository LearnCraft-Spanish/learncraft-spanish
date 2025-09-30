import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import { Loading } from '@interface/components/Loading';
import { ExampleTable } from '@interface/components/Tables';

export default function FlashcardFinder() {
  const {
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    pagination,
    lessonPopup,
    initialLoading,
    filteredExamplesLoading,
    error,
  } = useFlashcardFinder();

  if (initialLoading) {
    return <Loading message="Loading Flashcard Finder" />;
  }
  if (error) {
    return <h2>Error Loading Flashcard Finder</h2>;
  }

  return (
    <div>
      <h2>Flashcard Finder</h2>
      <FlashcardFinderFilter />
      <ExampleTable
        examples={displayExamples}
        totalCount={exampleQuery.totalCount ?? 0}
        studentFlashcards={flashcardsQuery}
        paginationState={pagination}
        filteredExamplesLoading={filteredExamplesLoading}
        firstPageLoading={exampleQuery.isLoading && exampleQuery.page === 1}
        newPageLoading={exampleQuery.isLoading && exampleQuery.page > 1}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
