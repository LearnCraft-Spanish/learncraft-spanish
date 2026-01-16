export interface SearchByIdsProps {
  input: string;
  onInputChange: (value: string) => void;
}

export function SearchByIds({ input, onInputChange }: SearchByIdsProps) {
  const parsedIds = input
    .split(/[\t\n\r, ]/)
    .map((val) => Number(val.trim()))
    .filter((val) => val > 0 && !Number.isNaN(val));

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData('text');
    // split by comma, tab, space, or newline
    const splitText = pastedText.split(/[\t\n\r, ]/);
    const validIds = splitText.filter(
      (val) => Number(val) > 0 && !Number.isNaN(Number(val)),
    );
    onInputChange(validIds.join(', '));
  };

  return (
    <div className="searchByIdsFilterWrapper">
      <input
        type="text"
        value={input}
        onChange={(event) => {
          // if paste, do nothing
          if (
            (event.nativeEvent as InputEvent).inputType === 'insertFromPaste'
          ) {
            return;
          }
          onInputChange(event.target.value);
        }}
        onPaste={(event) => onPaste(event)}
        placeholder="e.g. 10, 23, 42"
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
      />

      <div style={{ marginBottom: '0.75rem' }}>
        <small>Parsed IDs: {parsedIds.join(', ') || 'None'}</small>
      </div>
    </div>
  );
}
