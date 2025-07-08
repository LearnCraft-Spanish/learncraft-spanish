import { SkillType } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import { useExampleFilterCoordinator } from 'src/hexagon/application/coordinators/hooks/useExampleFilterCoordinator';
import { useSkillTags } from 'src/hexagon/application/queries/useSkillTags';

export default function SelectedTags({
  removeTag,
}: {
  removeTag: (tagId: string) => void;
}) {
  const { skillTagKeys } = useExampleFilterCoordinator();
  const { skillTags } = useSkillTags();

  const tags = useMemo(() => {
    if (!skillTags) {
      return [];
    }
    const tagObjects = skillTagKeys.map((key) =>
      skillTags.find((t) => t.key === key),
    );
    // Filter out undefined values
    return tagObjects.filter(
      (tag): tag is NonNullable<typeof tag> => tag !== undefined,
    );
  }, [skillTagKeys, skillTags]);

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
