import React, { useState } from 'react';
import './register.scss';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRegister } from '../../redux/slice/userSlice';
import { Navigate } from 'react-router-dom';
import { isAuthUser } from '../../redux/slice/userSlice';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(isAuthUser);

  const handleAvatarChange = (e) => {
    setAvatarUrl(e.target.value);
  };

  const handleRegister = async () => {
    try {
      const data = { name, email, password, avatarUrl };
      const userData = await dispatch(fetchRegister(data));

      if (!userData.payload) {
        return alert('Не удалось авторизоваться');
      }

      if ('token' in userData.payload) {
        localStorage.setItem('token', userData.payload.token);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="Register">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{ width: '100px', height: '100px', cursor: 'pointer' }}
              src={avatarUrl}
              alt="avatar url"
            />
          </div>
          <form className="form" action="">
            <input
              placeholder="Имя"
              onChange={(e) => setName(e.target.value)}
              type="name"
              className="input"
              required=""
            />
            <input
              placeholder="Почта"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="input"
              required=""
            />
            <input
              placeholder="Пароль"
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              className="input"
              required=""
            />
            <input
              placeholder="URL аватарки"
              onChange={(e) => setAvatarUrl(e.target.value)}
              onChangeCapture={handleAvatarChange}
              value={avatarUrl}
              type="text"
              className="input"
              required=""
            />

            <input
              value="Зарегистрироваться"
              type="button"
              onClick={handleRegister}
              className="login-button"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
