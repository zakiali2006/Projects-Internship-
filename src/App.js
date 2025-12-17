import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login';
import Register from './register';
import Page from './page';
import './App.css';

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/page' element={<Page/>}/>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
