import { useContextualMenu } from '../hooks/useContextualMenu';
import x_dark from '../assets/icons/x_dark.svg';
export default function ContextualControlls() {
  const { closeContextual } = useContextualMenu();
  return (
    <div className="controlls">
      <img
        src={x_dark}
        alt="close popup"
        className="icon"
        onClick={closeContextual}
      />
    </div>
  );
}
