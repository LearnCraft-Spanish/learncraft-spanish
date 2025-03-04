import React, { useState } from 'react';
import { useUserData } from 'src/hooks/UserData/useUserData';
import ExampleSetCreator from './ExampleSetCreator';
import SingleExampleCreator from './SingleExampleCreator';
import 'src/App.css';
import './ExampleCreator.css';

export default function ExampleCreator() {
  const [singleOrSet, setSingleOrSet] = useState<'single' | 'set'>('set');
  const userDataQuery = useUserData();
  const adminRole = userDataQuery.data?.roles.adminRole;
  const hasAccess = adminRole === 'admin' || adminRole === 'coach';

  const toggleSingleOrSet = () => {
    setSingleOrSet((prev) => (prev === 'single' ? 'set' : 'single'));
  };

  return (
    <div>
      <h2>Example Creator</h2>
      <div className="buttonBox" id="singleOrSet">
        <button type="button" onClick={toggleSingleOrSet}>
          {singleOrSet === 'single' ? 'Create Set' : 'Create Single Example'}
        </button>
      </div>

      {singleOrSet === 'single' ? (
        <SingleExampleCreator />
      ) : (
        <ExampleSetCreator hasAccess={hasAccess} />
      )}
    </div>
  );
}
