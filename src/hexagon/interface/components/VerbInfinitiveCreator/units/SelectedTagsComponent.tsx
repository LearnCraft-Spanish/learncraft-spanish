export default function SelectedTagsComponent({
  removeTag,
  tags,
}: {
  removeTag: (tagId: string) => void;
  tags: string[];
}) {
  return (
    <div className="selectedTagsBox">
      <p>Selected Tags:</p>
      {!!tags.length && (
        <div className="selectedVocab">
          {/* <h5>Search Terms:</h5> */}
          {tags.map((item) => (
            <div key={item} className="tagCard" onClick={() => removeTag(item)}>
              <h4 className="tag">{item}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
