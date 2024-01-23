import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://chat-server-npm9.onrender.com',
});

// simple commit

instance.interceptors.request.use((config) => {
  config.headers.Authorization = window.localStorage.getItem('token');
  return config;
});

export default instance;
