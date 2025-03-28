import { useContextualMenu } from 'src/hooks/useContextualMenu';
import ContextualControls from './ContextualControls';

export default function ContextualView({
  editFunction,
  children,
}: {
  editFunction?: () => void;
  children: React.ReactNode;
}) {
  const { setContextualRef } = useContextualMenu();
  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls editFunction={editFunction} />
        {children}
      </div>
    </div>
  );
}
