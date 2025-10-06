import React from 'react';
import { Link } from 'react-router-dom';

function MenuButton(): React.JSX.Element {
  return (
    <Link className="linkButton" to="/">
      Back to Home
    </Link>
  );
}

export default MenuButton;
