export default function SubSectionHeader({
  title,
  recordCountString,
  isOpen,
  openFunction,
  button,
  sortingComponent,
}: {
  title: string;
  recordCountString: string;
  isOpen: boolean;
  openFunction: (title: string) => void;
  headerSize?: 'h3';
  button?: React.ReactNode;
  sortingComponent?: React.ReactNode;
}) {
  return (
    <div className="sectionHeader">
      <div className="titleWrapper" onClick={() => openFunction(title)}>
        <div
          className="colapsableMenuArrow"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▲
        </div>
        <h3>{title}</h3>
        <p>{recordCountString}</p>
      </div>
      {isOpen && sortingComponent}

      {isOpen && button}
    </div>
  );
}
