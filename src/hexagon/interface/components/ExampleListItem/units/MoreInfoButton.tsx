import type { ExampleRecord } from '@LearnCraft-Spanish/shared';

export default function MoreInfoButton({
  _example,
  onClickFunction,
  isOpen,
}: {
  _example: ExampleRecord;
  onClickFunction: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      className={`moreInfo ${isOpen ? 'open' : 'closed'}`}
      onClick={onClickFunction}
    >
      {/* <span className={`moreInfoArrow ${isOpen ? 'open' : 'closed'}`}>
        {/* This should be a better icon ^
      </span> */}
      <p>{isOpen ? 'Collapse' : 'Expand'}</p>
    </button>
  );
}
