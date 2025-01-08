import { useContextualMenu } from '../hooks/useContextualMenu';
import x from '../assets/icons/x.svg';
export default function ContextualControlls() {
  const { closeContextual } = useContextualMenu();
  return (
    <div className="controlls">
      <img
        src={x}
        alt="close popup"
        className="icon"
        onClick={closeContextual}
      />
    </div>
  );
}
