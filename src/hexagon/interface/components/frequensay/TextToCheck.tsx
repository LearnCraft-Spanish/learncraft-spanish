export default function TextToCheck({
  userInput,
  updateUserInput,
  passageLength,
  comprehensionPercentage,
}: {
  userInput: string;
  updateUserInput: (value: string) => void;
  passageLength: number;
  comprehensionPercentage: number;
}) {
  return (
    <div>
      <form>
        <h3>Text to Check:</h3>
        <textarea
          value={userInput}
          rows={12}
          cols={85}
          onChange={(e) => updateUserInput(e.target.value)}
        ></textarea>
      </form>
      <div>
        <p>{`Word Count: ${passageLength}`}</p>
        <p>{`Words Known: ${comprehensionPercentage}%`}</p>
      </div>
    </div>
  );
}
