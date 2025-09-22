import { MenuButton } from '@interface/components/general/Buttons';

import React from 'react';

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
