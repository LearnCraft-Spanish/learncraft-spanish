import type { LessonPopup } from '@application/units/useLessonPopup';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { usePagination } from '@application/units/Pagination/usePagination';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import MoreInfoButton from '@interface/components/ExampleListItem/units/MoreInfoButton';
import MoreInfoViewExample from '@interface/components/ExampleListItem/units/MoreInfoViewExample';
import { Pagination } from '@interface/components/general';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useCallback, useState } from 'react';
import 'src/components/ExamplesTable/ExamplesTable.scss';
import '@interface/components/Tables/ExampleAndFlashcardTable.scss';

/**
 * A simple table that displays a list of examples with pagination.
 * It displays the example english and spanish text, with expandable more info.
 */
export default function SimpleExampleTable({
  examples,
  lessonPopupProps,
}: {
  examples: ExampleWithVocabulary[];
  lessonPopupProps: LessonPopup;
}) {
  const pagination = usePagination({
    itemsPerPage: 25,
    totalItems: examples.length,
  });

  const paginatedExamples = examples.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  return (
    <div className="examplesTable">
      <div className="tableHeader">
        <div className="displayExamplesDescription">
          <h4>
            {`${examples.length} example${examples.length === 1 ? '' : 's'} found ${
              pagination.maxPageNumber > 1
                ? `(showing ${pagination.startIndex + 1}-${Math.min(pagination.endIndex, examples.length)})`
                : ''
            }`}
          </h4>
        </div>
      </div>

      <Pagination
        page={pagination.pageNumber}
        maxPage={pagination.maxPageNumber}
        nextPage={pagination.nextPage}
        previousPage={pagination.previousPage}
      />

      <div id="examplesTableBody">
        {paginatedExamples.map((example) => (
          <SimpleExampleListItem
            key={example.id}
            example={example}
            lessonPopupProps={lessonPopupProps}
          />
        ))}
      </div>

      <Pagination
        page={pagination.pageNumber}
        maxPage={pagination.maxPageNumber}
        nextPage={pagination.nextPage}
        previousPage={pagination.previousPage}
      />
    </div>
  );
}

/**
 * Inline ExampleListItem component for SimpleExampleTable
 * Uses MoreInfoButton as postTextComponent and MoreInfoViewExample for expandable details
 */
function SimpleExampleListItem({
  example,
  lessonPopupProps,
}: {
  example: ExampleWithVocabulary;
  lessonPopupProps: LessonPopup;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const { openContextual, closeContextual, contextual } = useContextualMenu();

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        example={example}
        postTextComponents={[
          <MoreInfoButton
            onClickFunction={onClickMoreInfo}
            isOpen={isMoreInfoOpen}
            key="moreInfoButton"
          />,
        ]}
      />
      <MoreInfoViewExample
        example={example}
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        closeContextual={closeContextual}
        lessonPopup={lessonPopupProps}
      />
    </div>
  );
}
