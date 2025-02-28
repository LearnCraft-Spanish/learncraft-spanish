export default function SelectExampleButton({
  recordId,
  selectedExampleId,
  selectExample,
}: {
  recordId: number;
  selectedExampleId: number | null;
  selectExample: (recordId: number) => void;
}) {
  return recordId === selectedExampleId ? (
    <button type="button">Selected</button>
  ) : (
    <button type="button" onClick={() => selectExample(recordId)}>
      Select
    </button>
  );
}
