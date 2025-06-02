export default function SelectButton({
  recordId,
  selectedExampleId,
  selectExample,
}: {
  recordId: number;
  selectedExampleId: number | null;
  selectExample: (recordId: number | null) => void;
}) {
  const isSelected = recordId === selectedExampleId;

  const handleButtonClick = () => {
    if (isSelected) {
      selectExample(null); // Deselect the example
    } else {
      selectExample(recordId); // Select the example
    }
  };

  return (
    <button type="button" onClick={handleButtonClick}>
      {isSelected ? 'Deselect' : 'Select'}
    </button>
  );
}
