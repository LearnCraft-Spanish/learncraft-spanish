import type { SkillTag } from '@learncraft-spanish/shared';
import { SkillType } from '@learncraft-spanish/shared';
import './VocabTagFilter.scss';

const OUT_OF_RANGE_MESSAGE =
  'Not taught in your selected lessons, so it will return no flashcards.';

export default function SelectedTags({
  removeTag,
  skillTags,
  outOfRangeTagKeys = [],
}: {
  removeTag: (tagId: string) => void;
  skillTags: SkillTag[];
  outOfRangeTagKeys?: string[];
}) {
  return (
    <div className="selectedTagsBox">
      <p>Selected Tags:</p>
      {!!skillTags.length && (
        <div className="selectedVocab">
          {/* <h5>Search Terms:</h5> */}
          {skillTags.map((item) => {
            const isOutOfRange = outOfRangeTagKeys.includes(item.key);
            return (
              <div
                key={item.key}
                className={`tagCard ${isOutOfRange ? 'outOfRange' : ''}`}
                title={isOutOfRange ? OUT_OF_RANGE_MESSAGE : undefined}
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
                  {isOutOfRange && (
                    <p className="outOfRangeNotice">Outside lesson range</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
