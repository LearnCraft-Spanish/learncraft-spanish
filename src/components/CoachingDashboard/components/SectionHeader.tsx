import up_arrow from 'src/assets/icons/arrow-up.svg';

interface colaspableMenuObject {
  sectionTitle: string;
  colapsableMenuOpen: boolean;
}

export default function SectionHeader({
  title,
  colapsableMenuObject,
  setColapsableMenuOpen,
}: {
  title: string;
  colapsableMenuObject: colaspableMenuObject;
  setColapsableMenuOpen: (open: boolean, title: string) => void;
}) {
  return (
    <div
      className="sectionHeader"
      onClick={() =>
        setColapsableMenuOpen(!colapsableMenuObject.colapsableMenuOpen, title)
      }
    >
      <div
        className="colapsableMenuArrow"
        style={{
          transform: colapsableMenuObject.colapsableMenuOpen
            ? 'rotate(180deg)'
            : 'rotate(0deg)',
        }}
      >
        ▲
      </div>
      <h2>{title}</h2>
    </div>
  );
}
