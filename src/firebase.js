import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD7IafKM5i5Cd-jVX3RybywfcpO0pqIO9o',
  authDomain: 'chat-b607d.firebaseapp.com',
  projectId: 'chat-b607d',
  storageBucket: 'chat-b607d.appspot.com',
  messagingSenderId: '11321721560',
  appId: '1:11321721560:web:a5bfc3e2bd88660633cdad',
  measurementId: 'G-4SDPQ2YZHM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
