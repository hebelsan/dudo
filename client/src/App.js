import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from './elements/Homepage';
import Lobby from './elements/Lobby';
import Game from './elements/Game';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Homepage/>} />
        <Route path='/lobby' element={<Lobby/>} />
        <Route path='/game' element={<Game/>} />
      </Routes>
    </div>
  );
}

export default App;
