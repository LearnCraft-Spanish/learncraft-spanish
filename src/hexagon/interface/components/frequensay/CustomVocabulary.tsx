import useCustomVocabulary from 'src/hexagon/application/useCases/useCustomVocabulary';

export default function CustomVocabulary() {
  const {
    addManualVocabulary,
    disableManualVocabulary,
    enableManualVocabulary,

    userAddedVocabulary,
    setUserAddedVocabulary,
  } = useCustomVocabulary();

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
