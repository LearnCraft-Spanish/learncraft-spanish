import './App.css';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';

import ExampleRetriever from './ExampleRetriever';
import Menu from './Menu';
import QuizInterface from './QuizInterface';
import QuizInterfaceNoUpdate from './QuizInterfaceNoUpdate';
import SRSBuilder from './SRSBuilder';

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
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
