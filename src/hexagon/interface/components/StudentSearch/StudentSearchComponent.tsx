import { useStudentSearch } from '@application/units/StudentSearch';

export default function StudentSearchComponent({
  closeMenu,
}: {
  closeMenu: () => void;
}) {
  const { searchStudentOptions, searchString, setSearchString, selectStudent } =
    useStudentSearch({ closeMenu });
  return (
    <div id="searchStudentWrapper">
      <input
        type="text"
        placeholder="Search for a student by name or email"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      {searchStudentOptions.length > 0 && (
        <div id="optionsWrapper">
          <div onClick={() => selectStudent(null)}> – Clear Selection – </div>
          {searchStudentOptions.map((student) => (
            <div
              key={student.emailAddress}
              className="searchResultItem"
              onClick={() => selectStudent(student.emailAddress)}
            >
              {student.name ? `${student.name} -- ` : ''}
              {student.emailAddress}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
