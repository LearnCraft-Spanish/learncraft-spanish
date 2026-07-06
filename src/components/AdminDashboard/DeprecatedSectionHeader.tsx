export default function DeprecatedSectionHeader({ title }: { title: string }) {
  return (
    <div className="sectionHeader sectionHeader--deprecated">
      <div className="titleWrapper">
        <div className="colapsableMenuArrow">▲</div>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
