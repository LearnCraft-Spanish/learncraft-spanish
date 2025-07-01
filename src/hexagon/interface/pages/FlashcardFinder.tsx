import useFlashcardFinderFilter from 'src/hexagon/application/useCases/useFlashcardFinderFilter';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import FlashcardFinderResults from '../components/FlashcardFinder/FlashcardFinderResults';

export default function FlashcardFinder() {
  const {
    includeSpanglish,
    toggleIncludeSpanglish,
    tagSearchTerm,
    updateTagSearchTerm,
    suggestedTags,
    addTag,
    removeTag,
    selectedTags,
    audioOnly,
    toggleAudioOnly,

    handleGetExamplesFromTags,
    examples,
    getExamplesReady,
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
        handleGetExamplesFromTags={handleGetExamplesFromTags}
        getExamplesReady={getExamplesReady}
        audioOnly={audioOnly}
        toggleAudioOnly={toggleAudioOnly}
      />
      <FlashcardFinderResults filteredFlashcards={examples} />
    </div>
  );
}
