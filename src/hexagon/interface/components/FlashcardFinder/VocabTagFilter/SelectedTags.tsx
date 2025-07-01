import type { SkillTag } from '@LearnCraft-Spanish/shared';
import { SkillType } from '@LearnCraft-Spanish/shared';

export default function SelectedTags({
  tags,
  removeTag,
}: {
  tags: SkillTag[];
  removeTag: (tagId: string) => void;
}) {
  return (
    <div className="selectedTagsBox">
      <p>Selected Tags:</p>
      {!!tags.length && (
        <div className="selectedVocab">
          {/* <h5>Search Terms:</h5> */}
          {tags.map((item) => (
            <div
              key={item.key}
              className="tagCard"
              onClick={() => removeTag(item.key)}
            >
              <div className={`${item.type}Card`}>
                <h4 className="vocabName">{item.name}</h4>
                {item.type === SkillType.Vocabulary && (
                  <h5 className="vocabDescriptor">{item.descriptor}</h5>
                )}
                {item.type === SkillType.Idiom && (
                  <h5 className="vocabDescriptor">{item.subcategoryName}</h5>
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
