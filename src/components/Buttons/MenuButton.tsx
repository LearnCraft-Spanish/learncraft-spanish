import React from 'react';
import { Link } from 'react-router-dom';

function MenuButton(): JSX.Element {
  return (
    <Link className="linkButton" to="/">
      Back to Home
    </Link>
  );
}

export default MenuButton;
