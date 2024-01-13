import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pageBackground: localStorage.getItem('pageBackground')
    ? localStorage.getItem('pageBackground')
    : `url('https://cdn.wallpapersafari.com/73/33/P9b2gR.jpg')`,
};

export const pageBackgroundSlice = createSlice({
  name: 'pageBackground',
  initialState,
  reducers: {
    setPageBackground: (state, action) => {
      state.pageBackground = action.payload;
      localStorage.setItem('pageBackground', action.payload);
    },
  },
});

export const { setPageBackground } = pageBackgroundSlice.actions;

export default pageBackgroundSlice.reducer;
