import ContextualControls from '@interface/components/Contextual/ContextualControls';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';

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
