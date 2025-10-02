import type { UseFlashcardTableProps } from '@application/units/useFlashcardTable';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useFlashcardTable } from '@application/units/useFlashcardTable';
import ExampleListItem from '@interface/components/ExampleListItem/ExampleManagerExampleListItem';
import { Pagination } from '@interface/components/general';
import { InlineLoading } from '@interface/components/Loading';
import DeleteAllOwnedSpanglish from '@interface/components/Tables/units/DeleteAllOwnedSpanglish';
import { writeTableToClipboard } from '@interface/components/Tables/units/functions';

// React
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Assets and styles
import ellipsis from 'src/assets/icons/ellipsis-svgrepo-com.svg';
import 'src/components/ExamplesTable/ExamplesTable.scss';
import './ExampleAndFlashcardTable.scss';

export default function FlashcardTable(props: UseFlashcardTableProps) {
  // Call the use case hook for this component with its props
  const {
    allFlashcards,
    displayFlashcards,
    paginationState,
    isSelected,
    selectedIds,
    addToSelectedIds,
    removeFromSelectedIds,
    selectAllOnPage,
    clearSelection,
    deleteFlashcard,
    deleteSelectedFlashcards,
    onGoingToQuiz,
    error,
    lessonPopup,
    isSomethingPending,
    isRemovingFlashcard,
  } = useFlashcardTable(props);

  const [isTableOptionsOpen, setIsTableOptionsOpen] = useState(false);
  const hideTableOptionsTimeout = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    if (hideTableOptionsTimeout.current) {
      clearTimeout(hideTableOptionsTimeout.current);
    }
    setIsTableOptionsOpen(true);
  };

  const hide = () => {
    hideTableOptionsTimeout.current = setTimeout(
      () => setIsTableOptionsOpen(false),
      200,
    ); // slight delay
  };
  const navigate = useNavigate();

  const goToQuiz = () => {
    onGoingToQuiz();
    navigate('/myflashcards?enableFiltering=true');
  };

  const findMore = () => {
    navigate('/flashcardfinder');
  };

  // if (isLoading) {
  //   return <InlineLoading message="Loading Flashcards" />;
  // }
  if (error) {
    return <h2>Error Loading Flashcards</h2>;
  }

  return (
    <div className="flashcardTable">
      <div className="tableHeader">
        <div className="displayExamplesDescription">
          <div id="bulkAddModeButtons">
            <button
              type="button"
              className="clearSelectionButton"
              onClick={selectAllOnPage}
            >
              Select All on Page
            </button>
            {selectedIds.length > 0 && (
              <button
                className="bulkRemoveFlashcardsButton"
                type="button"
                onClick={deleteSelectedFlashcards}
                disabled={isSomethingPending}
              >
                {selectedIds.length > 0
                  ? `Remove ${selectedIds.length} Flashcard${
                      selectedIds.length === 1 ? '' : 's'
                    }`
                  : 'Select Flashcards to Remove'}
              </button>
            )}
            {selectedIds.length > 0 && (
              <button
                className="clearSelectionButton"
                type="button"
                onClick={clearSelection}
                disabled={selectedIds.length === 0}
              >
                Clear Selection
              </button>
            )}
          </div>
          {props.isLoading ? (
            <InlineLoading message="Just a moment..." />
          ) : (
            <h4>
              {`${paginationState.totalItems} flashcard${
                paginationState.totalItems === 1 ? '' : 's'
              } found ${
                paginationState.maxPageNumber > 1
                  ? `(showing ${paginationState.startIndex + 1}-${Math.min(
                      paginationState.endIndex,
                      paginationState.totalItems,
                    )})`
                  : ''
              }`}
            </h4>
          )}
          {error && <h2>Error Loading New Lesson Information</h2>}

          <div className="tableOptionsWrapper">
            <button
              type="button"
              className="tableOptionsButton"
              onMouseEnter={show}
              onMouseLeave={hide}
              onClick={() => {
                if (isTableOptionsOpen) {
                  hide();
                } else {
                  show();
                }
              }}
            >
              <img src={ellipsis} alt="Table Options" />
            </button>
            {isTableOptionsOpen && (
              <div
                className="tableOptions"
                onMouseEnter={show}
                onMouseLeave={hide}
              >
                <button
                  type="button"
                  onClick={() => {
                    writeTableToClipboard(
                      displayFlashcards.map((flashcard) => flashcard.example),
                    );
                  }}
                >
                  <p>
                    Copy this page to clipboard{' '}
                    {`(${displayFlashcards.length} item${
                      displayFlashcards.length === 1 ? '' : 's'
                    })`}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    writeTableToClipboard(
                      allFlashcards.map((flashcard) => flashcard.example),
                    );
                  }}
                >
                  <p>
                    Copy all results to clipboard{' '}
                    {`(${allFlashcards.length} item${
                      allFlashcards.length === 1 ? '' : 's'
                    })`}
                  </p>
                </button>
                <DeleteAllOwnedSpanglish />
                <button type="button" onClick={findMore}>
                  <p>Find More Matching Flashcards</p>
                </button>
                <button type="button" onClick={goToQuiz}>
                  <p>Quiz my Flashcards matching these filters</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {props.isLoading ? (
        <InlineLoading message="Just a moment..." />
      ) : (
        <Pagination
          page={paginationState.pageNumber}
          maxPage={paginationState.maxPageNumber}
          nextPage={paginationState.nextPage}
          previousPage={paginationState.previousPage}
        />
      )}
      <div id="examplesTableBody">
        {displayFlashcards.map((flashcard: Flashcard) => {
          return (
            <ExampleListItem
              key={flashcard.example.id}
              flashcard={flashcard}
              isCollected={true}
              isAdding={false}
              isRemoving={isRemovingFlashcard(flashcard.example.id)}
              handleRemove={async () => {
                deleteFlashcard(flashcard.example.id);
                removeFromSelectedIds(flashcard.example.id);
              }}
              handleSelect={() => {
                addToSelectedIds(flashcard.example.id);
              }}
              handleDeselect={() => {
                removeFromSelectedIds(flashcard.example.id);
              }}
              isSelected={isSelected(flashcard.example.id)}
              lessonPopup={lessonPopup}
            />
          );
        })}
      </div>
      {!props.isLoading && (
        <Pagination
          page={paginationState.pageNumber}
          maxPage={paginationState.maxPageNumber}
          nextPage={paginationState.nextPage}
          previousPage={paginationState.previousPage}
        />
      )}
    </div>
  );
}
