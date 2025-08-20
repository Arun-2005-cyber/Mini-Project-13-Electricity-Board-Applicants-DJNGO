import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/screens/Home.jsx';
import Header from './components/screens/Header.jsx';
import EditApplicant from './components/screens/EditApplicant.jsx';
import Stats from './components/screens/Stats.jsx';
import LoginScreen from './components/screens/LoginScreen.jsx';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/EditApplicant/:id' element={<EditApplicant />} />
        <Route path='/statisticsCollection/' element={<Stats/>} />
        <Route path='/login/' element={<LoginScreen/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
