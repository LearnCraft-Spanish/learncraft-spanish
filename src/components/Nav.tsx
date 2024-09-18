import { useNavigate } from 'react-router-dom'

import logo from '../resources/typelogosmall.png'

import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

export default function Nav(): JSX.Element {
  const navigate = useNavigate()
  return (
    // Correct html tag is <nav> not <div>
    <div
      className={`div-header ${window.location.pathname === '/' ? ' ' : 'notRoot'}`}
    >
      <div className="homeButton" onClick={() => navigate('/')}>
        <img id="logo" src={logo} alt="Learncraft Spanish Logo" />
        <i id="homeIcon" className="fa-solid fa-home"></i>
      </div>
      <LogoutButton />
      <LoginButton />
      {/* <div
        className={`backButton ${window.location.pathname === '/' ? ' ' : 'notRoot'}`}
        onClick={() => navigate('..')}
      >
        <i className="fa-solid fa-reply"></i>
      </div> */}
    </div>
  )
}
