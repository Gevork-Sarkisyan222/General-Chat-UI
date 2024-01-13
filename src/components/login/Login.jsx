import React, { useEffect, useState } from 'react';
import './login.scss';
import { Link } from 'react-router-dom';
import axios from '../../axios';
import { fetchLogin } from '../../redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { isAuthUser } from '../../redux/slice/userSlice';
import { Navigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isAuthenticated = useSelector(isAuthUser);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const data = { email, password };
      const userData = await dispatch(fetchLogin(data));

      if (!userData.payload) {
        return alert('Не удалось авторизоваться');
      }

      if ('token' in userData.payload) {
        localStorage.setItem('token', userData.payload.token);
      }
    } catch (err) {
      console.warn(err);
      alert('Такого пользователья не существует ');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <div className="Login">
        <div class="container">
          <div class="heading">Авторизация в чат</div>
          <form class="form" action="">
            <input
              placeholder="Почта"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              class="input"
              required=""
            />
            <input
              placeholder="Пароль"
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              type="password"
              class="input"
              required=""
            />
            <span class="forgot-password">
              <a href="#">Забыл пароль?</a>
            </span>
            <input value="Войти" type="button" onClick={handleLogin} class="login-button" />
          </form>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <h2>
              <Link to="/register" style={{ color: '#18a4f7' }}>
                Создать аккаунт
              </Link>
            </h2>
          </div>
          <span class="agreement">
            <a href="#">Learn user licence agreement</a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
