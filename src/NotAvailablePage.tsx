import { MenuButton } from '@interface/components/general/Buttons';

import React from 'react';

function NotAvailablePage(): React.JSX.Element {
  return (
    <div>
      <h3>Not Available at This Time</h3>
      <div className="buttonBox">
        <MenuButton />
      </div>
    </div>
  );
}

export default NotAvailablePage;
