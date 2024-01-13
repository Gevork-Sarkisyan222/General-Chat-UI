import React from 'react';
import Navbar from './components/Navbar';
import './App.scss';
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Home from './components/Home';
import { fetchAuthMe } from './redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  const { pageBackground } = useSelector((state) => state.pageBackground);
  console.log(pageBackground);

  React.useEffect(() => {
    dispatch(fetchAuthMe());
  }, []);

  React.useEffect(() => {
    document.body.style.backgroundImage = pageBackground;

    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [pageBackground]);

  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
