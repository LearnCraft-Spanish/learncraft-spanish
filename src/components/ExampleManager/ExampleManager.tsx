import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useState } from 'react';
import ExampleSetCreator from './ExampleSetCreator';
import SingleExampleCreator from './SingleExampleCreator';
import 'src/App.css';
import './ExampleManager.css';

export default function ExampleManager() {
  const { isAdmin, isCoach } = useAuthAdapter();
  const hasAccess = isAdmin || isCoach;
  const hasEditAccess = isAdmin;
  const [singleOrSet, setSingleOrSet] = useState<'single' | 'set'>('set');

  const toggleSingleOrSet = () => {
    setSingleOrSet((prev) => (prev === 'single' ? 'set' : 'single'));
  };

  return (
    <div>
      <h2>Example Manager</h2>
      <div className="buttonBox" id="singleOrSet">
        <button type="button" onClick={toggleSingleOrSet}>
          {singleOrSet === 'single'
            ? 'Create Example Set'
            : 'Create/Edit Single Example'}
        </button>
      </div>

      {singleOrSet === 'single' ? (
        <SingleExampleCreator hasEditAccess={hasEditAccess} />
      ) : (
        <ExampleSetCreator hasAccess={hasAccess} />
      )}
    </div>
  );
}
