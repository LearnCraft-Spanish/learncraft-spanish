import { useContextualMenu } from 'src/hooks/useContextualMenu';
import x_dark from '../assets/icons/x_dark.svg';
import pencil from '../assets/icons/pencil-50.svg';
export default function ContextualControlls({
  editFunction,
}: {
  editFunction: () => void;
}) {
  const { closeContextual } = useContextualMenu();
  return (
    <div className="controlls">
      <img
        src={pencil}
        alt="edit record"
        className="icon"
        id="editIcon"
        onClick={editFunction}
      />
      <img
        src={x_dark}
        alt="close popup"
        className="icon"
        onClick={closeContextual}
      />
    </div>
  );
}
