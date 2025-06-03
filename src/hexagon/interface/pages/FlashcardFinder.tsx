import useFlashcardFinderFilter from 'src/hexagon/application/useCases/useFlashcardFinderFilter';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';

export default function FlashcardFinder() {
  const {
    filteredFlashcards,
    includeSpanglish,
    toggleIncludeSpanglish,
    tagSearchTerm,
    updateTagSearchTerm,
    suggestedTags,
    addTag,
    removeTag,
    selectedTags,
  } = useFlashcardFinderFilter();

  return (
    <div>
      <FlashcardFinderFilter
        includeSpanglish={includeSpanglish}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        tagSearchTerm={tagSearchTerm}
        updateTagSearchTerm={updateTagSearchTerm}
        suggestedTags={suggestedTags}
        addTag={addTag}
        removeTag={removeTag}
        selectedTags={selectedTags}
      />
      <FlashcardFinderResults filteredFlashcards={filteredFlashcards} />
    </div>
  );
}
