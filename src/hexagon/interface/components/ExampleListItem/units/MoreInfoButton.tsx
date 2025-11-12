import '@interface/components/ExampleListItem/units/MoreInfoButton.scss';
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
      <p className="moreInfoText">{isOpen ? 'Collapse' : 'Expand'}</p>
    </button>
  );
}
