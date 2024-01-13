import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  background: localStorage.getItem('background') ? localStorage.getItem('background') : '',
};

export const backgroundSlice = createSlice({
  name: 'background',
  initialState,
  reducers: {
    setBackground: (state, action) => {
      state.background = action.payload;
      localStorage.setItem('background', state.background);
    },
  },
});

export const { setBackground } = backgroundSlice.actions;

export default backgroundSlice.reducer;
