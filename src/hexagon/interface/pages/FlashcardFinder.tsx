import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import FlashcardFinderFilter from '@interface/components/FlashcardFinder/FlashcardFinderFilter';
import { ExampleTable } from '@interface/components/Tables';

export default function FlashcardFinder() {
  const {
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    pagination,
    lessonPopup,
  } = useFlashcardFinder();

  return (
    <div>
      <FlashcardFinderFilter />
      <ExampleTable
        examples={displayExamples}
        totalCount={exampleQuery.totalCount ?? 0}
        studentFlashcards={flashcardsQuery}
        paginationState={pagination}
        firstPageLoading={exampleQuery.isLoading && exampleQuery.page === 1}
        newPageLoading={exampleQuery.isLoading && exampleQuery.page > 1}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
