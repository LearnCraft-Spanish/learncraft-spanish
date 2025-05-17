import type { WordCount } from 'src/hexagon/application/types/frequensay';

export default function UnknownWords({
  unknownWordCount,
  copyUnknownWordsTable,
}: {
  unknownWordCount: WordCount[];
  copyUnknownWordsTable: () => void;
}) {
  return (
    unknownWordCount.length > 0 && (
      <div className="unknown-words">
        <h3>{`${unknownWordCount.length} Unknown Words:`}</h3>
        <div className="buttonBox">
          <button type="button" onClick={copyUnknownWordsTable}>
            Copy Word List
          </button>
        </div>
        {unknownWordCount.map((item) => (
          <div className="exampleCard" key={item.word}>
            <div className="exampleCardSpanishText">
              <h3>{item.word}</h3>
            </div>
            <div className="exampleCardEnglishText">
              <h4>{item.count}</h4>
            </div>
          </div>
        ))}
      </div>
    )
  );
}
