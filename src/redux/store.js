import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slice/userSlice';
import backgroundReducer from './slice/backgroundSlice';
import pageBackgroundReducer from './slice/pageBackgroundSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    background: backgroundReducer,
    pageBackground: pageBackgroundReducer,
  },
});
