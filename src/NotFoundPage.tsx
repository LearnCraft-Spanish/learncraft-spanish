import React from 'react';

import MenuButton from './components/Buttons/MenuButton';

function NotFoundPage(): React.JSX.Element {
  return (
    <div>
      <h3>404: Page Not Found</h3>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}

export default NotFoundPage;
