import './SectionHeader.scss';

export default function SectionHeader({
  title,
  isOpen,
  openFunction,
  button,
  afterTitleComponents,
}: {
  title: string;
  isOpen: boolean;
  openFunction: (title: string) => void;
  button?: React.ReactNode;
  afterTitleComponents?: React.ReactNode[];
}) {
  return (
    <div className="sectionHeader">
      <div className="titleSection">
        <div className="titleWrapper" onClick={() => openFunction(title)}>
          <div
            className="colapsableMenuArrow"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▲
          </div>
          <h2>{title}</h2>
        </div>
        {afterTitleComponents && [...afterTitleComponents]}
      </div>
      {isOpen && button}
    </div>
  );
}
