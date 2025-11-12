import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';
import '@interface/components/general/VocabTagFilter/VocabTagFilter.scss';

export default function SelectedTags({
  removeTag,
  skillTags,
}: {
  removeTag: (tagId: string) => void;
  skillTags: SkillTag[];
}) {
  return (
    <div className="selectedTagsBox">
      <p>Selected Tags:</p>
      {!!skillTags.length && (
        <div className="selectedVocab">
          {/* <h5>Search Terms:</h5> */}
          {skillTags.map((item) => (
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
