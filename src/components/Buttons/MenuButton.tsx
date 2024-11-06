import React from 'react';
import LinkWithQuery from '../LinkWithQuery';

function MenuButton(): JSX.Element {
  return (
    <LinkWithQuery className="linkButton" to="/">
      Back to Menu
    </LinkWithQuery>
  );
}

export default MenuButton;
