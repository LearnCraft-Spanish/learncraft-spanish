# Using the Enhanced NonVerbCreation Use Case

The `useNonVerbCreation` use case has been enhanced to include paginated vocabulary display functionality. This combines both vocabulary creation and viewing within a single use case, following the Façade pattern.

## Functionality Overview

The enhanced use case provides:

1. **Vocabulary Creation**: Create new non-verb vocabulary items using a tabular interface
2. **Subcategory Selection**: Select the appropriate subcategory for the vocabulary
3. **Paginated Vocabulary Display**: View existing vocabulary for the selected subcategory with pagination controls

## Interface Definition

```typescript
interface UseNonVerbCreationResult {
  // Subcategory selection
  nonVerbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Table hook API - exposed through the façade
  tableHook: TableHook<VocabularyTableData>;

  // Unified save action that handles validation, table save, and creation
  saveVocabulary: () => Promise<boolean>;

  // Vocabulary list for currently selected subcategory
  currentVocabularyPagination: VocabularyPaginationState | null;
}

// The VocabularyPaginationState provides all pagination-related data and controls
interface VocabularyPaginationState {
  vocabularyItems: Vocabulary[];
  isLoading: boolean;
  isFetching: boolean;
  isCountLoading: boolean; // Separate loading state for count data
  error: Error | null;
  totalCount: number | null; // Can be null while count is loading
  totalPages: number | null; // Can be null while count is loading
  hasMorePages: boolean; // Indicates if more pages likely exist (even when count is loading)
  currentPage: number;
  pageSize: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}
```

## Usage Example

```typescript
function VocabularyList() {
  const { currentVocabularyPagination } = useNonVerbCreation();

  if (!currentVocabularyPagination) {
    return <p>Select a subcategory to view vocabulary</p>;
  }

  const {
    vocabularyItems,
    isLoading,
    isFetching,
    isCountLoading,
    error,
    totalCount,
    totalPages,
    hasMorePages,
    currentPage,
    goToNextPage,
    goToPreviousPage
  } = currentVocabularyPagination;

  if (isLoading && vocabularyItems.length === 0) {
    return <p>Loading vocabulary...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h3>
        Existing Vocabulary ({isCountLoading ? 'Loading...' : totalCount ?? 'Many'} items)
      </h3>

      {/* Display vocabulary items with loading overlay for transitions */}
      <div className="vocabulary-container">
        {/* Show loading overlay during page transitions */}
        {isLoading && vocabularyItems.length > 0 && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}

        <ul>
          {vocabularyItems.map(item => (
            <li key={item.id}>{item.word}: {item.descriptor}</li>
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      <div>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </button>

        <span>
          Page {currentPage}
          {totalPages !== null ? ` of ${totalPages}` : hasMorePages ? ' (more pages available)' : ''}
          {isFetching && ' ...'}
        </span>

        <button
          onClick={goToNextPage}
          disabled={(totalPages !== null ? currentPage >= totalPages : !hasMorePages) || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```
