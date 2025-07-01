export default function MoreInfoButton({
  onClickFunction,
  isOpen,
}: {
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
