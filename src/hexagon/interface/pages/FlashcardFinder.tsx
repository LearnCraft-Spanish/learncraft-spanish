import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import { ExampleTable } from '../components/Tables';

export default function FlashcardFinder() {
  const {
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    pagination,
    lessonPopup,
    onManageThese,
  } = useFlashcardFinder();

  const navigate = useNavigate();

  const manageThese = useCallback(() => {
    onManageThese();
    navigate('/manage-flashcards', { replace: true });
  }, [navigate, onManageThese]);

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
        manageThese={manageThese}
      />
    </div>
  );
}
