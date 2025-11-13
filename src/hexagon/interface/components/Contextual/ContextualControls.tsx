import pencil from '@assets/icons/pencil-50.svg';
import x_dark from '@assets/icons/x_dark.svg';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';

// edit function is an optional prop
export default function ContextualControls({
  editFunction,
}: {
  editFunction?: () => void;
}) {
  const { closeContextual } = useContextualMenu();
  return (
    <div className="controlls">
      {editFunction && (
        <img
          src={pencil}
          alt="edit record"
          className="icon"
          id="editIcon"
          onClick={editFunction}
        />
      )}
      <img
        src={x_dark}
        alt="close popup"
        className="icon"
        onClick={closeContextual}
      />
    </div>
  );
}
