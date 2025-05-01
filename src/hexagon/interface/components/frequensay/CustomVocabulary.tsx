export default function CustomVocabulary({
  addManualVocabulary,
  disableManualVocabulary,
  enableManualVocabulary,

  userAddedVocabulary,
  setUserAddedVocabulary,
}: {
  addManualVocabulary: boolean;
  disableManualVocabulary: () => void;
  enableManualVocabulary: () => void;
  userAddedVocabulary: string;
  setUserAddedVocabulary: (value: string) => void;
}) {
  return (
    <>
      <div className="buttonBox">
        {!addManualVocabulary && (
          <button
            type="button"
            className="greenButton"
            onClick={enableManualVocabulary}
          >
            Add Extra Vocabulary
          </button>
        )}
        {addManualVocabulary && (
          <button
            type="button"
            className="'redButton"
            onClick={disableManualVocabulary}
          >
            Cancel Extra Vocabulary
          </button>
        )}
      </div>
      {addManualVocabulary && (
        <form onSubmit={(e) => e.preventDefault}>
          <h3>Extra Vocabulary:</h3>
          <textarea
            value={userAddedVocabulary}
            rows={7}
            cols={25}
            onChange={(e) => setUserAddedVocabulary(e.target.value)}
          ></textarea>
        </form>
      )}
    </>
  );
}
