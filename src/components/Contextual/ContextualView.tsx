import ContextualControls from 'src/components/ContextualControls';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function ContextualView({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setContextualRef } = useContextualMenu();
  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />
        {children}
      </div>
    </div>
  );
}
