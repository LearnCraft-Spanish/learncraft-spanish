import { InlineLoading } from 'src/components/Loading';

export default function TextToCheck({
  userInput,
  updateUserInput,
  passageLength,
  comprehensionPercentage,
  isLoading,
}: {
  userInput: string;
  updateUserInput: (value: string) => void;
  passageLength: number;
  comprehensionPercentage: number;
  isLoading: boolean;
}) {
  return (
    <div className="text-to-check">
      <form>
        <h3>Text to Check:</h3>
        <textarea
          value={userInput}
          rows={12}
          cols={85}
          onChange={(e) => updateUserInput(e.target.value)}
        ></textarea>
      </form>
      <div className="text-to-check__stats">
        <p>{`Word Count: ${passageLength}`}</p>
        {isLoading ? (
          <InlineLoading message="fetching updated known words list..." />
        ) : (
          <p>{`Words Known: ${comprehensionPercentage}%`}</p>
        )}
      </div>
    </div>
  );
}
