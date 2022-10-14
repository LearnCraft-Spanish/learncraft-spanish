import './App.css';
import { BrowserRouter, HashRouter, Routes, Route, Navigate} from 'react-router-dom';
import React from 'react';
import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import QuizInterface from './QuizInterface';
import QuizInterfaceNoUpdate from './QuizInterfaceNoUpdate';
import SRSBuilder from './SRSBuilder';
import SimpleQuizApp from './SimpleQuizApp';

function App() {
  return (
    <div className="App">
      <HashRouter>
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
