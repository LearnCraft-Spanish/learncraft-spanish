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
      <p>{isOpen ? 'Collapse' : 'Expand'}</p>
    </button>
  );
}
