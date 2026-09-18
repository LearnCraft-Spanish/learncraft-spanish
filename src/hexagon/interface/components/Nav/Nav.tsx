import type { JSX } from 'react';
import { LogoutButton } from '@interface/components/general/Buttons';
import { Link, useLocation } from 'react-router-dom';

import home from 'src/assets/icons/home.svg';
import logo from 'src/assets/typelogosmall.png';

/**
 * Legacy top bar for v1 viewers. `App` mounts this only after auth and
 * myData have resolved and `useStudentUiVersion` is `'v1'`.
 */
export default function Nav(): JSX.Element {
  const { pathname } = useLocation();
  return (
    <div className={`div-header ${pathname === '/' ? ' ' : 'notRoot'}`}>
      <Link to="/" className="homeButton" aria-description="home navigation">
        <img id="logo" src={logo} alt="Learncraft Spanish Logo" />
        <img src={home} alt="" id="homeIcon" />
      </Link>
      <LogoutButton />
    </div>
  );
}
