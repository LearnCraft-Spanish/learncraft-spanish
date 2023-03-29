import './App.css';
import { BrowserRouter, HashRouter, Routes, Route, Navigate} from 'react-router-dom';
import React from 'react';
import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import QuizInterface from './QuizInterface';
import QuizInterfaceNoUpdate from './QuizInterfaceNoUpdate';
import SRSBuilder from './SRSBuilder';
import SimpleQuizApp from './SimpleQuizApp';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  return (
    <div className="App">
      <HashRouter>
      <div className='div-header'>
        <h1>LearnCraft Spanish</h1>
        <LoginButton />
        <LogoutButton />
      </div>
        {isAuthenticated && (<div>
            <img src={user.picture} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>)}
        <Routes>
          <Route exact path='/ExampleRetriever' element={<ExampleRetriever />} />
          <Route exact path='/SRSBuilder' element={<SRSBuilder />} />
          <Route exact path='/QuizInterface' element={<QuizInterface />} />
          <Route exact path='/QuizInterfaceNoUpdate' element={<QuizInterfaceNoUpdate />} />
          <Route exact path='/Menu' element={<Menu /> } />
          <Route exact path='/SimpleQuizApp' element = {<SimpleQuizApp />} />
          <Route exact path='/' element = {<Navigate to ='/Menu'/>}/>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
