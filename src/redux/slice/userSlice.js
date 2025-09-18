import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../.././axios";

export const fetchLogin = createAsyncThunk(
  "user/fetchLogin",
  async (params) => {
    const res = await axios.post("/signIn", params);
    return res.data;
  }
);

export const fetchRegister = createAsyncThunk(
  "user/fetchRegister",
  async (params) => {
    const res = await axios.post("/signUp", params);
    return res.data;
  }
);

export const fetchAuthMe = createAsyncThunk("user/fetchAuthMe", async () => {
  const res = await axios.get("/user/getMe");
  return res.data;
});

const initialState = {
  currentUser: null,
  isLoading: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder.addCase(fetchLogin.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchLogin.rejected, (state) => {
      state.isLoading = true;
      state.currentUser = null;
    });
    // register
    builder.addCase(fetchRegister.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchRegister.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchRegister.rejected, (state) => {
      state.isLoading = true;
      state.currentUser = null;
    });
    // get me
    builder.addCase(fetchAuthMe.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAuthMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchAuthMe.rejected, (state) => {
      state.isLoading = true;
      state.currentUser = null;
    });
  },
});

export const isAuthUser = (state) => Boolean(state.user.currentUser);

export const { logout } = userSlice.actions;

export default userSlice.reducer;
