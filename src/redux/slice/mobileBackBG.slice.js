import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mobileBackBG: localStorage.getItem('mobileBackBG') ? localStorage.getItem('mobileBackBG') : '',
};

export const mobileBackBackgroundSlice = createSlice({
  name: 'mobileBackBG',
  initialState,
  reducers: {
    setMobileBackBackground: (state, action) => {
      state.mobileBackBG = action.payload;
      localStorage.setItem('mobileBackBG', action.payload);
    },
  },
});

export const { setMobileBackBackground } = mobileBackBackgroundSlice.actions;

export default mobileBackBackgroundSlice.reducer;
