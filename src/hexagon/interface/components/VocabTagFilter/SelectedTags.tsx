import type { VocabTag } from 'src/types/interfaceDefinitions';

export default function SelectedTags({
  tags,
  removeTag,
}: {
  tags: VocabTag[];
  removeTag: (tagId: number) => void;
}) {
  return (
    <div className="selectedTagsBox">
      <p>Selected Tags:</p>
      {!!tags.length && (
        <div className="selectedVocab">
          {/* <h5>Search Terms:</h5> */}
          {tags.map((item) => (
            <div
              key={item.id}
              className="tagCard"
              onClick={() => removeTag(item.id)}
            >
              <div className={`${item.type}Card`}>
                <h4 className="vocabName">{item.tag}</h4>
                {item.vocabDescriptor && (
                  <h5 className="vocabDescriptor">{item.vocabDescriptor}</h5>
                )}
                <p className="vocabUse">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
